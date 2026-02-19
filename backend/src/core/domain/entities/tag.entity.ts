export interface TagProps {
  id?: string;
  name: string;
  isGlobal?: boolean;
  createdAt?: Date;
}

export class Tag {
  private readonly _id?: string;
  private readonly _name: string;
  private readonly _isGlobal: boolean;
  private readonly _createdAt: Date;

  constructor(props: TagProps) {
    this._id = props.id;
    this._name = props.name;
    this._isGlobal = props.isGlobal || false;
    this._createdAt = props.createdAt || new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get isGlobal(): boolean {
    return this._isGlobal;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
