/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Note, LibraryItem } from '../types';

export const UI_TRANSLATIONS = {
  en: {
    // Top alert & playlist status
    recording: 'Live Procedural Streaming',
    systemStatus: 'EDITORIAL STUDY ARCHIVE // VOL.2026',
    contactTitle: 'CONTACT CHANNELS',
    adminTitle: 'Live Repositories Manager',
    worksTitle: 'WORKS ARCHIVE',
    notesTitle: 'EDITORIAL ARCHIVE',
    libraryTitle: 'LIBRARY ARCHIVE',
    timelineTitle: "Wendy LU's Journey",
    aboutTitle: 'PRACTITIONER PROFILE',
    getInTouch: 'GET IN TOUCH',
    latestDiscoveries: 'LATEST DISCOVERIES',
    featuredWorks: 'Featured Works /',
    brandSchemes: 'Brand Schemes & Public Campaigns',
    narrativeConceptual: 'NARRATIVE CONCEPTUAL',
    archiveRef: 'ARCHIVE-REF',
    close: '[CLOSE]',
    exitReader: '[EXIT READER]',
    readerFrame: 'READER FRAME',
    activeDecrypt: 'ACTIVE DECRYPT',
    editorialInsightMap: 'Editorial Insight Map & Summary Insights',
    fullDocEmbed: 'Full Document Embedding Shell',
    frameSafeguard: 'Frame Sandboxing Safeguard',
    frameSafeguardDesc: 'WeChat and regional news portals employ security guards to prevent framing on third-party layout headers. You can launch in a new window, or bypass safely via frame simulator.',
    tryEmbed: 'TRY IN-SITE EMBED anyway',
    openOriginal: 'OPEN ORIGINAL SOURCE ↗',
    launchInterface: 'LAUNCH INTERFACE',
    allMediums: 'All Mediums',
    books: 'books',
    movies: 'movies',
    music: 'music',
    logDate: 'LOG_DATE',
    noLibraryItems: 'No archival notes match selected genres or tags.',
    noProjectItems: 'No project records matching the filter tag or search key.',
    filteringArticles: 'Filtering articles via title, summaries, or keywords...',
    filteringLogs: 'Filtering logs via authors, title keys, reviews...',
    filteringWorks: 'Filtering records via titles, tags, or focus areas...',
    secComm: 'SECURED COMMUNICATIONS',
    yourName: 'Your Name (Required)',
    emailAddr: 'Email Address (Required)',
    msgInquiry: 'Message Inquiry',
    encrypting: 'ENCRYPTING MESSAGE...',
    submitMsg: 'SUBMIT MESSAGE / ARCHIVE TRANSMIT',
    archivalHQ: 'ARCHIVAL STORAGE HEADQUARTERS',
    archivalHQDesc: 'If you would like to recruit me for a campaign creation role, discuss spatial collaboration, or contribute feedback on youth media zines, please reach out via either direct email channels or using the LinkedIn profile below.',
    encryptionKeyDetails: 'ENCRYPTION KEY DETAILS',
    cipher: 'CIPHER: AES-256 SECURED SHARED PORTAL PREVIEW',
    geoCoord: 'GEOGRAPHIC COORDINATES: 23.1291° N, 113.2644° E (GUANGZHOU, CHINA)',
    copyright: '© 2026 ARCHIVED BY W. DESIGNED UNDER EDITORIAL DIRECTIVES.',
    allRights: 'ALL SYSTEM REGISTERS PROTECTED.',
    aboutMethodTitle: 'About my Creative Practice',
    aboutMethodDesc: 'My creative method occupies the intersection of physical community space and crisp digital aesthetics (Editorial archive systems). With over three years of practice hosting collaborative design workshops, designing high-contrast visual identities, and developing localized storytelling campaigns in Guangzhou, I build platforms for long-term user retention.',
    aestheticGuidelines: 'Aesthetic Guidelines',
    aestheticGuidelinesDesc: 'Editorial alignments, high-contrast monochrome color palettes, pixel accents, structured typographic pairings, and non-distracting physics-driven motion.',
    technicalToolkit: 'Technical Toolkit',
    technicalToolkitDesc: 'React, TypeScript, Tailwind CSS, Web Audio Synthesizers, Canvas-based physics simulations, and Figma prototyping.',
    client: 'Client / Org',
    role: 'Role',
    timelineCode: 'Timeline Code',
    scopeAreas: 'Scope Areas',
    projectBrief: 'Project Brief & Core Narrative',
    keyMilestones: 'Key Milestones & Creative Outcomes',
    
    // Admin interface
    addProject: 'Add Portfolio Work',
    addNote: 'Publish Column Article',
    addLibrary: 'Add Library item',
    formProjectTitle: 'Project Title',
    formCategory: 'Category',
    formDate: 'Archive Date Log',
    formDesc: 'Narrative Description',
    formImgUrl: 'Image Spec URL',
    formTags: 'Hashtag Tags (Comma separated)',
    formClient: 'Client / Organization',
    formRole: 'Your Title / Role',
    publishProj: 'ARCHIVE TO PORTFOLIO REPOSITORY',
    formNoteTitle: 'Article Title',
    formNoteSummary: 'Paragraph Summary',
    formNoteUrl: 'Origin WeChat/External URL',
    formNoteTags: 'Article tags (Comma separated)',
    formNoteReadTime: 'Read Time (e.g. 5 min read)',
    publishNote: 'REGISTER PUBLICATION INTO DATABASE',
    formLibTitle: 'Item Title',
    formLibAuthor: 'Author / Creator',
    formLibType: 'Medium Type',
    formLibStatus: 'Status',
    formLibRating: 'Rating',
    formLibReview: 'Review Note',
    publishLib: 'PUBLISH LIBRARY LOG Listing',
    confirmDelete: 'Are you absolutely sure you want to delete this resource listing?',
    projectSuccess: 'Project successfully archived and loaded live!',
    noteSuccess: 'Editorial article publication successfully registered!',
    librarySuccess: 'Library collection log registered!',
    contactSuccess: 'Your message has been safely encrypted into the archive database. I will contact you shortly!',

    // Main branding
    brandHeroSub: 'CREATIVITY & STRATEGIC INSIGHTS',
    brandIntro: 'Personal Digital Space & Media Zine',
    brandTitle1: 'And the',
    brandTitle2: 'stories',
    brandTitle3: 'go on.',
    catCreative: 'CAT.01 // CREATION',
    journeyIntroTitle: 'CHRONOLOGICAL DIRECTION //',
    aboutHeadline: 'DESIGNER, CURATOR, DEVELOPER.',
    aboutBio1: 'I believe the spaces we inhabit—both digital frameworks and physical neighborhoods—should tell coherent stories. By blending Swiss editorial grid structures with nostalgic digital accents, I craft dynamic online experiences that prioritize high readability, typographic balance, and physical ecosystem values.',
    aboutBio2: 'My studies explore how cultural heritage and youth behavior patterns can be cataloged through robust visual mediums. This exploration translates into public programs, publications, indie-game exhibits, and custom web applications.',
    coreSkills: 'CORE SKILLS & CRAFT',
    researchFocus: 'RESEARCH FOCUS INTERVIEWS',
  },
  zh: {
    // Top alert & playlist status
    recording: '实时程序化流媒体技术',
    systemStatus: '社论研究学术档案馆 // VOL.2026',
    contactTitle: '联系渠道与指引',
    adminTitle: '实时资源和数据库管理器',
    worksTitle: '核心作品库档案',
    notesTitle: '学者专栏与纪实档案',
    libraryTitle: '个人媒体阅览室随笔',
    timelineTitle: 'Wendy LU 的成长与转进行践历程',
    aboutTitle: '新媒介实践者肖像与生平',
    getInTouch: '与我取得联系',
    latestDiscoveries: '最新发现与随笔',
    featuredWorks: '精选主打作品 /',
    brandSchemes: '品牌视觉重设与公众参与行动',
    narrativeConceptual: '叙事概念与研究路径',
    archiveRef: '档案馆参照代码',
    close: '[关闭视窗]',
    exitReader: '[直接退出阅读模式]',
    readerFrame: '在线文本解析与渲染视口',
    activeDecrypt: '活动实时解密',
    editorialInsightMap: '社论观点思维导图与核心洞察',
    fullDocEmbed: '原始文献外部安全视差嵌入壳',
    frameSafeguard: '安全沙箱防护提示',
    frameSafeguardDesc: '微信及部分新闻门户网站部署了防跨域嵌套保护。您可以在新窗口中直接打开，或通过下面的框架安全按钮强行加载。',
    tryEmbed: '尝试在当前框架内嵌入',
    openOriginal: '在新窗口打开原始出处 ↗',
    launchInterface: '启动原生界面',
    allMediums: '所有研究媒介',
    books: '精选书籍',
    movies: '经典电影',
    music: '独立音乐',
    logDate: '日志时间',
    noLibraryItems: '没有符合所选媒介题材或标签的阅览室记录。',
    noProjectItems: '没有符合该分类标签或检索关键字的项目记录。',
    filteringArticles: '输入文章标题、内容摘要、或者主理人标签进行高速搜索...',
    filteringLogs: '输入作者、电影书籍名、或者读后感关键字过滤日志...',
    filteringWorks: '输入项目标题、客户、标签或角色快速筛选作品...',
    secComm: '密玥通信信道',
    yourName: '您的姓名 (必填)',
    emailAddr: '电子邮件地址 (必填)',
    msgInquiry: '合作提案与需求留言',
    encrypting: '正在加密并传输数据...',
    submitMsg: '确认提交合作备忘录 / 加密发送',
    archivalHQ: '档案馆实体办公室与联络点',
    archivalHQDesc: '如果您有意邀请我参与行动体系策划创造、讨论跨空间的建筑艺术协作，或者对青年亚文化自制小报提供改进反馈，请通过以下直接通道或经由领英与我取得联系。',
    encryptionKeyDetails: '加密通道元数据',
    cipher: '算法: AES-256 复合安全认证预览通道',
    geoCoord: '地理空间定位: 23.1291° N, 113.2644° E (中国 广州)',
    copyright: '© 2026 ARCHIVED BY W. 基于社论严苛指令微调交互。',
    allRights: '版权所有，国家数字注册系统全权保护。',
    aboutMethodTitle: '关于我的创造力和策展实践方法论',
    aboutMethodDesc: '我的研究路径深植于物理老城区公共空间微更新与前卫极简网页数字自适应系统（社论归档技术）的重叠点。我在广州拥有超过三年的深耕积累，主导多场青年共创设计工坊、建立高对比度视觉识别体系、并策划多场深入生活场景的叙事性市集与公共倡议，建立了稳健的年轻社群长期粘性纽带。',
    aestheticGuidelines: '美学规范',
    aestheticGuidelinesDesc: '崇尚排版网格对齐、高对比度黑白灰及微温原色调、极轻量像素装饰点缀、严谨的衬线与非衬线字族配对、以及去除噪音干扰和符合直觉的无阴影物理反馈动画。',
    technicalToolkit: '技术武器库与工程实现',
    technicalToolkitDesc: '精通 React、TypeScript、Tailwind CSS、Web Audio 程序化实时声频发生器、基于 HTML5 Canvas 的阻尼网格交互动画、以及严格像素级 Figma 原型构画。',
    client: '客户 / 委任组织',
    role: '项目担任角色',
    timelineCode: '成长时间序列码',
    scopeAreas: '核心技能范畴',
    projectBrief: '项目叙事摘要与立言背景',
    keyMilestones: '关键成果与社会学成效',
    
    // Admin interface
    addProject: '添加新的精选作品档案',
    addNote: '发布最新的主理人专栏文章',
    addLibrary: '登记阅览日志 (书籍/电影/音乐)',
    formProjectTitle: '作品标题',
    formCategory: '所属作品类目',
    formDate: '归档年份历程 code (例如 2024-06)',
    formDesc: '中文项目叙事简论',
    formImgUrl: '高分辨率图源 CDN URL',
    formTags: '项目主题标签 (用半角英文逗号隔开)',
    formClient: '委任客户 / 物理地点',
    formRole: '您的在项目中担当的角色 (如 编辑总监)',
    publishProj: '封存并发布此作品进本地作品库',
    formNoteTitle: '文章大标题',
    formNoteSummary: '概要提炼描述',
    formNoteUrl: '微信公众号/外联完整链接',
    formNoteTags: '文章的核心理念标签 (用逗号隔开)',
    formNoteReadTime: '期望阅读分钟数 (例如 10 min read)',
    publishNote: '在数据库注册此学术社论文章',
    formLibTitle: '作品标题 / 书影音名',
    formLibAuthor: '创作者 / 导演 / 写作者',
    formLibType: '艺术媒介分类',
    formLibStatus: '当时研习状态',
    formLibRating: '评星推荐度',
    formLibReview: '一句话锐评与思想摘录',
    publishLib: '添加此记录至主理人的阅览阁',
    confirmDelete: '您确定要从共享资源数据库中永久抹除这一条记录列示吗？',
    projectSuccess: '新作品已安全归档，即时刷新生效！',
    noteSuccess: '新专栏文章发布成功，并与元数据索引完成校验！',
    librarySuccess: '阅览日志登记成功，已更新货架！',
    contactSuccess: '您的协作提案留言已通过 SHA-256 全面加密存储入档案服务器，Wendy 会尽快回复！',

    // Main branding
    brandHeroSub: '创造力、行动策展与高能战略主理',
    brandIntro: '个人数字空间 · 青年文创活动档案馆 · 独立媒介专栏',
    brandTitle1: '而属于本地的',
    brandTitle2: '广州故事',
    brandTitle3: '仍在续写。',
    catCreative: '第一部类 // 创造探索',
    journeyIntroTitle: '历时性序列轨迹 //',
    aboutHeadline: '极简视觉设计师, 田野共创策展人, 全栈工程架构者.',
    aboutBio1: '我坚信，我们所栖身的地方——无论是轻便纯净的像素网页框架，还是烟火气萦绕的老城区街巷——都应该承载最富生机、逻辑高度自洽的文化故事。通过将严苛冷酷的现代瑞士排版系统与质朴温热的在地图景像素进行物理重组，我构筑起极具细节美感、可自由流动并激发情感共鸣的软硬件交互现场。',
    aboutBio2: '我的研究目光热烈地聚焦于传统手工技艺、濒危的街区食品、以及在瞬息万变的多维数字和现实生活夹缝中，青年人如何通过微小却自足的物理媒介重新构建属于当下的生活意志。这些探索，最终沉淀成了各种策展公共计划、手工 zine 纸本刊物，乃至高度模块化低碳自适应的应用系统。',
    coreSkills: '核心技艺与实践范围',
    researchFocus: '田野观察与研究交汇点',
  }
};

