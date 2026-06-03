import type { DonationPlatform } from "@/lib/types";

export const donationPlatforms: DonationPlatform[] = [
  {
    id: "unicef",
    name: "UNICEF",
    names: {
      zh: "联合国难民署",
    },
    description:
      "Working to protect people forced to flee because of conflict, violence, and persecution.",
    descriptions: {
      zh: "联合国难民署致力于保护因战争、冲突和迫害而流离失所的人，为难民和受影响家庭提供援助与支持。",
    },
    officialUrl: "https://www.unicef.org/",
    officialUrls: {
      zh: "https://support.unhcr.cn/joinfundraising/",
    },
    region: "Global",
    regions: {
      zh: "中国入口",
    },
    languages: ["EN", "FR", "ES", "ZH"],
    localizedLanguages: {
      zh: ["ZH"],
    },
    category: "Humanitarian",
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
      "Food assistance in emergencies and long-term nutrition programs.",
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
    languages: ["EN", "FR", "ES", "ZH"],
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
