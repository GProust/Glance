export enum SourceType {
  REPO = 'REPO',
  NEWS = 'NEWS',
  SOCIAL = 'SOCIAL',
}

export enum SourceProvider {
  GITHUB = 'GITHUB',
  RSS = 'RSS',
  X = 'X',
  LINKEDIN = 'LINKEDIN',
}

export interface SourceProps {
  id?: string;
  userId: string;
  type: SourceType;
  provider: SourceProvider;
  displayName: string;
  isActive?: boolean;
  recurrenceInterval?: string;
  config?: Record<string, any>;
  lastFetchedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Source {
  private readonly _id?: string;
  private readonly _userId: string;
  private readonly _type: SourceType;
  private readonly _provider: SourceProvider;
  private _displayName: string;
  private _isActive: boolean;
  private _recurrenceInterval: string;
  private _config: Record<string, any>;
  private _lastFetchedAt?: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: SourceProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._type = props.type;
    this._provider = props.provider;
    this._displayName = props.displayName;
    this._isActive = props.isActive ?? true;
    this._recurrenceInterval = props.recurrenceInterval || '1 hour';
    this._config = props.config || {};
    this._lastFetchedAt = props.lastFetchedAt;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get type(): SourceType {
    return this._type;
  }

  get provider(): SourceProvider {
    return this._provider;
  }

  get displayName(): string {
    return this._displayName;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get recurrenceInterval(): string {
    return this._recurrenceInterval;
  }

  get config(): Record<string, any> {
    return this._config;
  }

  get lastFetchedAt(): Date | undefined {
    return this._lastFetchedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