// Map of translations for standard projects
const PROJECT_TRANSLSLATIONS: Record<string, { title: string; category: string; client: string; description: string; role: string; details: string[] }> = {
  'proj-1': {
    title: '复古未来主义档案馆系统重塑',
    category: 'Design & Creation',
    client: '设计空间实验室 (Design Space Lab)',
    description: '一个由学术社论驱动的交互式网页目录，旨在通过自定义的黑白自适应复古网格与经典的像素艺术元素向青年受众呈现传统物质文化与历史档案。',
    role: '首席视觉设计师',
    details: [
      '开发了高度模块化的网格组件系统，允许用户按需调整活动工作区区块的物理比例。',
      '主导并构筑了极简高对比度的黑白灰视觉系统，配以针对各种分辨率深度适配的排版。',
      '无缝集成了具备卓越弹性缓动的 SVG 矢量交互和离线资源自平衡架构。'
    ]
  },
  'proj-2': {
    title: '广州老城街巷青年空间重生倡议',
    category: 'Campaigns',
    client: '市文化与历史风貌促进联合部门',
    description: '一项综合了在地品牌重塑与高密度社群倡议的公共行动，成功将一些被闲置剥落的老城艺术小巷活化为青年创作者与艺术家的高感官聚集场所。',
    role: '行动总主理人',
    details: [
      '带领跨专业团队编制并落地了物理公共装置、引导牌示系统与交互式空间动线。',
      '掌控全网媒体故事脉络与高共情社区联动系统，实现了超过 15 万次的爆发性自主传播曝光。',
      '组织并举行了 20 多场不同年龄段原住民与设计师共同参与的在地叙事工作坊。'
    ]
  },
  'proj-3': {
    title: '跨媒介纪实：广州平民生活方式田野档案',
    category: 'Storytelling',
    client: '民间文化遗产保护促进会',
    description: '一篇富有人文温情和声频沉浸感的数字视觉特写，客观深入地探讨了在不可逆的都市扩张进程中，濒危的街头美食摊档、社群童年回忆以及复古自制视觉在变化地景中的生机。',
    role: '编辑总监 & 执笔记者',
    details: [
      '深度访谈了15位本地文保专家、手工艺老师傅以及空间规划先锋，积累并保存了宝贵的口述历史录音。',
      '创作了将极简印刷美学与基于像素的高反差摄影进行巧妙交融的响应式网络多维纪实载体。',
      '设计并将物理街区的自然立体环境声、市民喧闹交织声程序化地融入网页阅读视口。'
    ]
  },
  'proj-4': {
    title: '社论印刷 Zine：《像素都市主义：网格与记忆》',
    category: 'Design & Creation',
    client: '独立档案馆出版计划',
    description: '一本探讨瑞士排版中的秩序结构、极简拼贴线条，如何与当下青年人的断网冥想、模块化生活空间进行诗意重组的手作纸本刊物。',
    role: '装帧设计与主审',
    details: [
      '策编了共计 64 页的高端纸质实体出版物，多处融入典雅的双重曝光摄影、严苛的衬线字体拼贴。',
      '伴生设计构筑了线上推广自适应网页，开发了符合直觉、能流畅跟随光标交互的 Canvas 艺术星空特效。',
      '在本地 8 家先锋独立书店完成了第一批投放，即时实现了 100% 抢空记录。'
    ]
  },
  'proj-5': {
    title: '共创者枢纽与青年创意生长生态体系',
    category: 'Growth & Community',
    client: '创客共创协作控股 (InnoSpace Co.)',
    description: '策划并举行了一系列以成长、赋能为方向的社群策略研讨会，帮助物理周边居民、大学美术设计生、与独立创意作坊之间无缝链接，达成了互信、长周期的粘性矩阵。',
    role: '社群增长与战略主理',
    details: [
      '为本地和线上协作构建了极具指引和容纳性的去中心化数字社群协作管理蓝图。',
      '搭建了去门槛的内容共创和成员投递渠道，实现了每周活跃信息量 45% 的跳跃性自然增长。',
      '设计、组装并全栈手写了黑白高敏度创意主理人名册在线极简门户系统。'
    ]
  }
};

