import type {
  AnnualSummary,
  DonationPlatform,
  GoodwillRecord,
  UserProfile,
} from "./types";

export const records: GoodwillRecord[] = [
  {
    id: "record-internet-archive",
    type: "donation",
    title: "Supported the Internet Archive",
    content:
      "A small contribution to ensure digital history remains accessible to everyone. The quiet work of archivers is foundational.",
    reflection: "Hidden amount",
    date: "2026-05-24",
    authorUsername: "anonymous",
    authorDisplayName: "Anonymous",
    isAnonymous: true,
    amountHidden: true,
    organizationName: "Internet Archive",
    platformName: "Official site",
    tags: ["Digital preservation", "Non-profit"],
    language: "en",
  },
  {
    id: "record-react-docs",
    type: "open_source",
    title: "Merged PR for React Documentation",
    content: "Helped clarify the hooks API for the Chinese translation.",
    date: "2026-05-22",
    authorUsername: "jiangnan",
    authorDisplayName: "jiangnan",
    isAnonymous: false,
    projectUrl: "https://github.com/reactjs/zh-hans.react.dev",
    tags: ["Documentation", "React"],
    language: "en",
  },
  {
    id: "record-garden",
    type: "kindness",
    title: "Community Garden Cleanup",
    content:
      "Spent the morning clearing invasive weeds from the shared plots. A quiet, physical act of care for our shared space.",
    date: "2026-05-18",
    authorUsername: "anonymous",
    authorDisplayName: "Anonymous",
    isAnonymous: true,
    tags: ["Environment", "Local"],
    language: "en",
  },
  {
    id: "record-rural-education",
    type: "donation",
    title: "Rural Education Fund",
    content:
      "Monthly recurring donation. Hoping to bridge the gap in educational resources.",
    reflection: "Hidden amount",
    date: "2026-05-15",
    authorUsername: "elara_writes",
    authorDisplayName: "elara_writes",
    isAnonymous: false,
    amountHidden: true,
    organizationName: "Rural Education Initiative",
    platformName: "Verified foundation",
    tags: ["Education", "Monthly"],
    language: "en",
  },
  {
    id: "record-a11y",
    type: "open_source",
    title: "Accessibility Fixes for UI Library",
    content:
      "Improved screen reader support for complex data tables. Making tools inclusive is a collective responsibility.",
    date: "2026-05-10",
    authorUsername: "anonymous",
    authorDisplayName: "Anonymous",
    isAnonymous: true,
    projectUrl: "https://github.com",
    tags: ["A11Y", "Development"],
    language: "en",
  },
];

export const profile: UserProfile = {
  username: "elara_writes",
  displayName: "elara_writes",
  avatarInitials: "EW",
  bio: "Quietly recording bits of good.",
  principle: "Small, consistent kindness is worth continuing.",
  location: "Singapore",
  websiteUrl: "https://website.org",
  githubUrl: "https://github.com/elara-writes",
  joinedAt: "2024-10-01",
  followingCount: 128,
  followerCount: 1200,
};

export const annualSummary: AnnualSummary = {
  year: 2026,
  totalRecords: 42,
  donations: 25,
  kindness: 5,
  openSource: 12,
  keywords: ["Education", "Open Work", "Quiet Giving"],
  note: "They were not grand, but they reminded me that small, consistent kindness is worth continuing.",
};

export const donationPlatforms: DonationPlatform[] = [
  {
    id: "unicef",
    name: "UNICEF",
    description:
      "Working in over 190 countries and territories to defend children's rights and help them fulfil their potential.",
    officialUrl: "https://www.unicef.org/",
    officialUrls: {
      en: "https://www.unicef.org/",
      zh: "https://support.unhcr.cn/joinfundraising/",
    },
    region: "Global",
    languages: ["EN", "FR", "ES"],
    category: "Children",
  },
  {
    id: "icrc",
    name: "ICRC / Red Cross",
    description:
      "Humanitarian assistance for people affected by conflict, disasters, and emergencies.",
    officialUrl: "https://www.icrc.org/",
    officialUrls: {
      zh: "https://www.icrc.org/zh/where-we-work/china",
    },
    region: "Global",
    languages: ["Multi-lang"],
    category: "Humanitarian",
  },
  {
    id: "wfp",
    name: "World Food Programme",
    description:
      "The leading humanitarian organization saving lives and changing lives through food assistance.",
    officialUrl: "https://www.wfp.org/",
    officialUrls: {
      zh: "https://zh.wfp.org/",
    },
    region: "Global",
    languages: ["EN", "FR", "ES"],
    category: "Food security",
  },
  {
    id: "tencent",
    name: "Tencent Public Welfare",
    description:
      "A Chinese internet charity platform connecting donors with verified charitable organizations.",
    officialUrl: "https://gongyi.qq.com/",
    region: "China / Asia",
    languages: ["ZH"],
    category: "Public welfare",
  },
];
