/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Note, LibraryItem, Track, TimelineEntry } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Retro-Futurist Archive Redesign',
    category: 'Design & Creation',
    client: 'Design Space Lab',
    date: '2024-05',
    description: 'An editorial-driven web interactive directory presenting youth archival materials through customizable retro grids and pixel-art elements.',
    details: [
      'Developed a highly modular grid component system allowing users to resize active workspace blocks.',
      'Designed a unified black-and-white visual identity with customized typographic headers and high-contrast styling guides.',
      'Integrated an offline asset storage framework with smooth SVG transitions.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    tags: ['Web Design', 'Editorial', 'React', 'Motion Dynamic'],
    featured: true,
    role: 'Lead Visual Designer'
  },
  {
    id: 'proj-2',
    title: 'Guangzhou Youth Space Campaign',
    category: 'Campaigns',
    client: 'Local Cultural Bureau',
    date: '2024-06',
    description: 'A comprehensive branding and community engagement campaign aimed at transforming historical public lanes into active art hotspots.',
    details: [
      'Spearheaded the physical installation and interactive spatial layout guidelines.',
      'Directed the social media narrative and community engagement circles, generating over 150,000 active impressions.',
      'Orchestrated co-creation workshops with 20+ local designers and media groups.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    tags: ['Brand Strategy', 'Spatial Design', 'Public Campaign'],
    featured: true,
    role: 'Campaign Lead'
  },
  {
    id: 'proj-3',
    title: 'Interactive Narrative: Guangzhou Lifestyle Archive',
    category: 'Storytelling',
    client: 'Cultural Preservation Union',
    date: '2024-04',
    description: 'A rich audio-visual journalism piece documenting historical local street food, youth memories, and retro visual designs in changing neighborhoods.',
    details: [
      'Conducted oral history interviews with 15 cultural leaders and spatial developers.',
      'Produced bespoke graphic narrative elements with pixel-based responsive layouts and bespoke retro typography.',
      'Synthesized spatial audio and interactive ambient sounds into the reading viewport.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tags: ['Media Journalism', 'Narrative', 'Acoustic Soundscapes'],
    featured: true,
    role: 'Editorial Director'
  },
  {
    id: 'proj-4',
    title: 'Editorial Zine: Pixelated Urbanism',
    category: 'Design & Creation',
    client: 'Archive Press',
    date: '2024-07',
    description: 'A visual publication exploring the overlap of minimalist black-and-white grids with digital nostalgia, architecture details, and modular lifestyles.',
    details: [
      'Curated a 64-page printed publication featuring premium double-exposure layouts and serif typography pairs.',
      'Constructed a accompanying promotional web archive landing viewport with dynamic cursor-following canvas effects.',
      'Distributed copies across 8 local independent bookstores with 100% sell-out.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544924405-ea5785f39c18?auto=format&fit=crop&w=800&q=80',
    tags: ['Typography', 'Editorial Print', 'Graphic Design'],
    featured: false,
    role: 'Layout & Cover Critic'
  },
  {
    id: 'proj-5',
    title: 'Creative Ecosystem & Interactive Hub',
    category: 'Growth & Community',
    client: 'InnoSpace Co.',
    date: '2024-03',
    description: 'Designing and executing high-growth strategic workshops to foster long-term community relationships between independent makers and local students.',
    details: [
      'Created a strategic blueprint for localized digital engagement systems.',
      'Implemented a member submission system, resulting in a 45% increase in weekly active submissions.',
      'Designed and coded the minimal visual directory web portal.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=800&q=80',
    tags: ['Strategy', 'Web Hub', 'Growth Loop'],
    featured: false,
    role: 'Growth Strategist'
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: '青年创作者的公共空间提案：老城区街区的微更新实践',
    summary: '如何通过微更新和在地共创，活化老旧街区公共空间，注入全新的艺术氛围。',
    publishDate: '2024-05-19',
    readTime: '6 min read',
    url: 'https://huacheng.gz-cmc.com/pages/2024/05/19/b92f997302084a3e8faec92f11bd7f8f.html',
    insights: [
      '街区激活：以共创替代拆建，最大程度保留老城历史脉络与烟火气。',
      '媒介设计：巧妙融合怀旧像素画与现代极简网格，赋予其高识别度的视觉表达。',
      '社区参与：赋权当地商户及周边居民深度参与设计流程，达成双向互动。'
    ],
    tags: ['空间活化', '地方叙事', '共创活动']
  },
  {
    id: 'note-2',
    title: '流动的手艺：老城区历史街巷内的艺术创作记录',
    summary: '聚焦非遗文化与历史传承，探索如何在艺术驻留计划中以视觉符号焕新民俗非遗。',
    publishDate: '2024-05-21',
    readTime: '5 min read',
    url: 'https://huacheng.gz-cmc.com/pages/2024/05/21/a4cc26a0303548a2aec762fa130e4119.html?channel=weixin',
    insights: [
      '非遗赋能：传统手工重组在极简纯灰视觉版式中，重拾年轻群体的高感。',
      '叙事交互：利用数字音影、老物件、与互动网页将传统非遗转变为跨时空对话。',
      '策展细节：对材料质地（宣纸、重金属框架）的细腻处理体现其高级的手工艺张力。'
    ],
    tags: ['传统焕新', '品牌叙事', '艺术驻留']
  },
  {
    id: 'note-3',
    title: '城市设计实验室：青年创意活力街区设计畅想',
    summary: '基于当代青年生活方式建立的多功能模块化社区构想，让生活、工作与展演在空间中无缝交融。',
    publishDate: '2024-05-29',
    readTime: '8 min read',
    url: 'https://huacheng.gz-cmc.com/pages/2024/05/29/be7d0ef35bb440e5bee91858c3d581ed.html',
    insights: [
      '模块化结构：空间就像积木，随时可根据创意市集、工作坊和学术沙龙更改布局。',
      '高对比度视觉：将强烈的黑白色块（Solid Contrast Block）应用于导视系统，引导流线。',
      '数字反哺：用网格映射物理坐标，将线上预约与线下创作通过像素装置连。'
    ],
    tags: ['城市设计', '模块化空间', '导视系统']
  },
  {
    id: 'note-4',
    title: '公共媒介传播：如何做好全域数字媒体的叙事包装',
    summary: '从政企宣发到全网热议：总结如何利用共情式内容策划，将小众活动转化为爆款传播案。',
    publishDate: '2024-05-15',
    readTime: '10 min read',
    url: 'https://mp.weixin.qq.com/s/x6N8Wi4blMfaFrpdBuu_Eg',
    insights: [
      '情绪线索：发掘活动背后普通人的温情细节，打破传统生硬宣发边界。',
      '节奏把控：按照活动前预热、活动中互动、活动后总结提炼形成螺旋式曝光。',
      '视觉排版：文章大面积使用精致的纯白段落底色，配以高级的黑白几何摄影切片。'
    ],
    tags: ['全域策划', '情绪传播', '新媒体运营']
  },
  {
    id: 'note-5',
    title: '在地共创工坊：搭建青年聚合的灵感实验室',
    summary: '在地共创、青年聚落与本地社群营建实录，通过低成本、高灵活度的机制打造可持续的艺术生态。',
    publishDate: '2024-07-18',
    readTime: '7 min read',
    url: 'https://huacheng.gz-cmc.com/pages/2024/07/18/cc10ccb6ae7945969243368f59626631.html',
    insights: [
      '无门槛交流：打造包容、流动的客厅氛围，让零背景居民也能畅所欲言。',
      '媒介即信息：使用纸箱、木栈板等日常弃置物作为空间重塑要素，传达可持续态度。',
      '联合策展：将讨论成果实时在落地窗上及移动折叠屏上展出，实现“边共创边展览”。'
    ],
    tags: ['灵感实验', '社群生态', '极简装置']
  },
  {
    id: 'note-6',
    title: '历史与游戏之间：互动数字展里的教育微创新',
    summary: '将历史史料解构成互动游戏，在轻松愉悦的交互体验中潜移默化传递在地知识。',
    publishDate: '2024-06-01',
    readTime: '6 min read',
    url: 'https://huacheng.gz-cmc.com/pages/2024/06/01/580179d0a9a84eeaa09344085c1f7716.html?channel=weixin',
    insights: [
      '知识游戏化（Gamification）：利用定制的卡牌选择及像素画闯关，激发解谜热情。',
      '交互式音视频：随着观众移步，触发特定的市井喧嚣原声带演变，实现立体沉浸。',
      '即时印记：完成挑战的玩家可使用复古像素印章，在手册上留下专属的印记打卡。'
    ],
    tags: ['互动媒介', '游戏化学习', '非遗策展']
  },
  {
    id: 'note-7',
    title: '让对话发生：街区居民的参与式创作方法论',
    summary: '运用参与式行动研究和戏剧疗愈，帮助历史街区原住民与新入驻的年轻店主消减地域隔离，共同构筑温暖街区。',
    publishDate: '2024-06-05',
    readTime: '7 min read',
    url: 'https://huacheng.gz-cmc.com/pages/2024/06/05/bc6bcd6e54c84bb1be48e2274f3b046e.html',
    insights: [
      '同理心连结：通过老照片收集、回忆地图绘画，打破彼此间的陌生冰川。',
      '中立促进（Facilitation）：引导者设定黑白大卡作为破冰道具，平衡不同年龄层表达。',
      '关系沉淀：在老理发店与艺术书店间设立微型艺术接力，创造共享的生活经验。'
    ],
    tags: ['参与式行动', '社群共融', '人文微更新']
  },
  {
    id: 'note-8',
    title: '像素与日常：青年生活方式的微观视觉档案',
    summary: '将极具呼吸感的青年人一日生活片断进行拆分归类，通过高对比度像素档案方式进行浪漫收藏。',
    publishDate: '2024-06-11',
    readTime: '5 min read',
    url: 'https://huacheng.gz-cmc.com/pages/2024/06/11/72cd904c2e5942f8aa7988712c7f04e0.html',
    insights: [
      '微观叙事：不谈宏大，只记录一份咖啡单、一首循环乐、或者黄昏的电线杆影子。',
      '双色块拼接布局：模仿传统排版杂志，大面积黑白留空，让照片与生活格言成为唯一焦点。',
      '悬停反色效果：设计网页时运用经典的滤镜取反色交互，加强触碰的趣味性。'
    ],
    tags: ['生活档案', '极优视觉', '日常美学']
  },
  {
    id: 'note-9',
    title: '非线性书写：城市角落里的自由创作会客厅',
    summary: '在嘈杂都市日常开辟一处静谧空间，邀请素不相识的设计师与文字爱好者进行无主题无目的的书写创作。',
    publishDate: '2024-05-08',
    readTime: '6 min read',
    url: 'https://mp.weixin.qq.com/s/EDWXvjecCD-VT6yJ-XOJpA',
    insights: [
      '自由书写的力量：在空白的极简画布上，不带任何批判和框架，宣泄原始思绪。',
      '断网离线体验：彻底剥离移动互联网干扰，只保留铅笔、粗木纹纸和机械键盘，回归本真。',
      '文字回响机制：采用拼贴海报的形式，将创作者的断句在展厅立面上拼出宏大的空间诗。'
    ],
    tags: ['自由写作', '反思冥想', '拼贴交互']
  },
  {
    id: 'note-10',
    title: '品牌重塑：经典视觉标识中的极简线条演化',
    summary: '打破厚重传统的企业标识设计束缚，将其凝练为富有动态张力、具有”W”元素的流动线条，赋能新零售空间。',
    publishDate: '2024-07-02',
    readTime: '9 min read',
    url: 'https://mp.weixin.qq.com/s/gfdZi8vX-sp4HYlfN-IWBA',
    insights: [
      '极简主义：减去冗余光影，只保留粗犷的等宽黑白线条，体现纯粹的现代感。',
      '动态可变LOGO（Responsive Logo）：自适应各种载体，从网站极小ICON到楼宇巨幅海报皆能平衡。',
      '情绪融入：使用粗衬线体结合纯色无阴影大卡片，建立可靠且时尚的高感官。'
    ],
    tags: ['视觉锤设计', '极简线条', '经典重塑']
  },
  {
    id: 'note-11',
    title: '新生长生态：社群增长矩阵與多元赋能实践',
    summary: '如何构建具有主动造血和裂变属性的青年兴趣小组矩阵，依靠机制与社群愿景实现零成本自然裂变。',
    publishDate: '2024-07-15',
    readTime: '11 min read',
    url: 'https://mp.weixin.qq.com/s/Y9BzSBjPZIhUJavPhU6noA',
    insights: [
      '去中心化裂变：每个兴趣主理人都是一个独立的活性节点，自主定义传播语言。',
      '共识系统：建立简短通透的行动纲领，以黑底白字的纯格调卡片进行多平台快速传播。',
      '数据驱动反哺：通过即时问卷和像素风格的信息图表（Infographic）沉淀社群画像，敏捷迭代下一期玩法。'
    ],
    tags: ['社群增长', '去中心矩阵', '敏捷主理人']
  }
];

export const INITIAL_LIBRARY: LibraryItem[] = [
  {
    id: 'lib-1',
    type: 'book',
    title: 'Design as Art',
    creator: 'Bruno Munari',
    status: 'Completed',
    rating: 5,
    date: '2024-03-12',
    note: 'An indispensable reading on pure visual composition, spatial layouts, and demystifying structural designs for real life utility. Munari shapes style perfectly.',
    coverColor: '#171717'
  },
  {
    id: 'lib-2',
    type: 'book',
    title: 'The Monocle Guide to Better Living',
    creator: 'Monocle Editorial',
    status: 'Completed',
    rating: 5,
    date: '2024-01-20',
    note: 'Incredible reference for editorial layouting, layout spacing, high visual standards, color choices, and storytelling narratives about global creative cultures.',
    coverColor: '#0a0a0a'
  },
  {
    id: 'lib-3',
    type: 'movie',
    title: 'Chungking Express',
    creator: 'Wong Kar-wai',
    status: 'Completed',
    rating: 5,
    date: '2024-04-05',
    note: 'The masterclass of fast shutter aesthetics, contrasting neon palette and highly dynamic lifestyle narrative. Heavy inspiration for the Guangzhou Stories campaign.',
    coverColor: '#262626'
  },
  {
    id: 'lib-4',
    type: 'movie',
    title: 'Metropolis',
    creator: 'Fritz Lang',
    status: 'In Progress',
    rating: 4,
    date: '2024-05-18',
    note: 'Sublime architectural lines, futuristic grids, contrasting shadows. Fundamental inspiration for monochrome grid layouts.',
    coverColor: '#1f1f1f'
  },
  {
    id: 'lib-5',
    type: 'book',
    title: 'Grid Systems in Graphic Design',
    creator: 'Josef Müller-Brockmann',
    status: 'Completed',
    rating: 5,
    date: '2024-02-15',
    note: 'The Swiss/modern design Bible. Deeply shaped my approach to black-and-white color blocks, fixed editorial sidebars, and grid alignments.',
    coverColor: '#000000'
  }
];

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'playlist',
    artist: '',
    src: 'synth-ditto',
    duration: '02:30'
  },
  {
    id: 'track-2',
    title: 'playlist',
    artist: '',
    src: 'synth-hypeboy',
    duration: '02:45'
  },
  {
    id: 'track-3',
    title: 'playlist',
    artist: '',
    src: 'synth-attention',
    duration: '03:10'
  },
  {
    id: 'track-4',
    title: 'playlist',
    artist: '',
    src: 'synth-kiikii-1',
    duration: '02:15'
  },
  {
    id: 'track-5',
    title: 'playlist',
    artist: '',
    src: 'synth-kiikii-2',
    duration: '03:00'
  }
];

export const INITIAL_TIMELINE: TimelineEntry[] = [
  {
    id: 'time-1',
    year: '2021',
    phaseLabel: 'Phase 01 // FOUNDATIONAL VISUALS & CRAFT',
    phaseLabelZh: '第一阶段 // 经典瑞士排版纪律与格网筑造',
    categoryLabel: 'Visual Design',
    categoryLabelZh: '自适视觉与排布',
    stageTitle: 'Design & Grid Formulation',
    stageTitleZh: '版面、字体、网格构成与视觉秩序',
    subtitle: 'Studio Morph / Layout Critic Labs',
    subtitleZh: '「形质渐变」视觉规划 / 纸面版式实验室',
    description: 'Originated physical brand guidelines, typography grid structures, and publishing specifications for independent art publications. Crafted pixel-perfect layouts designed to balance desktop and mobile viewports seamlessly, combining modular styling with tactile zine-like design principles.',
    descriptionZh: '设计实体品牌宣导手册、独立刊物字号体系、封面用纸规格以及多款先锋艺术画册版面。在数字层面建构像素级对齐的柔性画格框架，将纸媒小册子有温度的手感与数字产品的敏捷自适应性常提振。',
    tags: ['Layout Composition', 'Typography Pairing', 'Print Design', 'Brand Identity'],
    tagsZh: ['瑞士网格排印', '字号级差平衡', '独立艺术印造', '品牌识别导则'],
    status: 'Published',
    visibility: 'Public'
  },
  {
    id: 'time-2',
    year: '2022',
    phaseLabel: 'Phase 02 // HUMAN STORYTELLING INDEX',
    phaseLabelZh: '第二阶段 // 口述风土、人本故事与地方记忆',
    categoryLabel: 'Journalism',
    categoryLabelZh: '非虚构人文特写',
    stageTitle: 'Feature Writing & Local Reporting',
    stageTitleZh: '广州历史街区普查与手作匠人口述史',
    subtitle: 'Guangzhou Urban Zine / Cultural Columnist',
    subtitleZh: '《广州本土风物纪》特约文化特写栏目作者',
    description: "Conducted field-research journalism, deep physical interviews, and descriptive profiles focused on Guangzhou's historical lanes, artisanal communities, and local cultural memories. Translated complex community dynamics into highly humanized, readable magazine features and columns.",
    descriptionZh: '投身第一手田野现场、社区口述史微集成、老街理发店跟访。深入恩宁路、荔湾越秀弄堂，对濒危的草根手工艺人、非遗器物进行抢救式访谈档案建档，把坚硬复杂的社区演进用饱含体温的笔触化为高传阅度的城市专栏。',
    tags: ['Narrative Journalism', 'Interview Fieldwork', 'Cultural Archiving', 'Feature Writing'],
    tagsZh: ['田野实地走访', '非虚构口述史', '城市印记归档', '人文群像书写'],
    status: 'Published',
    visibility: 'Public'
  },
  {
    id: 'time-3',
    year: '2023',
    phaseLabel: 'Phase 03 // ALIGNING VOICE & STRATEGY',
    phaseLabelZh: '第三阶段 // 品牌调性、媒介声量与整合企划',
    categoryLabel: 'Creative Marketing',
    categoryLabelZh: '品牌与传播策划',
    stageTitle: 'Brand Copywriting & Strategic Campaigns',
    stageTitleZh: '艺术文化策刊、感官发生快闪与情绪文案体系',
    subtitle: 'Atmosphere Creative Labs',
    subtitleZh: '「微气流」青年感官企划工坊',
    description: 'Developed distinct audio-visual marketing models, offline pop-up concepts, and brand copy systems for aesthetic lifestyle platforms. Curated editorial alignment campaigns that deepened emotional ties with target audiences, significantly raising active local social register metrics.',
    descriptionZh: '为主张慢活美学的垂直平台打造富于诗性与呼吸感的内容体系。整合本地手艺匠人特展、自然声音艺术采样及小众沙龙，用润物无声的方式加固用户与物理本真美学的情感绳结，转化留存表现骄人。',
    tags: ['Content Strategy', 'Brand Storytelling', 'Campaign Copywriting', 'Pop-up Visuals'],
    tagsZh: ['整合内容传播', '品牌真挚叙事', '全渠道文案标度', '限定感官体验'],
    status: 'Published',
    visibility: 'Public'
  },
  {
    id: 'time-4',
    year: '2024',
    phaseLabel: 'Phase 04 // UX SYSTEMS & FLOW OPTIMIZATION',
    phaseLabelZh: '第四阶段 // 屏幕网格对齐、触达链路与高质长效运营',
    categoryLabel: 'Product Operations',
    categoryLabelZh: '数字化日常成长运营',
    stageTitle: 'Content Operations & Platform Integration',
    stageTitleZh: '数字出版检索中枢、成长机制与流还原度审核',
    subtitle: 'Nexus Reading Platform / Maker Co.',
    subtitleZh: 'Nexus 联合阅览学术数字索引生态 / 麦客创展',
    description: 'Designed friction-free student onboarding lifecycles and structured user workflows for modular digital reading platforms. Bridged designer wireframes with rapid web releases, auditing layout rendering and standardizing operational quality control templates.',
    descriptionZh: '专为高校青年学者与读者群体构筑无多余摩擦的用户注册、检索引导、多维积分勋章与触达流程。无缝过渡UI设计师线框图并交付响应式页面模块上线，严格校验排版高分兼容还原，并建立常态质检操作日志模板。',
    tags: ['Onboarding Lifecycles', 'User Auditing', 'Content Operations', 'Technical Delivery'],
    tagsZh: ['转介激活模型', '画幅兼容走查', '日常长效运营', '产研高效率交付'],
    status: 'Published',
    visibility: 'Public'
  },
  {
    id: 'time-5',
    year: '2025',
    phaseLabel: 'Phase 05 // CRITICAL STUDY & RESEARCH OUTLOOK',
    phaseLabelZh: '第五阶段 // 媒介批判理论、空间日常与终身学研',
    categoryLabel: 'Media Research',
    categoryLabelZh: '媒介质性批研',
    stageTitle: 'Spatial Cultures & Digital Repositories',
    stageTitleZh: '地标声音气味感知、移动生态解构与数字化归档伦理',
    subtitle: 'Independent Academic Studies Group',
    subtitleZh: '南方旧城镇街巷日常美学与非线性叙事研究会',
    description: 'Investigating how virtual ecosystems, digital memory archives, and user interface choices alter spatial local culture in Southern Chinese cities. Authoring critique papers outlining how storytelling platforms can act as ethical portals for community preservation.',
    descriptionZh: '探索在都市微区域尺度下，外卖平台、声音地标数字库及视窗拟物界面如何深层重组南方市民的物理空间亲密感和生活纹理。发表多部学理分析，探讨非线性文字系统在社区保护、日常伦理上的重要寄存价值。',
    tags: ['Digital Ethnography', 'Interface Ethics', 'Spatial Memories', 'Critical Theory'],
    tagsZh: ['数字民族志研究', '界面人机学 ethics', '地理情感归档', '媒介批判学说'],
    status: 'Published',
    visibility: 'Public'
  }
];

