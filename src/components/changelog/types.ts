export interface SystemRelease {
  id: string;
  version: string;
  product: string;
  title: string | null;
  body: string | null;
  releasedAt: string;
}

export interface SaasChangelogListResponse {
  systemReleases: SystemRelease[];
  systemReleasesCount: number;
}

export interface SaasChangelogListVariables {
  take: number;
  skip: number;
}