// Map of translations for standard notes (originally in Chinese, converting to English for "en" view)
const NOTE_TRANSLATIONS: Record<string, { title: string; summary: string; insights: string[] }> = {
  'note-1': {
    title: 'Public Space Proposal for Youth Creators: Micro-Renewal of Old Town Blocks',
    summary: 'Examines how micro-renewals and local co-creations can activate outdated neighborhood spaces, injecting modern artistic vibes into traditional streets.',
    insights: [
      'Block Activation: Committing to collaborative curation over heavy demolition to preserve local historical narratives and lively domesticity.',
      'Interaction Medium: Grafting nostalgic pixel elements onto clean modern Swiss grid designs, assuring high brand recognition.',
      'Grassroots Alignment: Licensing resident merchants to participate directly, establishing strong mutual support systems.'
    ]
  },
  'note-2': {
    title: 'Flowing Craftsmanship: Documentary of Art Creations in Old Historical Street Alleys',
    summary: 'Focusing on intangible cultural heritage and ancestral legacy, exploring visual symbols in residency programs to rejuvenate traditional arts.',
    insights: [
      'Heritage Empowerment: Recombining traditional handcrafts within a minimalist monochromatic layout, regaining high resonance with younger generations.',
      'Narrative Interaction: Transforming traditional heritage into a timeless dialogue using digital audio-video, old artifacts, and interactive web elements.',
      'Curatorial Craft: Attaining extreme tactile impact through delicate treatment of textures (rice paper, heavy cold-rolled metal frames).'
    ]
  },
  'note-3': {
    title: 'Urban Design Lab: Strategic Visions for Youth Creative Hubs',
    summary: 'A conceptual modular layout based on contemporary youth lifestyles where living, working, and exhibitions merge seamlessly.',
    insights: [
      'Modular Design: The space functions like bricks, easily reconfigured for creative markets, educational workshops, and academic salons.',
      'High contrast: Implementing Solid Contrast Blocks in wayfinding systems to logically steer visitor flows.',
      'Feedback Loop: Mapping coordinates with grids, connecting online scheduling with physical creations via pixel boards.'
    ]
  },
  'note-4': {
    title: 'Public Media Propagation: Campaign Narrative Orchestration in All-Domain Digital Media',
    summary: 'From administrative press releases to viral topics: how to leverage empathetic storytelling to scale indie community events.',
    insights: [
      'Emotional Hooks: Unearthing heartwarming stories of everyday people behind the event, shattering stiff traditional corporate boundaries.',
      'Pacing Mastery: Constructing spiral exposure through pre-event teasing, mid-stage interactions, and post-event summarizations.',
      'Visual Typography: Elaborating premium monochrome geometric photography fragments paired with generous white space.'
    ]
  },
  'note-5': {
    title: 'Local Co-Creation Lab: Incubating Inspiration Hubs for Creative Gatherings',
    summary: 'An active field diary of joint actions and youth community building using low-cost, ultra-flexible layouts to secure sustainable ecosystems.',
    insights: [
      'Zero-Threshold Dialogues: Crafting an open, fluid salon atmosphere so that residents with zero background can voice viewpoints.',
      'The Medium is Message: Using cardboard, wooden pallets, and discarded daily items as structural factors to voice sustainability.',
      'Live Curatorial Runs: Projecting instant discussion outcomes onto floor-to-ceiling glass and folding screens for immediate exhibitions.'
    ]
  },
  'note-6': {
    title: 'Between History & Play: Educational Micro-Innovations in Interactive Exhibits',
    summary: 'Deconstructing historical annals into gamified modules, introducing local cultural knowledge through amusing interactives.',
    insights: [
      'Gamified Learning: Boosting quest enthusiasm with custom playing cards and pixel-styled micro-challenges.',
      'Adaptive Sound/Video: Triggering localized alleyway field recordings as visitors stroll around, creating vivid three-dimensional immersion.',
      'Instant Impressions: Challenging players to stamp their retro manuals with unique pixelated physical stamps.'
    ]
  },
  'note-7': {
    title: 'Let Dialogues Happen: Participatory Methodologies with Historical Neighborhood Residents',
    summary: 'Utilizing participatory action research and psychodramas to de-escalate cultural conflicts between ancestral tenants and youthful shop owners.',
    insights: [
      'Empathy Anchors: Shattering icy barriers through retro photograph collections and personal recollection cartography.',
      'Neutral Facilitation: Introducing thick monochromatic cards to empower all age structures neutrally during debates.',
      'Relationship Cultivation: Nestling micro artistic relays between old barbershops and fresh bookstores to build shared life experiences.'
    ]
  },
  'note-8': {
    title: 'Pixels & Vernaculars: Constructing Microscopic Youth Visual Archives',
    summary: 'Breaking daily sequences of youthful days into categories and building pixel archives to store sentimental records.',
    insights: [
      'Micro narratives: Shunning grand histories to register simple instances: coffee receipts, looping records, or telegraph pole shadows.',
      'Duo-Block Layout: Mimicking Swiss zines with monochrome offsets, making raw photography and brief quotes the sole focus.',
      'Interactive Inversion: Injecting responsive CSS canvas filter inversions on hover to enhance tactile engagement.'
    ]
  },
  'note-9': {
    title: 'Non-Linear Scripts: Blank Parlors for Unrestricted Creative Authorship',
    summary: 'Cultivating a sanctuary amidst urban clamors, inviting pristine designers and writers to compose with no themes or bounds.',
    insights: [
      'The Power of Scripts: Drafting raw stream of consciousness onto a blank canvas with zero critiques or rigid outlines.',
      'Digital Sabbatical: Severing digital connectivities; using only graphite lead, thick textured wood paper, and clicky mechanical keyboards.',
      'Typography Resonance: Stenciling raw excerpts as collaged posters across showroom glass to craft massive architectural spatial prose.'
    ]
  },
  'note-10': {
    title: 'Rebranding Blueprint: Linework Evolution in Visual Corporate Trademarks',
    summary: 'Shedding bulky conventional brand constraints to design a dynamic, flowing "W" linework system for modern retail experiences.',
    insights: [
      'Pure Minimalism: Stripping drop shadows to retain raw, monoline black-and-white strokes for ultimate modernity.',
      'Flexible Scaling: Enabling responsive viewport scaling, from ultra-small browser favicons to giant exhibition billboards.',
      'Vibe Blending: Utilizing heavy serif letterforms mixed with solid card layouts to build high authority and modern appeal.'
    ]
  },
  'note-11': {
    title: 'Generative Ecosystems: Grassroots Growth Matrices and Cultural Empowerment',
    summary: 'Formulating high-growth interest squads that build active internal nodes, scaling naturally via community vision and setups.',
    insights: [
      'Decentralized Sprouting: Elevating interest heads into sovereign nodes that self-define customized propagation guidelines.',
      'Value Alignment: Consolidating guidelines into clear monochromatic card packets for rapid cross-platform distributions.',
      'Fact-Driven Iteration: Mining member feedback through instant surveys and pixelated charts to agilely steer the next campaign cycle.'
    ]
  }
};

