import { Model } from '@nozbe/watermelondb';

export class TaskModel extends Model {
  static table = 'tasks';

  get title(): string {
    return this._getRaw('title') as string;
  }

  set title(value: string) {
    this._setRaw('title', value);
  }

  get description(): string {
    return (this._getRaw('description') as string) ?? '';
  }

  set description(value: string) {
    this._setRaw('description', value ?? null);
  }

  get completed(): boolean {
    return this._getRaw('completed') as boolean;
  }

  set completed(value: boolean) {
    this._setRaw('completed', value);
  }

  get ownerId(): string {
    return this._getRaw('owner_id') as string;
  }

  set ownerId(value: string) {
    this._setRaw('owner_id', value);
  }

  get dueDate(): number | undefined {
    return this._getRaw('due_date') as number | undefined;
  }

  set dueDate(value: number | undefined) {
    this._setRaw('due_date', value ?? null);
  }

  get priority(): string {
    return (this._getRaw('priority') as string) ?? 'medium';
  }

  set priority(value: string) {
    this._setRaw('priority', value);
  }

  get sharedWithRaw(): string {
    return (this._getRaw('shared_with') as string) ?? '[]';
  }

  set sharedWithRaw(value: string) {
    this._setRaw('shared_with', value);
  }

  get photoUrlsRaw(): string {
    return (this._getRaw('photo_urls') as string) ?? '[]';
  }

  set photoUrlsRaw(value: string) {
    this._setRaw('photo_urls', value);
  }

  get attachmentUri(): string | undefined {
    return this._getRaw('attachment_uri') as string | undefined;
  }

  set attachmentUri(value: string | undefined) {
    this._setRaw('attachment_uri', value ?? null);
  }

  get updatedAt(): number {
    return this._getRaw('updated_at') as number;
  }

  set updatedAt(value: number) {
    this._setRaw('updated_at', value);
  }

  get isSynced(): boolean {
    return this._getRaw('is_synced') as boolean;
  }

  set isSynced(value: boolean) {
    this._setRaw('is_synced', value);
  }
}
