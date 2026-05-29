export type RecordType = "donation" | "kindness" | "open_source";
export type LocaleCode = "en" | "zh";

export type GoodwillRecord = {
  id: string;
  type: RecordType;
  title: string;
  content: string;
  reflection?: string;
  date: string;
  authorUsername: string;
  authorDisplayName: string;
  isAnonymous: boolean;
  amountHidden?: boolean;
  organizationName?: string;
  platformName?: string;
  projectUrl?: string;
  tags: string[];
  language: LocaleCode;
};

export type UserProfile = {
  username: string;
  displayName: string;
  avatarInitials: string;
  bio: string;
  principle: string;
  location: string;
  websiteUrl: string;
  githubUrl: string;
  joinedAt: string;
  followingCount: number;
  followerCount: number;
};

export type DonationPlatform = {
  id: string;
  name: string;
  description: string;
  officialUrl: string;
  officialUrls?: Partial<Record<LocaleCode, string>>;
  region: string;
  languages: string[];
  category: string;
  note?: string;
};

export type AnnualSummary = {
  year: number;
  totalRecords: number;
  donations: number;
  kindness: number;
  openSource: number;
  keywords: string[];
  note: string;
};

export type RecordImage = {
  id: string;
  recordId: string;
  userId: string;
  r2Key: string;
  r2Url: string;
  mimeType: string;
  fileSize?: number | null;
  sortOrder: number;
  isCover?: boolean | null;
  createdAt: string;
};