// Map of translations for library logs (English originally, converting to Chinese for "zh" view)
const LIBRARY_TRANSLATIONS: Record<string, { title: string; creator: string; note: string }> = {
  'lib-1': {
    title: '作为艺术的设计',
    creator: '布鲁诺·莫纳里 (Bruno Munari)',
    note: '纯粹视觉构图、空间布局，以及为现实生活功用拆解结构化设计的必读之作。莫纳里将设计美感塑造成完美的风格模板。'
  },
  'lib-2': {
    title: 'Monocle 优质生活指南',
    creator: 'Monocle 编辑部',
    note: '排版布局、版面间距、卓越视觉标准、出彩配色以及讲述全球优质创意文化故事的极佳参考。'
  },
  'lib-3': {
    title: '《重庆森林》',
    creator: '王家卫',
    note: '高速快门特效、高对比霓虹极简色板、富流动感的日常叙事的大师级课作。为广州在地公共行动带来了巨大的叙事启发。'
  },
  'lib-4': {
    title: '《大都市》',
    creator: ' 弗里茨·朗 (Fritz Lang)',
    note: '无懈可击的大气建筑线条，未来科技感的都市网格，充满张力的强力明暗对此。黑白网格结构系统的核心启蒙灵感。'
  },
  'lib-5': {
    title: '平面设计中的网格系统',
    creator: '约瑟夫·米勒-布罗克曼 (Josef Müller-Brockmann)',
    note: '瑞士现代主义排版与视觉设计的圣经。它极其深刻地塑造了我采用黑白色块、固定侧边栏格框、以及极微对齐规律的实践路径。'
  }
};

