import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import { FriendModel } from '@/lib/db/models/Friend';
import { TaskModel } from '@/lib/db/models/Task';
import { UserModel } from '@/lib/db/models/User';
import { flowlySchema } from '@/lib/db/schema';

const adapter = new LokiJSAdapter({
  schema: flowlySchema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: (error) => {
    console.warn('WatermelonDB setup error', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [UserModel, FriendModel, TaskModel],
});
