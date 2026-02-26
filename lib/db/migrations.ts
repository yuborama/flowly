import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const flowlyMigrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'tasks',
          columns: [
            { name: 'description', type: 'string', isOptional: true },
            { name: 'due_date', type: 'number', isOptional: true },
            { name: 'priority', type: 'string', isOptional: true },
            { name: 'photo_urls', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'tasks',
          columns: [{ name: 'remote_id', type: 'number', isOptional: true }],
        }),
      ],
    },
  ],
});