// Functions to translate dynamic models in-place based on active language key
export function translateProject(p: Project, lang: 'en' | 'zh'): Project {
  if (lang === 'zh') {
    if (p.title_zh) {
      return {
        ...p,
        title: p.title_zh,
        description: p.description_zh || p.description,
        details: p.details_zh || p.details,
        client: p.client_zh || p.client,
        role: p.role_zh || p.role
      };
    }
    const t = PROJECT_TRANSLSLATIONS[p.id];
    if (!t) return p; // Fallback for user custom projects
    return {
      ...p,
      title: t.title,
      category: t.category as any,
      client: t.client,
      description: t.description,
      role: t.role,
      details: t.details
    };
  }
  return p; // original or customized is English
}

export function translateNote(n: Note, lang: 'en' | 'zh'): Note {
  if (lang === 'zh') {
    if (n.title_zh) {
      return {
        ...n,
        title: n.title_zh,
        summary: n.summary_zh || n.summary,
        insights: n.insights_zh || n.insights
      };
    }
    return n; // original is Chinese
  }
  // English request
  const t = NOTE_TRANSLATIONS[n.id];
  if (!t) return n; // Fallback (custom notes have English in primary fields)
  return {
    ...n,
    title: t.title,
    summary: t.summary,
    insights: t.insights
  };
}

export function translateLibraryItem(li: LibraryItem, lang: 'en' | 'zh'): LibraryItem {
  if (lang === 'zh') {
    if (li.title_zh) {
      return {
        ...li,
        title: li.title_zh,
        creator: li.creator_zh || li.creator,
        note: li.note_zh || li.note
      };
    }
    const t = LIBRARY_TRANSLATIONS[li.id];
    if (!t) return li; // Fallback
    return {
      ...li,
      title: t.title,
      creator: t.creator,
      note: t.note
    };
  }
  return li; // original or customized is English
}
