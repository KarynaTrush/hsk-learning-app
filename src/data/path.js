export const HSK_LEVELS = {
  "1": {
    color: "var(--accent)",
    bgColor: "rgba(79,121,66,0.04)",
    borderColor: "rgba(79,121,66,0.2)",
    groups: [
      { titleKey: "languageBasics", nodes: [
        { id: 1, hanzi: "你好", nodeKey: "greetings", category: "greetings" },
        { id: 2, hanzi: "数字", nodeKey: "numbers", category: "numbers" },
        { id: 3, hanzi: "代词", nodeKey: "pronouns", category: "people" },
        { id: 4, hanzi: "时间", nodeKey: "timeDates", category: "time" },
      ]},
      { titleKey: "dailyLife", nodes: [
        { id: 5, hanzi: "家人", nodeKey: "family", category: "family" },
        { id: 6, hanzi: "国家", nodeKey: "countries", category: "places" },
        { id: 7, hanzi: "爱好", nodeKey: "hobbies", category: "interests" },
        { id: 8, hanzi: "天气", nodeKey: "weather", category: "weather" },
      ]},
      { titleKey: "surroundingsPlaces", nodes: [
        { id: 9, hanzi: "学校", nodeKey: "school", category: "school" },
        { id: 10, hanzi: "家里", nodeKey: "home", category: "housing" },
        { id: 11, hanzi: "买东西", nodeKey: "shopping", category: "shopping" },
        { id: 12, hanzi: "水果", nodeKey: "fruit", category: "food" },
      ]},
    ],
  },
  "2": {
    color: "var(--primary)",
    bgColor: "rgba(200,62,52,0.04)",
    borderColor: "rgba(200,62,52,0.15)",
    groups: [
      { titleKey: "personSurroundings", nodes: [
        { id: 13, hanzi: "食物", nodeKey: "food", category: "food" },
        { id: 14, hanzi: "日常", nodeKey: "routine", category: "time" },
        { id: 15, hanzi: "身体", nodeKey: "appearance", category: "people" },
        { id: 16, hanzi: "疾病", nodeKey: "health", category: "health" },
      ]},
      { titleKey: "citySpace", nodes: [
        { id: 17, hanzi: "购物", nodeKey: "inStore", category: "shopping" },
        { id: 18, hanzi: "交通", nodeKey: "transport", category: "transport" },
        { id: 19, hanzi: "方向", nodeKey: "orientation", category: "places" },
        { id: 20, hanzi: "公共场所", nodeKey: "publicPlaces", category: "places" },
      ]},
      { titleKey: "workInterests", nodes: [
        { id: 21, hanzi: "工作", nodeKey: "jobs", category: "work" },
        { id: 22, hanzi: "动物", nodeKey: "animals", category: "animals" },
        { id: 23, hanzi: "颜色", nodeKey: "colorsStyle", category: "colors" },
        { id: 24, hanzi: "运动", nodeKey: "sport", category: "sport" },
      ]},
    ],
  },
  "3": {
    color: "#D4A843",
    bgColor: "rgba(212,168,67,0.04)",
    borderColor: "rgba(212,168,67,0.18)",
    groups: [
      { titleKey: "commsRelations", nodes: [
        { id: 25, hanzi: "旅行", nodeKey: "travel", category: "travel" },
        { id: 26, hanzi: "情感", nodeKey: "emotions", category: "emotions" },
        { id: 27, hanzi: "教育", nodeKey: "higherEd", category: "education" },
        { id: 28, hanzi: "职场", nodeKey: "career", category: "career" },
      ]},
      { titleKey: "leisureCulture", nodes: [
        { id: 29, hanzi: "音乐", nodeKey: "music", category: "entertainment" },
        { id: 30, hanzi: "电影", nodeKey: "cinema", category: "entertainment" },
        { id: 31, hanzi: "节日", nodeKey: "traditions", category: "culture" },
        { id: 32, hanzi: "历史", nodeKey: "stories", category: "culture" },
      ]},
      { titleKey: "surroundingsCity", nodes: [
        { id: 33, hanzi: "银行", nodeKey: "services", category: "work" },
        { id: 34, hanzi: "公寓", nodeKey: "apartment", category: "housing" },
        { id: 35, hanzi: "餐厅", nodeKey: "restaurant", category: "food" },
        { id: 36, hanzi: "气候", nodeKey: "nature", category: "nature" },
      ]},
    ],
  },
  "4": {
    color: "#2B6CB0",
    bgColor: "rgba(43,108,176,0.04)",
    borderColor: "rgba(43,108,176,0.18)",
    groups: [
      { titleKey: "socialLife", nodes: [
        { id: 37, hanzi: "社会", nodeKey: "society", category: "society" },
        { id: 38, hanzi: "经济", nodeKey: "businessFinance", category: "business" },
        { id: 39, hanzi: "法律", nodeKey: "law", category: "lawOrder" },
        { id: 40, hanzi: "习惯", nodeKey: "customs", category: "culture" },
      ]},
      { titleKey: "scienceDev", nodes: [
        { id: 41, hanzi: "科学", nodeKey: "research", category: "science" },
        { id: 42, hanzi: "技术", nodeKey: "technology", category: "technology" },
        { id: 43, hanzi: "环境", nodeKey: "ecology", category: "ecology" },
        { id: 44, hanzi: "创新", nodeKey: "innovation", category: "technology" },
      ]},
      { titleKey: "mediaArt", nodes: [
        { id: 45, hanzi: "新闻", nodeKey: "news", category: "media" },
        { id: 46, hanzi: "艺术", nodeKey: "art", category: "culture" },
        { id: 47, hanzi: "广告", nodeKey: "marketing", category: "business" },
        { id: 48, hanzi: "作家", nodeKey: "literature", category: "artLit" },
      ]},
    ],
  },
  "5": {
    color: "#6B46C1",
    bgColor: "rgba(107,70,193,0.04)",
    borderColor: "rgba(107,70,193,0.18)",
    groups: [
      { titleKey: "advancedDiscussion", nodes: [
        { id: 49, hanzi: "哲学", nodeKey: "philosophy", category: "science" },
        { id: 50, hanzi: "媒体", nodeKey: "mediaPress", category: "media" },
        { id: 51, hanzi: "心理", nodeKey: "psychology", category: "psychology" },
        { id: 52, hanzi: "逻辑", nodeKey: "logic", category: "education" },
      ]},
      { titleKey: "businessMarkets", nodes: [
        { id: 53, hanzi: "谈判", nodeKey: "negotiations", category: "business" },
        { id: 54, hanzi: "投资", nodeKey: "investments", category: "business" },
        { id: 55, hanzi: "贸易", nodeKey: "trade", category: "business" },
        { id: 56, hanzi: "管理", nodeKey: "management", category: "career" },
      ]},
      { titleKey: "cultureScience", nodes: [
        { id: 57, hanzi: "历史", nodeKey: "history", category: "culture" },
        { id: 58, hanzi: "教育", nodeKey: "eduSystem", category: "education" },
        { id: 59, hanzi: "地理", nodeKey: "geography", category: "nature" },
        { id: 60, hanzi: "古迹", nodeKey: "monuments", category: "culture" },
      ]},
    ],
  },
  "6": {
    color: "#DD6B20",
    bgColor: "rgba(221,107,32,0.04)",
    borderColor: "rgba(221,107,32,0.18)",
    groups: [
      { titleKey: "specialized", nodes: [
        { id: 61, hanzi: "政治", nodeKey: "politics", category: "politics" },
        { id: 62, hanzi: "医疗", nodeKey: "medicine", category: "health" },
        { id: 63, hanzi: "工业", nodeKey: "industry", category: "technology" },
        { id: 64, hanzi: "军事", nodeKey: "strategy", category: "politics" },
      ]},
      { titleKey: "econGlobalization", nodes: [
        { id: 65, hanzi: "财政", nodeKey: "publicFinance", category: "business" },
        { id: 66, hanzi: "法规", nodeKey: "legalActs", category: "lawOrder" },
        { id: 67, hanzi: "外汇", nodeKey: "currencies", category: "business" },
        { id: 68, hanzi: "资源", nodeKey: "resources", category: "nature" },
      ]},
      { titleKey: "sociologyHumanities", nodes: [
        { id: 69, hanzi: "人口", nodeKey: "demography", category: "society" },
        { id: 70, hanzi: "宗教", nodeKey: "religion", category: "culture" },
        { id: 71, hanzi: "考古", nodeKey: "archaeology", category: "science" },
        { id: 72, hanzi: "审美", nodeKey: "aesthetics", category: "culture" },
      ]},
    ],
  },
  "7-9": {
    color: "#319795",
    bgColor: "rgba(49,151,149,0.04)",
    borderColor: "rgba(49,151,149,0.18)",
    groups: [
      { titleKey: "academic", nodes: [
        { id: 73, hanzi: "学术", nodeKey: "academicResearch", category: "education" },
        { id: 74, hanzi: "智能", nodeKey: "ai", category: "ai" },
        { id: 75, hanzi: "核心", nodeKey: "methodology", category: "science" },
        { id: 76, hanzi: "论文", nodeKey: "discourse", category: "education" },
      ]},
      { titleKey: "highCulture", nodes: [
        { id: 77, hanzi: "古文", nodeKey: "classicalChinese", category: "culture" },
        { id: 78, hanzi: "诗歌", nodeKey: "tangPoetry", category: "culture" },
        { id: 79, hanzi: "戏剧", nodeKey: "chineseOpera", category: "culture" },
        { id: 80, hanzi: "思想", nodeKey: "confucianism", category: "culture" },
      ]},
      { titleKey: "globalIt", nodes: [
        { id: 81, hanzi: "安全", nodeKey: "cybersecurity", category: "cybersecurity" },
        { id: 82, hanzi: "数据", nodeKey: "bigData", category: "technology" },
        { id: 83, hanzi: "网络", nodeKey: "cloud", category: "technology" },
        { id: 84, hanzi: "量子", nodeKey: "quantum", category: "science" },
      ]},
    ],
  },
};

export const PATH_NODES = Object.values(HSK_LEVELS).flatMap((lvl) =>
  lvl.groups.flatMap((g) => g.nodes)
);

export function nodeById(id) {
  return PATH_NODES.find((n) => n.id === id);
}

export function nodesUpTo(maxId) {
  return PATH_NODES.filter((n) => n.id <= maxId).map((n) => n.id);
}
