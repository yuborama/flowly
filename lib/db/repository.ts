import { Q } from '@nozbe/watermelondb';

import { database } from '@/lib/db/database';
import { FriendModel } from '@/lib/db/models/Friend';
import { TaskModel } from '@/lib/db/models/Task';
import { UserModel } from '@/lib/db/models/User';
import { generateId } from '@/lib/utils/id';

export type UserEntity = {
  id: string;
  name: string;
};

export type FriendEntity = {
  id: string;
  name: string;
};

export type TaskEntity = {
  id: string;
  remoteId?: number;
  title: string;
  description: string;
  dueDate?: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  ownerId: string;
  sharedWith: string[];
  photoUrls: string[];
  attachmentUri?: string;
  updatedAt: number;
  isSynced: boolean;
};

const usersCollection = database.get<UserModel>('users');
const friendsCollection = database.get<FriendModel>('friends');
const tasksCollection = database.get<TaskModel>('tasks');

const parseStringArray = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
    return [];
  } catch {
    return [];
  }
};

const toUserEntity = (record: UserModel): UserEntity => ({
  id: record.id,
  name: record.name,
});

const toFriendEntity = (record: FriendModel): FriendEntity => ({
  id: record.id,
  name: record.name,
});

const toTaskEntity = (record: TaskModel): TaskEntity => ({
  id: record.id,
  remoteId: record.remoteId,
  title: record.title,
  description: record.description,
  dueDate: record.dueDate,
  priority: (record.priority as TaskEntity['priority']) ?? 'medium',
  completed: record.completed,
  ownerId: record.ownerId,
  sharedWith: parseStringArray(record.sharedWithRaw),
  photoUrls: parseStringArray(record.photoUrlsRaw),
  attachmentUri: record.attachmentUri,
  updatedAt: record.updatedAt,
  isSynced: record.isSynced,
});

export async function getCurrentUser(): Promise<UserEntity | null> {
  const users = await usersCollection.query().fetch();
  return users.length > 0 ? toUserEntity(users[0]) : null;
}

export async function registerUser(name: string): Promise<UserEntity> {
  const existingUser = await getCurrentUser();
  if (existingUser) {
    return existingUser;
  }

  const createdUser = await database.write(async () => {
    return usersCollection.create((record) => {
      record._raw.id = generateId();
      record.name = name;
      record.createdAt = Date.now();
    });
  });

  return toUserEntity(createdUser);
}

export async function listFriends(): Promise<FriendEntity[]> {
  const friends = await friendsCollection.query(Q.sortBy('created_at', Q.asc)).fetch();
  return friends.map(toFriendEntity);
}

export async function addFriend(name: string): Promise<FriendEntity> {
  const created = await database.write(async () => {
    return friendsCollection.create((record) => {
      record._raw.id = generateId();
      record.name = name;
      record.createdAt = Date.now();
    });
  });

  return toFriendEntity(created);
}

export async function listTasksByOwner(ownerId: string): Promise<TaskEntity[]> {
  const tasks = await tasksCollection
    .query(Q.where('owner_id', ownerId), Q.sortBy('updated_at', Q.desc))
    .fetch();

  return tasks.map(toTaskEntity);
}

export async function addTask(input: {
  remoteId?: number;
  title: string;
  description?: string;
  dueDate?: number;
  priority?: TaskEntity['priority'];
  ownerId: string;
  completed?: boolean;
  sharedWith?: string[];
  photoUrls?: string[];
  attachmentUri?: string;
}): Promise<TaskEntity> {
  const created = await database.write(async () => {
    return tasksCollection.create((record) => {
      record._raw.id = generateId();
      record.remoteId = input.remoteId;
      record.title = input.title;
      record.description = input.description ?? '';
      record.completed = input.completed ?? false;
      record.ownerId = input.ownerId;
      record.dueDate = input.dueDate;
      record.priority = input.priority ?? 'medium';
      record.sharedWithRaw = JSON.stringify(input.sharedWith ?? []);
      record.photoUrlsRaw = JSON.stringify(input.photoUrls ?? []);
      record.attachmentUri = input.attachmentUri;
      record.updatedAt = Date.now();
      record.isSynced = false;
    });
  });

  return toTaskEntity(created);
}

export async function updateTask(
  taskId: string,
  patch: Partial<
    Pick<TaskEntity, 'title' | 'description' | 'dueDate' | 'priority' | 'completed' | 'sharedWith' | 'photoUrls' | 'attachmentUri'>
  >
): Promise<TaskEntity | null> {
  try {
    const task = await tasksCollection.find(taskId);

    await database.write(async () => {
      await task.update((record) => {
        if (patch.title !== undefined) {
          record.title = patch.title;
        }
        if (patch.description !== undefined) {
          record.description = patch.description;
        }
        if (patch.dueDate !== undefined) {
          record.dueDate = patch.dueDate;
        }
        if (patch.priority !== undefined) {
          record.priority = patch.priority;
        }
        if (patch.completed !== undefined) {
          record.completed = patch.completed;
        }
        if (patch.sharedWith !== undefined) {
          record.sharedWithRaw = JSON.stringify(patch.sharedWith);
        }
        if (patch.photoUrls !== undefined) {
          record.photoUrlsRaw = JSON.stringify(patch.photoUrls);
        }
        if (patch.attachmentUri !== undefined) {
          record.attachmentUri = patch.attachmentUri;
        }
        record.updatedAt = Date.now();
        record.isSynced = false;
      });
    });

    return toTaskEntity(task);
  } catch {
    return null;
  }
}

type DummyTodosResponse = {
  todos: {
    id: number;
    todo: string;
    completed: boolean;
  }[];
};

export async function syncTasksFromApi(ownerId: string): Promise<void> {
  const response = await fetch('https://dummyjson.com/todos');
  if (!response.ok) {
    throw new Error(`Sync failed with status ${response.status}`);
  }

  const payload = (await response.json()) as DummyTodosResponse;

  await database.write(async () => {
    for (const todo of payload.todos) {
      const existing = await tasksCollection
        .query(Q.where('owner_id', ownerId), Q.where('remote_id', todo.id))
        .fetch();

      if (existing.length > 0) {
        await existing[0].update((record) => {
          record.title = todo.todo;
          record.completed = todo.completed;
          record.updatedAt = Date.now();
          record.isSynced = true;
        });
        continue;
      }

      await tasksCollection.create((record) => {
        record._raw.id = generateId();
        record.remoteId = todo.id;
        record.title = todo.todo;
        record.description = '';
        record.completed = todo.completed;
        record.ownerId = ownerId;
        record.priority = 'medium';
        record.sharedWithRaw = '[]';
        record.photoUrlsRaw = '[]';
        record.updatedAt = Date.now();
        record.isSynced = true;
      });
    }
  });
}

export async function resetAllData(): Promise<void> {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
}
