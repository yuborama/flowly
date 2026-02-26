import { create } from 'zustand';

import {
  addFriend as addFriendInDb,
  addTask as addTaskInDb,
  FriendEntity,
  getCurrentUser,
  listFriends,
  listTasksByOwner,
  registerUser as registerUserInDb,
  resetAllData,
  TaskEntity,
  updateTask as updateTaskInDb,
  UserEntity,
} from '@/lib/db/repository';

export type TaskFilter = 'all' | 'completed' | 'pending' | 'shared';

type AddTaskInput = {
  title: string;
  description?: string;
  dueDate?: number;
  priority?: TaskEntity['priority'];
  completed?: boolean;
  sharedWith?: string[];
  photoUrls?: string[];
  attachmentUri?: string;
};

type UpdateTaskInput = Partial<
  Pick<TaskEntity, 'title' | 'description' | 'dueDate' | 'priority' | 'completed' | 'sharedWith' | 'photoUrls' | 'attachmentUri'>
>;

type AppState = {
  isHydrated: boolean;
  user: UserEntity | null;
  friends: FriendEntity[];
  tasks: TaskEntity[];
  taskFilter: TaskFilter;
  bootstrap: () => Promise<void>;
  registerUser: (name: string) => Promise<void>;
  addFriend: (name: string) => Promise<void>;
  addTask: (input: AddTaskInput) => Promise<void>;
  updateTask: (taskId: string, patch: UpdateTaskInput) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  setTaskFilter: (filter: TaskFilter) => void;
  filteredTasks: () => TaskEntity[];
  resetData: () => Promise<void>;
};

async function loadDashboardData(userId: string) {
  const [friends, tasks] = await Promise.all([listFriends(), listTasksByOwner(userId)]);
  return { friends, tasks };
}

export const useAppStore = create<AppState>((set, get) => ({
  isHydrated: false,
  user: null,
  friends: [],
  tasks: [],
  taskFilter: 'all',

  bootstrap: async () => {
    const user = await getCurrentUser();

    if (!user) {
      set({
        isHydrated: true,
        user: null,
        friends: [],
        tasks: [],
      });
      return;
    }

    const { friends, tasks } = await loadDashboardData(user.id);
    set({
      isHydrated: true,
      user,
      friends,
      tasks,
    });
  },

  registerUser: async (name: string) => {
    const user = await registerUserInDb(name.trim());
    const { friends, tasks } = await loadDashboardData(user.id);
    set({
      isHydrated: true,
      user,
      friends,
      tasks,
    });
  },

  addFriend: async (name: string) => {
    await addFriendInDb(name.trim());
    const user = get().user;
    if (!user) {
      return;
    }
    const { friends } = await loadDashboardData(user.id);
    set({ friends });
  },

  addTask: async (input: AddTaskInput) => {
    const user = get().user;
    if (!user) {
      return;
    }
    await addTaskInDb({
      ...input,
      title: input.title.trim(),
      ownerId: user.id,
    });

    const tasks = await listTasksByOwner(user.id);
    set({ tasks });
  },

  updateTask: async (taskId: string, patch: UpdateTaskInput) => {
    const user = get().user;
    if (!user) {
      return;
    }
    await updateTaskInDb(taskId, patch);
    const tasks = await listTasksByOwner(user.id);
    set({ tasks });
  },

  toggleTask: async (taskId: string) => {
    const task = get().tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }
    await get().updateTask(taskId, { completed: !task.completed });
  },

  setTaskFilter: (filter: TaskFilter) => {
    set({ taskFilter: filter });
  },

  filteredTasks: () => {
    const { taskFilter, tasks } = get();
    switch (taskFilter) {
      case 'completed':
        return tasks.filter((task) => task.completed);
      case 'pending':
        return tasks.filter((task) => !task.completed);
      case 'shared':
        return tasks.filter((task) => task.sharedWith.length > 0);
      case 'all':
      default:
        return tasks;
    }
  },

  resetData: async () => {
    await resetAllData();
    set({
      isHydrated: true,
      user: null,
      friends: [],
      tasks: [],
      taskFilter: 'all',
    });
  },
}));
