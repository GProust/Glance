export interface ContentItemProps {
  id?: string;
  sourceId: string;
  externalId: string;
  originUrl?: string;
  title?: string;
  summary?: string;
  rawContent?: string;
  publishedAt?: Date;
  fetchedAt?: Date;
  trustLevel?: number;
  isAiGenerated?: boolean;
  metadata?: Record<string, unknown>;
}

export class ContentItem {
  private readonly _id?: string;
  private readonly _sourceId: string;
  private readonly _externalId: string;
  private readonly _originUrl?: string;
  private readonly _title?: string;
  private readonly _summary?: string;
  private readonly _rawContent?: string;
  private readonly _publishedAt?: Date;
  private readonly _fetchedAt: Date;
  private readonly _trustLevel?: number;
  private readonly _isAiGenerated: boolean;
  private readonly _metadata: Record<string, unknown>;

  constructor(props: ContentItemProps) {
    this._id = props.id;
    this._sourceId = props.sourceId;
    this._externalId = props.externalId;
    this._originUrl = props.originUrl;
    this._title = props.title;
    this._summary = props.summary;
    this._rawContent = props.rawContent;
    this._publishedAt = props.publishedAt;
    this._fetchedAt = props.fetchedAt || new Date();
    this._trustLevel = props.trustLevel;
    this._isAiGenerated = props.isAiGenerated ?? false;
    this._metadata = props.metadata || {};

    if (this._trustLevel !== undefined && (this._trustLevel < 0 || this._trustLevel > 100)) {
      throw new Error('Trust level must be between 0 and 100');
    }
  }

  get id(): string | undefined {
    return this._id;
  }

  get sourceId(): string {
    return this._sourceId;
  }

  get externalId(): string {
    return this._externalId;
  }

  get originUrl(): string | undefined {
    return this._originUrl;
  }

  get title(): string | undefined {
    return this._title;
  }

  get summary(): string | undefined {
    return this._summary;
  }

  get rawContent(): string | undefined {
    return this._rawContent;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get fetchedAt(): Date {
    return this._fetchedAt;
  }

  get trustLevel(): number | undefined {
    return this._trustLevel;
  }

  get isAiGenerated(): boolean {
    return this._isAiGenerated;
  }

  get metadata(): Record<string, unknown> {
    return this._metadata;
  }
}
