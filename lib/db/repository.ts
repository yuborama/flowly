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
  title: string;
  completed: boolean;
  ownerId: string;
  sharedWith: string[];
  attachmentUri?: string;
  updatedAt: number;
  isSynced: boolean;
};

const usersCollection = database.get<UserModel>('users');
const friendsCollection = database.get<FriendModel>('friends');
const tasksCollection = database.get<TaskModel>('tasks');

const parseSharedWith = (value?: string): string[] => {
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
  title: record.title,
  completed: record.completed,
  ownerId: record.ownerId,
  sharedWith: parseSharedWith(record.sharedWithRaw),
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
  title: string;
  ownerId: string;
  completed?: boolean;
  sharedWith?: string[];
  attachmentUri?: string;
}): Promise<TaskEntity> {
  const created = await database.write(async () => {
    return tasksCollection.create((record) => {
      record._raw.id = generateId();
      record.title = input.title;
      record.completed = input.completed ?? false;
      record.ownerId = input.ownerId;
      record.sharedWithRaw = JSON.stringify(input.sharedWith ?? []);
      record.attachmentUri = input.attachmentUri;
      record.updatedAt = Date.now();
      record.isSynced = false;
    });
  });

  return toTaskEntity(created);
}

export async function updateTask(
  taskId: string,
  patch: Partial<Pick<TaskEntity, 'title' | 'completed' | 'sharedWith' | 'attachmentUri'>>
): Promise<TaskEntity | null> {
  try {
    const task = await tasksCollection.find(taskId);

    await database.write(async () => {
      await task.update((record) => {
        if (patch.title !== undefined) {
          record.title = patch.title;
        }
        if (patch.completed !== undefined) {
          record.completed = patch.completed;
        }
        if (patch.sharedWith !== undefined) {
          record.sharedWithRaw = JSON.stringify(patch.sharedWith);
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

export async function resetAllData(): Promise<void> {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
}
