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
    names: {
      zh: "联合国难民署",
    },
    description:
      "Working in over 190 countries and territories to defend children's rights and help them fulfil their potential.",
    descriptions: {
      zh: "联合国难民署致力于保护因战争、冲突和迫害而流离失所的人，为难民和受影响家庭提供援助与支持。",
    },
    officialUrl: "https://www.unicef.org/",
    officialUrls: {
      en: "https://www.unicef.org/",
      zh: "https://support.unhcr.cn/joinfundraising/",
    },
    region: "Global",
    regions: {
      zh: "中国入口",
    },
    languages: ["EN", "FR", "ES"],
    localizedLanguages: {
      zh: ["ZH"],
    },
    category: "Children",
  },
  {
    id: "icrc",
    name: "ICRC / Red Cross",
    names: {
      zh: "红十字国际委员会",
    },
    description:
      "Humanitarian assistance for people affected by conflict, disasters, and emergencies.",
    descriptions: {
      zh: "为受冲突、灾害和紧急情况影响的人群提供人道援助，并支持相关救援与保护工作。",
    },
    officialUrl: "https://www.icrc.org/",
    officialUrls: {
      zh: "https://www.icrc.org/zh/where-we-work/china",
    },
    region: "Global",
    regions: {
      zh: "中国入口",
    },
    languages: ["Multi-lang"],
    localizedLanguages: {
      zh: ["ZH"],
    },
    category: "Humanitarian",
  },
  {
    id: "wfp",
    name: "World Food Programme",
    names: {
      zh: "世界粮食计划署",
    },
    description:
      "The leading humanitarian organization saving lives and changing lives through food assistance.",
    descriptions: {
      zh: "世界粮食计划署通过粮食援助应对饥饿与营养问题，支持受灾害、冲突和贫困影响的人群。",
    },
    officialUrl: "https://www.wfp.org/",
    officialUrls: {
      zh: "https://zh.wfp.org/",
    },
    region: "Global",
    regions: {
      zh: "中国入口",
    },
    languages: ["EN", "FR", "ES"],
    localizedLanguages: {
      zh: ["ZH"],
    },
    category: "Food security",
  },
  {
    id: "tencent",
    name: "Tencent Public Welfare",
    names: {
      zh: "腾讯公益",
    },
    description:
      "A Chinese internet charity platform connecting donors with verified charitable organizations.",
    descriptions: {
      zh: "腾讯公益是中国互联网公益平台，连接捐赠者与经过认证的公益项目和慈善组织。",
    },
    officialUrl: "https://gongyi.qq.com/",
    region: "China / Asia",
    regions: {
      zh: "中国入口",
    },
    languages: ["ZH"],
    category: "Public welfare",
  },
];
