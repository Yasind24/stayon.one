export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  features: string[];
  requiredScopes: string[];
}

export interface ConnectedPlatform extends Platform {
  connected: boolean;
  accountName?: string;
  accountId?: string;
  lastSync?: string;
  error?: string;
}

export interface PlatformConnection {
  id: string;
  platformId: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  accountName: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}