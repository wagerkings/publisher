// Connector type definitions

export interface Connector {
  authenticate(): Promise<void>;
  postImage(options: {
    social: string;
    type: string;
    filePath: string;
    caption?: string;
  }): Promise<{ remoteId: string }>;
}

export interface ConnectorConfig {
  enabled: boolean;
  [key: string]: unknown;
}

