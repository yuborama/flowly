import { Model } from '@nozbe/watermelondb';

export class UserModel extends Model {
  static table = 'users';

  get name(): string {
    return this._getRaw('name') as string;
  }

  set name(value: string) {
    this._setRaw('name', value);
  }

  get createdAt(): number {
    return this._getRaw('created_at') as number;
  }

  set createdAt(value: number) {
    this._setRaw('created_at', value);
  }
}
