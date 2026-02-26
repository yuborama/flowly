import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import { flowlyMigrations } from "@/lib/db/migrations";
import { FriendModel } from "@/lib/db/models/Friend";
import { TaskModel } from "@/lib/db/models/Task";
import { UserModel } from "@/lib/db/models/User";
import { flowlySchema } from "@/lib/db/schema";

const adapter = new SQLiteAdapter({
  dbName: "flowly",
  schema: flowlySchema,
  migrations: flowlyMigrations,
  onSetUpError: (error) => {
    console.warn("WatermelonDB setup error (native/sqlite)", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [UserModel, FriendModel, TaskModel],
});
