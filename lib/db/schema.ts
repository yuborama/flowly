import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const flowlySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'friends',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'completed', type: 'boolean' },
        { name: 'owner_id', type: 'string' },
        { name: 'shared_with', type: 'string', isOptional: true },
        { name: 'attachment_uri', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
      ],
    }),
  ],
});
