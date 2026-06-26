/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_PROJECTS, INITIAL_NOTES, INITIAL_LIBRARY, INITIAL_TIMELINE, TRACKS } from './data/defaultData';
import { Project, Note, LibraryItem, TimelineEntry, CMSStatus, CMSVisibility } from './types';
import { UI_TRANSLATIONS, translateProject, translateNote, translateLibraryItem } from './utils/translations';
import InteractiveBg from './components/InteractiveBg';
import Playlist from './components/Playlist';
import Logo from './components/Logo';
import { audioDB } from './utils/audioStorage';
import Navbar from './components/Navbar';
import WorksSection from './components/WorksSection';
import NoteSection from './components/NoteSection';
import LibrarySection from './components/LibrarySection';
import { 
  Mail, Linkedin, Phone, ArrowRight, Plus, Trash2, 
  BookOpen, Layers, Edit2, ShieldCheck, Clock, Send, 
  Sparkles, Check, Download, Upload, RotateCcw, 
  ExternalLink, Key, LogOut, Settings2, Settings, FileText, Book, Pin, EyeOff, GripVertical
} from 'lucide-react';
import { setupCloudSync, initializeCloudAndLocalData, forceSyncToCloud } from './lib/firebase';

const compressAndCropToSquare = (base64Str: string, callback: (compressedB64: string) => void) => {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    // We aim for exactly 300 x 300 px square, high-fidelity avatar that compresses wonderfully:
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const sx = (img.width - Math.min(img.width, img.height)) / 2;
      const sy = (img.height - Math.min(img.width, img.height)) / 2;
      const sSize = Math.min(img.width, img.height);
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
      
      // Store as JPEG with high quality. Base64 is guaranteed well under 300KB!
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      callback(compressedDataUrl);
    } else {
      callback(base64Str);
    }
  };
  img.onerror = () => {
    callback(base64Str);
  };
  img.src = base64Str;
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [cloudLoading, setCloudLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [transitionStage, setTransitionStage] = useState<'idle' | 'covering' | 'uncovering'>('idle');
  const [nextTab, setNextTab] = useState<string | null>(null);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setNextTab(tabId);
    setTransitionStage('covering');
  };

  useEffect(() => {
    if (transitionStage === 'covering') {
      const timer = setTimeout(() => {
        if (nextTab) {
          setActiveTab(nextTab);
        }
        setTransitionStage('uncovering');
      }, 450);
      return () => clearTimeout(timer);
    } else if (transitionStage === 'uncovering') {
      const timer = setTimeout(() => {
        setTransitionStage('idle');
        setNextTab(null);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [transitionStage, nextTab]);

  // CMS state structures for all five content categories + profile texts, persisted to localStorage
  const [projectsList, setProjectsList] = useState<Project[]>(() => {
    const saved = localStorage.getItem('archive_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [notesList, setNotesList] = useState<Note[]>(() => {
    const saved = localStorage.getItem('archive_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [libraryList, setLibraryList] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem('archive_library');
    return saved ? JSON.parse(saved) : INITIAL_LIBRARY;
  });

  const [timelineList, setTimelineList] = useState<TimelineEntry[]>(() => {
    const saved = localStorage.getItem('archive_timeline');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE;
  });

  const [customTracks, setCustomTracks] = useState<any[]>(() => {
    const saved = localStorage.getItem('playlist_tracks');
    return saved ? JSON.parse(saved) : TRACKS;
  });

  // Dynamic editable Profile / About fields
  const [profileTitleEn, setProfileTitleEn] = useState(() => localStorage.getItem('about_title_en') || 'PRACTITIONER PROFILE');
  const [profileTitleZh, setProfileTitleZh] = useState(() => localStorage.getItem('about_title_zh') || '主理人艺术档案');
  
  const [profileSubEn, setProfileSubEn] = useState(() => localStorage.getItem('about_sub_en') || 'DESIGNER, CURATOR, DEVELOPER.');
  const [profileSubZh, setProfileSubZh] = useState(() => localStorage.getItem('about_sub_zh') || '她是写作者、产品运营、亦是独立设计策划人。');

  const [profileBioEn, setProfileBioEn] = useState(() => localStorage.getItem('about_bio_en') || 'I believe the spaces we inhabit—both digital frameworks and physical neighborhoods—should tell coherent stories. By blending Swiss editorial grid structures with nostalgic digital accents, I craft dynamic online experiences that prioritize high readability, typographic balance, and physical ecosystem values.');
  const [profileBioZh, setProfileBioZh] = useState(() => localStorage.getItem('about_bio_zh') || '我始终深信，我们肉身所处的物理街弄、与指尖停留滑动、呼吸倾听的数字屏幕架构，都理应孕育深厚连贯的时代叙事。我潜心将高冷理性、遵循网格神圣纪律的瑞士排版原则，与流淌着电子霓虹和市景体温的拟物元素相叠。创造高阶文本可读性、极其苛求版面平衡、且温润善意的互联网栖息地。');

  const [profileSecondEn, setProfileSecondEn] = useState(() => localStorage.getItem('about_second_en') || 'My studies explore how cultural heritage and youth behavior patterns can be cataloged through robust visual mediums. This exploration translates into public programs, publications, indie-game exhibits, and custom web applications.');
  const [profileSecondZh, setProfileSecondZh] = useState(() => localStorage.getItem('about_second_zh') || '我的关切始终环绕在——怎么依靠视觉媒介的秩序、以及数字音像系统的质感，来细致而无损害地归档那些隐微脆弱的本土市民地方记忆、及边缘生长的当代青年族群趣味。这一切被转化为富有生命张力的线下公共教育工作坊、实验小册子、像素风漫游展品、并最终凝缩在一行行富于动态美感的产品程序里。');

  // Contact Channels editable states
  const [contactChannelEmail, setContactChannelEmail] = useState(() => localStorage.getItem('contact_channel_email') || 'wlu7853@gmail.com');
  const [contactChannelLinkedin, setContactChannelLinkedin] = useState(() => localStorage.getItem('contact_channel_linkedin') || 'linkedin.com/in/w-archive');

  // Global custom cursor states
  const [customCursorImage, setCustomCursorImage] = useState<string | null>(() => localStorage.getItem('custom_cursor_image'));
  const [customCursorSize, setCustomCursorSize] = useState<number>(() => Number(localStorage.getItem('custom_cursor_size')) || 24);
  const [customCursorEnabled, setCustomCursorEnabled] = useState<boolean>(() => localStorage.getItem('custom_cursor_enabled') !== 'false');
  const [contactChannelPhone, setContactChannelPhone] = useState(() => localStorage.getItem('contact_channel_phone') || '+86 188 XXXX XXXX');

  // Additional dynamic bilingual branding & timeline header texts per Wendy's request
  const [brandHeroSubEn, setBrandHeroSubEn] = useState(() => localStorage.getItem('brand_hero_sub_en') || 'CREATIVITY & STRATEGIC INSIGHTS');
  const [brandHeroSubZh, setBrandHeroSubZh] = useState(() => localStorage.getItem('brand_hero_sub_zh') || '创造力、行动策展与高能战略主理');

  const [brandIntroEn, setBrandIntroEn] = useState(() => localStorage.getItem('brand_intro_en') || 'Personal Digital Space & Media Zine');
  const [brandIntroZh, setBrandIntroZh] = useState(() => localStorage.getItem('brand_intro_zh') || '个人数字空间 · 青年文创活动档案馆 · 独立媒介专栏');

  const [brandTitle1En, setBrandTitle1En] = useState(() => localStorage.getItem('brand_title1_en') || 'And the');
  const [brandTitle1Zh, setBrandTitle1Zh] = useState(() => localStorage.getItem('brand_title1_zh') || '而属于本地的');

  const [brandTitle2En, setBrandTitle2En] = useState(() => localStorage.getItem('brand_title2_en') || 'stories');
  const [brandTitle2Zh, setBrandTitle2Zh] = useState(() => localStorage.getItem('brand_title2_zh') || '广州故事');

  const [brandTitle3En, setBrandTitle3En] = useState(() => localStorage.getItem('brand_title3_en') || 'go on.');
  const [brandTitle3Zh, setBrandTitle3Zh] = useState(() => localStorage.getItem('brand_title3_zh') || '仍在续写。');

  const [timelineTitleEn, setTimelineTitleEn] = useState(() => localStorage.getItem('timeline_title_en') || "Wendy LU's Journey");
  const [timelineTitleZh, setTimelineTitleZh] = useState(() => localStorage.getItem('timeline_title_zh') || '陆芸的创作与生命行进年轮');

  const [timelineIntroEn, setTimelineIntroEn] = useState(() => localStorage.getItem('timeline_intro_en') || "A chronological track of a multidisciplinary creator who combines storytelling, content strategy, academic research, functional design, and deep audience understanding. Moving seamlessly between physical layout, human reporting, creative brand campaigns, product lifecycle operations, and the ultimate critical analysis of media environments.");
  const [timelineIntroZh, setTimelineIntroZh] = useState(() => localStorage.getItem('timeline_intro_zh') || "本时光记录档案追踪了一位集文字叙事、媒介传播策略、实地人种志采访、前端功能构建、以及重度人文宿愿于一体的跨媒介探索者。自如穿行在纸质印刷排印、老城街巷田野调研、创意品牌营销大促、数字化日常漏斗运营、以及表达社会学反思的媒介感知解密之间.");

  // Ribbon items editable states
  const [ribbon1En, setRibbon1En] = useState(() => localStorage.getItem('ribbon_1_en') || 'MINIMALIST COMPOSITION');
  const [ribbon1Zh, setRibbon1Zh] = useState(() => localStorage.getItem('ribbon_1_zh') || '秩序、极简网格构成');
  const [ribbon2En, setRibbon2En] = useState(() => localStorage.getItem('ribbon_2_en') || 'BOLD GRIDS ALIGNMENT');
  const [ribbon2Zh, setRibbon2Zh] = useState(() => localStorage.getItem('ribbon_2_zh') || '黑白高对比度排版');
  const [ribbon3En, setRibbon3En] = useState(() => localStorage.getItem('ribbon_3_en') || 'GZ CULTURAL ARCHIVE');
  const [ribbon3Zh, setRibbon3Zh] = useState(() => localStorage.getItem('ribbon_3_zh') || '广州地方文化生活档案');

  // Curated Archives header settings
  const [curatedArchivesTitleEn, setCuratedArchivesTitleEn] = useState(() => localStorage.getItem('curated_archives_title_en') || 'Curated Archives');
  const [curatedArchivesTitleZh, setCuratedArchivesTitleZh] = useState(() => localStorage.getItem('curated_archives_title_zh') || '策展档案特写');

  // Showcase Cards configuration
  const [showcase1BadgeEn, setShowcase1BadgeEn] = useState(() => localStorage.getItem('showcase_1_badge_en') || 'storytelling, campaigns, design, community');
  const [showcase1BadgeZh, setShowcase1BadgeZh] = useState(() => localStorage.getItem('showcase_1_badge_zh') || '创意策划 / 广告战役 / 前端设计');
  const [showcase1SubtitleEn, setShowcase1SubtitleEn] = useState(() => localStorage.getItem('showcase_1_subtitle_en') || 'FEATURED WORKS');
  const [showcase1SubtitleZh, setShowcase1SubtitleZh] = useState(() => localStorage.getItem('showcase_1_subtitle_zh') || '策展精选作品');
  const [showcase1TitleEn, setShowcase1TitleEn] = useState(() => localStorage.getItem('showcase_1_title_en') || 'VIEW SELECTION PROJECTS');
  const [showcase1TitleZh, setShowcase1TitleZh] = useState(() => localStorage.getItem('showcase_1_title_zh') || '阅览编排作品');
  const [showcase1Redirect, setShowcase1Redirect] = useState(() => localStorage.getItem('showcase_1_redirect') || 'works');

  const [showcase2BadgeEn, setShowcase2BadgeEn] = useState(() => localStorage.getItem('showcase_2_badge_en') || 'LATEST DISCOVERIES');
  const [showcase2BadgeZh, setShowcase2BadgeZh] = useState(() => localStorage.getItem('showcase_2_badge_zh') || '最新研究探索');
  const [showcase2TitleEn, setShowcase2TitleEn] = useState(() => localStorage.getItem('showcase_2_title_en') || 'Blending Digital Grids with Traditional Guangzhou Neighborhood Narratives.');
  const [showcase2TitleZh, setShowcase2TitleZh] = useState(() => localStorage.getItem('showcase_2_title_zh') || '将数字网盒结构，与带有广州本土色彩的街巷叙事进行有机交融。');
  const [showcase2DescEn, setShowcase2DescEn] = useState(() => localStorage.getItem('showcase_2_desc_en') || 'Leveraging modular micro-updates, physical interactive installations, and responsive editorial layout patterns to revitalize community relationships.');
  const [showcase2DescZh, setShowcase2DescZh] = useState(() => localStorage.getItem('showcase_2_desc_zh') || '藉由模块化的微更新演练、物理装置、以及充满视觉情绪的网页社论排版，来活化并温润逐渐冰冷的社区连接纽带。');
  const [showcase2Redirect, setShowcase2Redirect] = useState(() => localStorage.getItem('showcase_2_redirect') || 'notes');

  // Contact bilingual settings
  const [contactLabelEn, setContactLabelEn] = useState(() => localStorage.getItem('contact_label_en') || 'Channels //');
  const [contactLabelZh, setContactLabelZh] = useState(() => localStorage.getItem('contact_label_zh') || '直达信道 //');
  const [contactTitleEn, setContactTitleEn] = useState(() => localStorage.getItem('contact_title_en') || 'GET IN TOUCH');
  const [contactTitleZh, setContactTitleZh] = useState(() => localStorage.getItem('contact_title_zh') || '启动跨界连结通道');
  const [contactHqEn, setContactHqEn] = useState(() => localStorage.getItem('contact_hq_en') || 'ARCHIVAL STORAGE HEADQUARTERS');
  const [contactHqZh, setContactHqZh] = useState(() => localStorage.getItem('contact_hq_zh') || '实体文库储存与对话总部');
  const [contactDescEn, setContactDescEn] = useState(() => localStorage.getItem('contact_desc_en') || 'If you would recruit me for a campaign creation role, discuss spatial collaboration, or contribute feedback on youth media zines, please reach out via either direct email channels or using the LinkedIn profile below.');
  const [contactDescZh, setContactDescZh] = useState(() => localStorage.getItem('contact_desc_zh') || '如果您正在筹备需要人文温度 and 质感视觉的主导、希望展开街区微更新共建计划、或者只是想和主理人就书架漫游游戏等细致命题交流心得，敬请用左侧标准加密信息发射对讲，也欢迎通过职业社交网络点对点微联。');

  // Avatar state
  const [avatarB64, setAvatarB64] = useState(() => localStorage.getItem('logo_avatar_b64') || '');
  const [avatarHoverLeft, setAvatarHoverLeft] = useState(() => localStorage.getItem('logo_avatar_hover_left') || 'W. LU AVATAR');
  const [avatarHoverRight, setAvatarHoverRight] = useState(() => localStorage.getItem('logo_avatar_hover_right') || 'COORD // GZ');
  const [draggableTimelineId, setDraggableTimelineId] = useState<string | null>(null);
  const [isPortraitLightboxOpen, setIsPortraitLightboxOpen] = useState(false);

  // Background customizable states
  const [homeModule1Bg, setHomeModule1Bg] = useState(() => localStorage.getItem('home_module1_bg_b64') || '');
  const [homeModule2Bg, setHomeModule2Bg] = useState(() => localStorage.getItem('home_module2_bg_b64') || '');
  const [globalPageBg, setGlobalPageBg] = useState(() => localStorage.getItem('global_page_bg_b64') || '');

  // Default nav items
  const DEFAULT_NAV_ITEMS = [
    { id: 'home', label_en: 'HOME', label_zh: '首页', iconName: 'Home' },
    { id: 'timeline', label_en: 'TIMELINE', label_zh: '历程', iconName: 'Clock' },
    { id: 'works', label_en: 'WORKS', label_zh: '作品', iconName: 'FolderOpen' },
    { id: 'notes', label_en: 'NOTES', label_zh: '笔记', iconName: 'Newspaper' },
    { id: 'library', label_en: 'LIBRARY', label_zh: '书房', iconName: 'Library' },
    { id: 'about', label_en: 'ABOUT', label_zh: '关于', iconName: 'User' },
    { id: 'contact', label_en: 'CONTACT', label_zh: '联系', iconName: 'Send' },
    { id: 'admin', label_en: 'STUDIO ⚙️', label_zh: '工作台 ⚙️', iconName: 'Settings' }
  ];

  const [customNavItems, setCustomNavItems] = useState(() => {
    const saved = localStorage.getItem('custom_nav_items');
    try {
      return saved ? JSON.parse(saved) : DEFAULT_NAV_ITEMS;
    } catch (e) {
      return DEFAULT_NAV_ITEMS;
    }
  });

  // Notes page editable titles & labels
  const [noteTopSubtitleEn, setNoteTopSubtitleEn] = useState(() => localStorage.getItem('note_top_subtitle_en') || 'Reflections / Articles //');
  const [noteTopSubtitleZh, setNoteTopSubtitleZh] = useState(() => localStorage.getItem('note_top_subtitle_zh') || '视窗文章与社群反思 //');
  const [noteTopTitleEn, setNoteTopTitleEn] = useState(() => localStorage.getItem('note_top_title_en') || 'EDITORIAL ARCHIVE');
  const [noteTopTitleZh, setNoteTopTitleZh] = useState(() => localStorage.getItem('note_top_title_zh') || '学者专栏与纪实档案');
  const [noteBtnReadEn, setNoteBtnReadEn] = useState(() => localStorage.getItem('note_btn_read_en') || 'READ INSIGHTS');
  const [noteBtnReadZh, setNoteBtnReadZh] = useState(() => localStorage.getItem('note_btn_read_zh') || '研读解密');
  const [noteTitleInsightsEn, setNoteTitleInsightsEn] = useState(() => localStorage.getItem('note_title_insights_en') || 'EDITORIAL INSIGHT MAP');
  const [noteTitleInsightsZh, setNoteTitleInsightsZh] = useState(() => localStorage.getItem('note_title_insights_zh') || '研读主干与内容洞察');
  const [noteBtnLaunchEn, setNoteBtnLaunchEn] = useState(() => localStorage.getItem('note_btn_launch_en') || 'LAUNCH ORIGINAL INTERFACE');
  const [noteBtnLaunchZh, setNoteBtnLaunchZh] = useState(() => localStorage.getItem('note_btn_launch_zh') || '进入模拟/原文链道');
  const [noteBtnPublishEn, setNoteBtnPublishEn] = useState(() => localStorage.getItem('note_btn_publish_en') || 'PUBLISH NEW ARTICLE');
  const [noteBtnPublishZh, setNoteBtnPublishZh] = useState(() => localStorage.getItem('note_btn_publish_zh') || '发表新专栏文章');

  // About page core titles & lists
  const [aboutContactTitleEn, setAboutContactTitleEn] = useState(() => localStorage.getItem('about_contact_title_en') || 'CONTACT CHANNELS');
  const [aboutContactTitleZh, setAboutContactTitleZh] = useState(() => localStorage.getItem('about_contact_title_zh') || '中枢直连通道');
  const [aboutSkillsTitleEn, setAboutSkillsTitleEn] = useState(() => localStorage.getItem('about_skills_title_en') || 'CORE SKILLS & CRAFT');
  const [aboutSkillsTitleZh, setAboutSkillsTitleZh] = useState(() => localStorage.getItem('about_skills_title_zh') || '核心实干兵器量仪');
  const [aboutSkillsListEn, setAboutSkillsListEn] = useState(() => localStorage.getItem('about_skills_list_en') || 'Editorial typography design\nResponsive front-end layouts\nSpatial mapping & installation\nWeb Audio procedural synthesizers\nCommunity engagement strategies');
  const [aboutSkillsListZh, setAboutSkillsListZh] = useState(() => localStorage.getItem('about_skills_list_zh') || '编排向社论式网格视觉极度洁癖调试\n完全响应式、语调简洁的前端页面集\n地方声音地标采集绘制与物理快闪体验装置\n基于前端原生 Web Audio 的简素音乐发生合成器\n微有机街区活化、工作坊主持与共创策划运营');

  const reloadStatesFromStorage = () => {
    // Reload lists
    const projects = localStorage.getItem('archive_projects');
    if (projects) setProjectsList(JSON.parse(projects));
    
    const notes = localStorage.getItem('archive_notes');
    if (notes) setNotesList(JSON.parse(notes));
    
    const library = localStorage.getItem('archive_library');
    if (library) setLibraryList(JSON.parse(library));
    
    const timeline = localStorage.getItem('archive_timeline');
    if (timeline) setTimelineList(JSON.parse(timeline));
    
    const tracks = localStorage.getItem('playlist_tracks');
    if (tracks) setCustomTracks(JSON.parse(tracks));

    // Reload configs
    setProfileTitleEn(localStorage.getItem('about_title_en') || 'PRACTITIONER PROFILE');
    setProfileTitleZh(localStorage.getItem('about_title_zh') || '主理人艺术档案');
    setProfileSubEn(localStorage.getItem('about_sub_en') || 'DESIGNER, CURATOR, DEVELOPER.');
    setProfileSubZh(localStorage.getItem('about_sub_zh') || '她是写作者、产品运营、亦是独立设计策划人。');
    setProfileBioEn(localStorage.getItem('about_bio_en') || 'I believe the spaces we inhabit—both digital frameworks and physical neighborhoods—should tell coherent stories. By blending Swiss editorial grid structures with nostalgic digital accents, I craft dynamic online experiences that prioritize high readability, typographic balance, and physical ecosystem values.');
    setProfileBioZh(localStorage.getItem('about_bio_zh') || '我始终深信，我们肉身所处的物理街弄、与指尖停留滑动、呼吸倾听的数字屏幕架构，都理应孕育深厚连贯的时代叙事。我潜心将高冷理性、遵循网格神圣纪律的瑞士排版原则，与流淌着电子霓虹 and 市景体温的拟物元素相叠。创造高阶文本可读性、极其苛求版面平衡、且温润善意的互联网栖息地。');
    setProfileSecondEn(localStorage.getItem('about_second_en') || 'My studies explore how cultural heritage and youth behavior patterns can be cataloged through robust visual mediums. This exploration translates into public programs, publications, indie-game exhibits, and custom web applications.');
    setProfileSecondZh(localStorage.getItem('about_second_zh') || '我的关切始终环绕在——怎么依靠视觉媒介的秩序、以及数字音像系统的质感，来细致而无损害地归档那些隐微脆弱的本土市民地方记忆、及边缘生长的当代青年族群趣味。这一切被转化为富有生命张力的线下公共教育工作坊、实验小册子、像素风漫游展品、并最终凝缩在一行行富于动态美感的产品程序里。');
    
    setContactChannelEmail(localStorage.getItem('contact_channel_email') || 'wlu7853@gmail.com');
    setContactChannelLinkedin(localStorage.getItem('contact_channel_linkedin') || 'linkedin.com/in/w-archive');
    setContactChannelPhone(localStorage.getItem('contact_channel_phone') || '+86 188 XXXX XXXX');

    setBrandHeroSubEn(localStorage.getItem('brand_hero_sub_en') || 'CREATIVITY & STRATEGIC INSIGHTS');
    setBrandHeroSubZh(localStorage.getItem('brand_hero_sub_zh') || '创造力、行动策展与高能战略主理');
    setBrandIntroEn(localStorage.getItem('brand_intro_en') || 'Personal Digital Space & Media Zine');
    setBrandIntroZh(localStorage.getItem('brand_intro_zh') || '个人数字空间 · 青年文创活动档案馆 · 独立媒介专栏');
    setBrandTitle1En(localStorage.getItem('brand_title1_en') || 'And the');
    setBrandTitle1Zh(localStorage.getItem('brand_title1_zh') || '而属于本地的');
    setBrandTitle2En(localStorage.getItem('brand_title2_en') || 'stories');
    setBrandTitle2Zh(localStorage.getItem('brand_title2_zh') || '广州故事');
    setBrandTitle3En(localStorage.getItem('brand_title3_en') || 'go on.');
    setBrandTitle3Zh(localStorage.getItem('brand_title3_zh') || '仍在续写。');

    setTimelineTitleEn(localStorage.getItem('timeline_title_en') || "Wendy LU's Journey");
    setTimelineTitleZh(localStorage.getItem('timeline_title_zh') || '陆芸的创作与生命行进年轮');
    setTimelineIntroEn(localStorage.getItem('timeline_intro_en') || "A chronological track of a multidisciplinary creator who combines storytelling, content strategy, academic research, functional design, and deep audience understanding. Moving seamlessly between physical layout, human reporting, creative brand campaigns, product lifecycle operations, and the ultimate critical analysis of media environments.");
    setTimelineIntroZh(localStorage.getItem('timeline_intro_zh') || "本时光记录档案追踪了一位集文字叙事、媒介传播策略、实地人种志采访、前端功能构建、以及重度人文宿愿于一体 of 跨媒介探索者。自如穿行在纸质印刷排印、老城街巷田野调研、创意品牌营销大促、数字化日常漏斗运营、以及表达社会学反思的媒介感知解密之间.");

    setRibbon1En(localStorage.getItem('ribbon_1_en') || 'MINIMALIST COMPOSITION');
    setRibbon1Zh(localStorage.getItem('ribbon_1_zh') || '秩序、极简网格构成');
    setRibbon2En(localStorage.getItem('ribbon_2_en') || 'BOLD GRIDS ALIGNMENT');
    setRibbon2Zh(localStorage.getItem('ribbon_2_zh') || '黑白高对比度排版');
    setRibbon3En(localStorage.getItem('ribbon_3_en') || 'GZ CULTURAL ARCHIVE');
    setRibbon3Zh(localStorage.getItem('ribbon_3_zh') || '广州青年文创活动档案');

    setAvatarB64(localStorage.getItem('logo_avatar_b64') || '');
    setAvatarHoverLeft(localStorage.getItem('logo_avatar_hover_left') || 'W. LU AVATAR');
    setAvatarHoverRight(localStorage.getItem('logo_avatar_hover_right') || 'COORD // GZ');
    
    setHomeModule1Bg(localStorage.getItem('home_module1_bg_b64') || '');
    setHomeModule2Bg(localStorage.getItem('home_module2_bg_b64') || '');
    setGlobalPageBg(localStorage.getItem('global_page_bg_b64') || '');

    setCustomCursorImage(localStorage.getItem('custom_cursor_image'));
    setCustomCursorSize(Number(localStorage.getItem('custom_cursor_size')) || 24);
    setCustomCursorEnabled(localStorage.getItem('custom_cursor_enabled') !== 'false');

    const nav = localStorage.getItem('custom_nav_items');
    if (nav) {
      try {
        setCustomNavItems(JSON.parse(nav));
      } catch (e) {}
    }

    setNoteTopSubtitleEn(localStorage.getItem('note_top_subtitle_en') || 'Reflections / Articles //');
    setNoteTopSubtitleZh(localStorage.getItem('note_top_subtitle_zh') || '视窗文章与社群反思 //');
    setNoteTopTitleEn(localStorage.getItem('note_top_title_en') || 'EDITORIAL ARCHIVE');
    setNoteTopTitleZh(localStorage.getItem('note_top_title_zh') || '学者专栏与纪实档案');
    setNoteBtnReadEn(localStorage.getItem('note_btn_read_en') || 'READ INSIGHTS');
    setNoteBtnReadZh(localStorage.getItem('note_btn_read_zh') || '研读解密');
    setNoteTitleInsightsEn(localStorage.getItem('note_title_insights_en') || 'EDITORIAL INSIGHT MAP');
    setNoteTitleInsightsZh(localStorage.getItem('note_title_insights_zh') || '研读主干与内容洞察');
    setNoteBtnLaunchEn(localStorage.getItem('note_btn_launch_en') || 'LAUNCH ORIGINAL INTERFACE');
    setNoteBtnLaunchZh(localStorage.getItem('note_btn_launch_zh') || '进入模拟/原文链道');
    setNoteBtnPublishEn(localStorage.getItem('note_btn_publish_en') || 'PUBLISH NEW ARTICLE');
    setNoteBtnPublishZh(localStorage.getItem('note_btn_publish_zh') || '发表新专栏文章');

    setAboutContactTitleEn(localStorage.getItem('about_contact_title_en') || 'CONTACT CHANNELS');
    setAboutContactTitleZh(localStorage.getItem('about_contact_title_zh') || '中枢直连通道');
    setAboutSkillsTitleEn(localStorage.getItem('about_skills_title_en') || 'CORE SKILLS & CRAFT');
    setAboutSkillsTitleZh(localStorage.getItem('about_skills_title_zh') || '核心实干兵器量仪');
    setAboutSkillsListEn(localStorage.getItem('about_skills_list_en') || 'Editorial typography design\nResponsive front-end layouts\nSpatial mapping & installation\nWeb Audio procedural synthesizers\nCommunity engagement strategies');
    setAboutSkillsListZh(localStorage.getItem('about_skills_list_zh') || '编排向社论式网格视觉极度洁癖调试\n完全响应式、语调简洁的前端页面集\n地方声音地标采集绘制与物理快闪体验装置\n基于前端原生 Web Audio 的简素音乐发生合成器\n微有机街区活化、工作坊主持与共创策划运营');
  };

  useEffect(() => {
    setupCloudSync();
    initializeCloudAndLocalData()
      .then(() => {
        reloadStatesFromStorage();
        setCloudLoading(false);
      })
      .catch((err) => {
        console.error('Failed to initialize cloud database data:', err);
        setCloudLoading(false);
      });
  }, []);

  // Timeline custom delete state modal
  const [timelineToDelete, setTimelineToDelete] = useState<string | null>(null);

  // Sub Tab inside Administration workplace
  const [adminSubTab, setAdminSubTab] = useState('dashboard');

  // Admin login states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => localStorage.getItem('admin_logged_in') === 'true');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Floating FAB & Quick Capture Panel States
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activeQuickForm, setActiveQuickForm] = useState<'project' | 'note' | 'library' | 'timeline' | 'profile' | null>(null);
  const [isBrandEditorOpen, setIsBrandEditorOpen] = useState(false);
  const [brandNameInput, setBrandNameInput] = useState(() => localStorage.getItem('brand_name') || 'WENDY LU');
  const [hoverLeftInput, setHoverLeftInput] = useState(() => localStorage.getItem('logo_avatar_hover_left') || 'W. LU AVATAR');
  const [hoverRightInput, setHoverRightInput] = useState(() => localStorage.getItem('logo_avatar_hover_right') || 'COORD // GZ');

  // Unified editing entity item state (if we edit via general manager instead of inline)
  const [editingTimelineItem, setEditingTimelineItem] = useState<TimelineEntry | null>(null);

  // Forms state for Timeline creation/edition
  const [timeYear, setTimeYear] = useState('');
  const [timeStepNum, setTimeStepNum] = useState('01');
  const [timePhaseEn, setTimePhaseEn] = useState('');
  const [timePhaseZh, setTimePhaseZh] = useState('');
  const [timeCategoryEn, setTimeCategoryEn] = useState('');
  const [timeCategoryZh, setTimeCategoryZh] = useState('');
  const [timeTitleEn, setTimeTitleEn] = useState('');
  const [timeTitleZh, setTimeTitleZh] = useState('');
  const [timeSubtitleEn, setTimeSubtitleEn] = useState('');
  const [timeSubtitleZh, setTimeSubtitleZh] = useState('');
  const [timeDescEn, setTimeDescEn] = useState('');
  const [timeDescZh, setTimeDescZh] = useState('');
  const [timeTagsEn, setTimeTagsEn] = useState('');
  const [timeTagsZh, setTimeTagsZh] = useState('');
  const [timeCmsStatus, setTimeCmsStatus] = useState<CMSStatus>('Published');
  const [timeVisibility, setTimeVisibility] = useState<CMSVisibility>('Public');
  const [timePinned, setTimePinned] = useState(false);

  // Form states for general additions from inside deep Studio
  const [addProjTitle, setAddProjTitle] = useState('');
  const [addProjCategory, setAddProjCategory] = useState<'Storytelling' | 'Campaigns' | 'Design & Creation' | 'Growth & Community' | 'About'>('Storytelling');
  const [addProjDate, setAddProjDate] = useState('');
  const [addProjDesc, setAddProjDesc] = useState('');
  const [addProjImg, setAddProjImg] = useState('https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80');
  const [addProjTags, setAddProjTags] = useState('Design, Grid');
  const [addProjClient, setAddProjClient] = useState('');
  const [addProjRole, setAddProjRole] = useState('');

  const [addNoteTitle, setAddNoteTitle] = useState('');
  const [addNoteSummary, setAddNoteSummary] = useState('');
  const [addNoteUrl, setAddNoteUrl] = useState('');
  const [addNoteTags, setAddNoteTags] = useState('');
  const [addNoteReadTime, setAddNoteReadTime] = useState('5 min read');

  const [addLibTitle, setAddLibTitle] = useState('');
  const [addLibCreator, setAddLibCreator] = useState('');
  const [addLibType, setAddLibType] = useState<'book' | 'movie' | 'music'>('book');
  const [addLibStatus, setAddLibStatus] = useState<'In Progress' | 'Completed' | 'Wishlist'>('Completed');
  const [addLibRating, setAddLibRating] = useState(5);
  const [addLibNote, setAddLibNote] = useState('');

  // Local messaging and translations
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const t = UI_TRANSLATIONS[lang];

  // Sync state data arrays to localStorage helper
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Admin authentication handlers
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === 'wendy') {
      setIsAdminLoggedIn(true);
      setLoginError('');
      localStorage.setItem('admin_logged_in', 'true');
      setPasscodeInput('');
    } else {
      setLoginError(lang === 'en' ? '⚠️ ACCESS CODE NOT AUTHORIZED' : '⚠️ 信道访问密钥错误，未获批准');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem('admin_logged_in', 'false');
  };

  // Contacts Form submit handler
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) return;
    setIsSent(true);

    const subject = `Message Inquiry from ${contactName}`;
    const body = `${contactMessage}\n\nSender Name: ${contactName}\nSender Email: ${contactEmail}`;
    const mailtoUrl = `mailto:wanyinglu3847@foxmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      setIsSent(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      
      // Redirect to mailto link
      window.location.href = mailtoUrl;

      alert(lang === 'en' 
        ? 'Communication launched! Opening your local email client with wanyinglu3847@foxmail.com...' 
        : '加密信件打包成功！正在调度您的本地电子邮箱客户端，投递传送至 wanyinglu3847@foxmail.com...');
    }, 1500);
  };

  // Open Timeline forms helper
  const handleOpenTimelineAdd = () => {
    setEditingTimelineItem(null);
    setActiveQuickForm('timeline');
    setTimeYear(new Date().getFullYear().toString());
    setTimeStepNum(String(timelineList.length + 1).padStart(2, '0'));
    setTimePhaseEn('');
    setTimePhaseZh('');
    setTimeCategoryEn('');
    setTimeCategoryZh('');
    setTimeTitleEn('');
    setTimeTitleZh('');
    setTimeSubtitleEn('');
    setTimeSubtitleZh('');
    setTimeDescEn('');
    setTimeDescZh('');
    setTimeTagsEn('');
    setTimeTagsZh('');
    setTimeCmsStatus('Published');
    setTimeVisibility('Public');
    setTimePinned(false);
  };

  const handleOpenTimelineEdit = (e: React.MouseEvent, entry: TimelineEntry) => {
    e.stopPropagation();
    setEditingTimelineItem(entry);
    setActiveQuickForm('timeline');
    setTimeYear(entry.year);
    
    const stepNum = entry.stepNum || entry.id.replace('time-', '').padStart(2, '0') || '01';
    const phaseEn = entry.phase_en || entry.phaseLabel?.replace(/^Phase \d+\s*\/\/\s*/i, '') || '';
    const phaseZh = entry.phase_zh || entry.phaseLabelZh?.replace(/^\d+阶段\s*\/\/\s*/i, '') || '';
    const categoryEn = entry.category_en || entry.categoryLabel || '';
    const categoryZh = entry.category_zh || entry.categoryLabelZh || '';
    const titleEn = entry.title_en || entry.stageTitle || '';
    const titleZh = entry.title_zh || entry.stageTitleZh || '';
    const subtitleEn = entry.subtitle_en || entry.subtitle || '';
    const subtitleZh = entry.subtitle_zh || entry.subtitleZh || '';
    const descriptionEn = entry.description_en || entry.description || '';
    const descriptionZh = entry.description_zh || entry.descriptionZh || '';
    const tagsEn = entry.tags_en || entry.tags || [];
    const tagsZh = entry.tags_zh || entry.tagsZh || [];

    setTimeStepNum(stepNum);
    setTimePhaseEn(phaseEn);
    setTimePhaseZh(phaseZh);
    setTimeCategoryEn(categoryEn);
    setTimeCategoryZh(categoryZh);
    setTimeTitleEn(titleEn);
    setTimeTitleZh(titleZh);
    setTimeSubtitleEn(subtitleEn);
    setTimeSubtitleZh(subtitleZh);
    setTimeDescEn(descriptionEn);
    setTimeDescZh(descriptionZh);
    setTimeTagsEn(tagsEn.join(', '));
    setTimeTagsZh(tagsZh.join(', '));
    setTimeCmsStatus(entry.status_cms || 'Published');
    setTimeVisibility(entry.visibility || 'Public');
    setTimePinned(entry.pinned || false);
  };

  const handleSaveTimelineForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeYear || !timeTitleEn || !timeTitleZh) return;

    const formattedTagsEn = timeTagsEn.split(',').map(tag => tag.trim()).filter(Boolean);
    const formattedTagsZh = timeTagsZh.split(',').map(tag => tag.trim()).filter(Boolean);

    if (editingTimelineItem) {
      // Edit mode
      const updated = timelineList.map(item => {
        if (item.id === editingTimelineItem.id) {
          const finalPhaseEn = timePhaseEn || 'Project Milestones';
          const finalPhaseZh = timePhaseZh || '生命里程碑';
          const finalCategoryEn = timeCategoryEn || 'Aesthetics';
          const finalCategoryZh = timeCategoryZh || '美化实践';
          const finalTitleEn = timeTitleEn;
          const finalTitleZh = timeTitleZh;
          const finalSubEn = timeSubtitleEn || 'Independent Studies';
          const finalSubZh = timeSubtitleZh || '独立探索';
          const finalDescEn = timeDescEn;
          const finalDescZh = timeDescZh;

          return {
            ...item,
            year: timeYear,
            stepNum: timeStepNum,
            
            phaseLabel: `Phase ${timeStepNum} // ${finalPhaseEn}`,
            phaseLabelZh: `${timeStepNum}阶段 // ${finalPhaseZh}`,
            categoryLabel: finalCategoryEn,
            categoryLabelZh: finalCategoryZh,
            stageTitle: finalTitleEn,
            stageTitleZh: finalTitleZh,
            subtitle: finalSubEn,
            subtitleZh: finalSubZh,
            description: finalDescEn,
            descriptionZh: finalDescZh,
            tags: formattedTagsEn,
            tagsZh: formattedTagsZh,

            phase_en: finalPhaseEn,
            phase_zh: finalPhaseZh,
            category_en: finalCategoryEn,
            category_zh: finalCategoryZh,
            title_en: finalTitleEn,
            title_zh: finalTitleZh,
            subtitle_en: finalSubEn,
            subtitle_zh: finalSubZh,
            description_en: finalDescEn,
            description_zh: finalDescZh,
            tags_en: formattedTagsEn,
            tags_zh: formattedTagsZh,
            status_cms: timeCmsStatus,
            status: timeCmsStatus,
            visibility: timeVisibility,
            pinned: timePinned
          };
        }
        return item;
      });
      setTimelineList(updated);
      saveToLocal('archive_timeline', updated);
    } else {
      // Add mode
      const finalPhaseEn = timePhaseEn || 'Project Milestones';
      const finalPhaseZh = timePhaseZh || '生命里程碑';
      const finalCategoryEn = timeCategoryEn || 'Aesthetics';
      const finalCategoryZh = timeCategoryZh || '美化实践';
      const finalTitleEn = timeTitleEn;
      const finalTitleZh = timeTitleZh;
      const finalSubEn = timeSubtitleEn || 'Independent Studies';
      const finalSubZh = timeSubtitleZh || '独立探索';
      const finalDescEn = timeDescEn;
      const finalDescZh = timeDescZh;

      const newEntry: TimelineEntry = {
        id: `time-${Date.now()}`,
        year: timeYear,
        stepNum: timeStepNum,

        phaseLabel: `Phase ${timeStepNum} // ${finalPhaseEn}`,
        phaseLabelZh: `${timeStepNum}阶段 // ${finalPhaseZh}`,
        categoryLabel: finalCategoryEn,
        categoryLabelZh: finalCategoryZh,
        stageTitle: finalTitleEn,
        stageTitleZh: finalTitleZh,
        subtitle: finalSubEn,
        subtitleZh: finalSubZh,
        description: finalDescEn,
        descriptionZh: finalDescZh,
        tags: formattedTagsEn,
        tagsZh: formattedTagsZh,

        phase_en: finalPhaseEn,
        phase_zh: finalPhaseZh,
        category_en: finalCategoryEn,
        category_zh: finalCategoryZh,
        title_en: finalTitleEn,
        title_zh: finalTitleZh,
        subtitle_en: finalSubEn,
        subtitle_zh: finalSubZh,
        description_en: finalDescEn,
        description_zh: finalDescZh,
        tags_en: formattedTagsEn,
        tags_zh: formattedTagsZh,
        status_cms: timeCmsStatus,
        status: timeCmsStatus,
        visibility: timeVisibility,
        pinned: timePinned
      };
      const updated = [newEntry, ...timelineList];
      setTimelineList(updated);
      saveToLocal('archive_timeline', updated);
    }

    setEditingTimelineItem(null);
    setActiveQuickForm(null);
    setIsFabOpen(false);
  };

  const handleDeleteTimeline = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(lang === 'en' ? 'Permanently delete this timeline event?' : '确认要永久回滚并删除此条记录？')) return;
    const updated = timelineList.filter(item => item.id !== id);
    setTimelineList(updated);
    saveToLocal('archive_timeline', updated);
  };

  const handleTimelineDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTimelineDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTimelineDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;

    const newList = [...timelineList];
    const srcIndex = newList.findIndex(item => item.id === sourceId);
    const tarIndex = newList.findIndex(item => item.id === targetId);
    if (srcIndex === -1 || tarIndex === -1) return;

    const [removed] = newList.splice(srcIndex, 1);
    newList.splice(tarIndex, 0, removed);

    setTimelineList(newList);
    saveToLocal('archive_timeline', newList);
    setDraggableTimelineId(null);
  };

  // Generic direct creators for Deep Studio Quick Capture inputs
  const handleDirectAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addProjTitle.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: addProjTitle,
      category: addProjCategory,
      date: addProjDate || new Date().toISOString().split('T')[0].substring(0, 7),
      description: addProjDesc,
      details: lang === 'en' 
        ? ['Project archived secure index.', 'Editorial visual aligned.']
        : ['艺术项目通过索引入编。', '页面对齐网格走查完毕。'],
      imageUrl: addProjImg,
      tags: addProjTags.split(',').map(t => t.trim()).filter(Boolean),
      client: addProjClient || 'Wendy Lu Archive',
      role: addProjRole || 'Lead Practitioner',
      status_cms: 'Published',
      visibility: 'Public',
      pinned: false
    };

    const updated = [newProj, ...projectsList];
    setProjectsList(updated);
    saveToLocal('archive_projects', updated);

    setAddProjTitle('');
    setAddProjDesc('');
    setAddProjClient('');
    setAddProjRole('');
    setActiveQuickForm(null);
    setIsFabOpen(false);
    alert(lang === 'en' ? 'Portfolio item added successfully.' : '新作品成功发布并载入索引！');
  };

  const handleDirectAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNoteTitle.trim() || !addNoteUrl.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: addNoteTitle,
      summary: addNoteSummary,
      url: addNoteUrl,
      tags: addNoteTags.split(',').map(t => t.trim()).filter(Boolean),
      readTime: addNoteReadTime,
      publishDate: new Date().toISOString().split('T')[0],
      date_published: new Date().toISOString().split('T')[0],
      status: 'Published',
      status_cms: 'Published',
      visibility: 'Public',
      pinned: false
    };

    const updated = [newNote, ...notesList];
    setNotesList(updated);
    saveToLocal('archive_notes', updated);

    setAddNoteTitle('');
    setAddNoteSummary('');
    setAddNoteUrl('');
    setAddNoteTags('');
    setActiveQuickForm(null);
    setIsFabOpen(false);
    alert(lang === 'en' ? 'Note item added successfully.' : '笔记成功建立并索引公开！');
  };

  const handleDirectAddLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addLibTitle.trim() || !addLibCreator.trim()) return;

    const newLib: LibraryItem = {
      id: `lib-${Date.now()}`,
      type: addLibType,
      title: addLibTitle,
      creator: addLibCreator,
      status: addLibStatus,
      rating: addLibRating,
      date: new Date().toISOString().split('T')[0],
      note: addLibNote || undefined,
      coverColor: '#171717',
      status_cms: 'Published',
      visibility: 'Public',
      pinned: false
    };

    const updated = [newLib, ...libraryList];
    setLibraryList(updated);
    saveToLocal('archive_library', updated);

    setAddLibTitle('');
    setAddLibCreator('');
    setAddLibNote('');
    setActiveQuickForm(null);
    setIsFabOpen(false);
    alert(lang === 'en' ? 'Library audit indexed.' : '文献书影归档记录新增发布成功！');
  };

  // Backups / Database serialization exports & imports
  const handleExportSystemSchema = () => {
    // 1. Pre-populate backupData with the actual current state variables to ensure 100% completeness
    const backupData: Record<string, string> = {
      // List Structures
      archive_projects: JSON.stringify(projectsList),
      archive_notes: JSON.stringify(notesList),
      archive_library: JSON.stringify(libraryList),
      archive_timeline: JSON.stringify(timelineList),
      playlist_tracks: JSON.stringify(customTracks),
      custom_nav_items: JSON.stringify(customNavItems),

      // About Copy & Biography
      about_title_en: profileTitleEn,
      about_title_zh: profileTitleZh,
      about_sub_en: profileSubEn,
      about_sub_zh: profileSubZh,
      about_bio_en: profileBioEn,
      about_bio_zh: profileBioZh,
      about_second_en: profileSecondEn,
      about_second_zh: profileSecondZh,
      about_contact_title_en: aboutContactTitleEn,
      about_contact_title_zh: aboutContactTitleZh,
      about_skills_title_en: aboutSkillsTitleEn,
      about_skills_title_zh: aboutSkillsTitleZh,
      about_skills_list_en: aboutSkillsListEn,
      about_skills_list_zh: aboutSkillsListZh,

      // Contact Channels
      contact_channel_email: contactChannelEmail,
      contact_channel_linkedin: contactChannelLinkedin,
      contact_channel_phone: contactChannelPhone,
      contact_label_en: contactLabelEn,
      contact_label_zh: contactLabelZh,
      contact_title_en: contactTitleEn,
      contact_title_zh: contactTitleZh,
      contact_hq_en: contactHqEn,
      contact_hq_zh: contactHqZh,
      contact_desc_en: contactDescEn,
      contact_desc_zh: contactDescZh,

      // Brand / Homepage Slogans
      brand_hero_sub_en: brandHeroSubEn,
      brand_hero_sub_zh: brandHeroSubZh,
      brand_intro_en: brandIntroEn,
      brand_intro_zh: brandIntroZh,
      brand_title1_en: brandTitle1En,
      brand_title1_zh: brandTitle1Zh,
      brand_title2_en: brandTitle2En,
      brand_title2_zh: brandTitle2Zh,
      brand_title3_en: brandTitle3En,
      brand_title3_zh: brandTitle3Zh,
      brand_name: brandNameInput,

      // Quote Ribbons & Curated Titles
      ribbon_1_en: ribbon1En,
      ribbon_1_zh: ribbon1Zh,
      ribbon_2_en: ribbon2En,
      ribbon_2_zh: ribbon2Zh,
      ribbon_3_en: ribbon3En,
      ribbon_3_zh: ribbon3Zh,
      curated_archives_title_en: curatedArchivesTitleEn,
      curated_archives_title_zh: curatedArchivesTitleZh,

      // Showcases
      showcase_1_badge_en: showcase1BadgeEn,
      showcase_1_badge_zh: showcase1BadgeZh,
      showcase_1_subtitle_en: showcase1SubtitleEn,
      showcase_1_subtitle_zh: showcase1SubtitleZh,
      showcase_1_title_en: showcase1TitleEn,
      showcase_1_title_zh: showcase1TitleZh,
      showcase_1_redirect: showcase1Redirect,
      showcase_2_badge_en: showcase2BadgeEn,
      showcase_2_badge_zh: showcase2BadgeZh,
      showcase_2_title_en: showcase2TitleEn,
      showcase_2_title_zh: showcase2TitleZh,
      showcase_2_desc_en: showcase2DescEn,
      showcase_2_desc_zh: showcase2DescZh,
      showcase_2_redirect: showcase2Redirect,

      // Timeline Title & Intro
      timeline_title_en: timelineTitleEn,
      timeline_title_zh: timelineTitleZh,
      timeline_intro_en: timelineIntroEn,
      timeline_intro_zh: timelineIntroZh,

      // Visuals, Images & Avatars
      logo_avatar_b64: avatarB64,
      logo_avatar_hover_left: avatarHoverLeft,
      logo_avatar_hover_right: avatarHoverRight,
      home_module1_bg_b64: homeModule1Bg,
      home_module2_bg_b64: homeModule2Bg,
      global_page_bg_b64: globalPageBg,

      // Custom Cursor
      custom_cursor_image: customCursorImage || '',
      custom_cursor_size: String(customCursorSize),
      custom_cursor_enabled: String(customCursorEnabled),

      // Notes Layout & Copy elements
      note_top_subtitle_en: noteTopSubtitleEn,
      note_top_subtitle_zh: noteTopSubtitleZh,
      note_top_title_en: noteTopTitleEn,
      note_top_title_zh: noteTopTitleZh,
      note_btn_read_en: noteBtnReadEn,
      note_btn_read_zh: noteBtnReadZh,
      note_title_insights_en: noteTitleInsightsEn,
      note_title_insights_zh: noteTitleInsightsZh,
      note_btn_launch_en: noteBtnLaunchEn,
      note_btn_launch_zh: noteBtnLaunchZh,
      note_btn_publish_en: noteBtnPublishEn,
      note_btn_publish_zh: noteBtnPublishZh
    };

    const whitelist = [
      'archive_projects', 'archive_notes', 'archive_library', 'archive_timeline',
      'playlist_tracks', 'custom_nav_items', 'about_title_en', 'about_title_zh',
      'about_sub_en', 'about_sub_zh', 'about_bio_en', 'about_bio_zh',
      'about_second_en', 'about_second_zh', 'contact_channel_email',
      'contact_channel_linkedin', 'contact_channel_phone', 'brand_hero_sub_en',
      'brand_hero_sub_zh', 'brand_intro_en', 'brand_intro_zh', 'brand_title1_en',
      'brand_title1_zh', 'brand_title2_en', 'brand_title2_zh', 'brand_title3_en',
      'brand_title3_zh', 'timeline_title_en', 'timeline_title_zh', 'timeline_intro_en',
      'timeline_intro_zh', 'ribbon_1_en', 'ribbon_1_zh', 'ribbon_2_en', 'ribbon_2_zh',
      'ribbon_3_en', 'ribbon_3_zh', 'logo_avatar_b64', 'logo_avatar_hover_left',
      'logo_avatar_hover_right', 'brand_name', 'home_module1_bg_b64', 'home_module2_bg_b64',
      'global_page_bg_b64', 'custom_cursor_image', 'custom_cursor_size', 'custom_cursor_enabled',
      'note_top_subtitle_en', 'note_top_subtitle_zh', 'note_top_title_en', 'note_top_title_zh',
      'note_btn_read_en', 'note_btn_read_zh', 'note_title_insights_en', 'note_title_insights_zh',
      'note_btn_launch_en', 'note_btn_launch_zh', 'note_btn_publish_en', 'note_btn_publish_zh',
      'about_contact_title_en', 'about_contact_title_zh', 'about_skills_title_en', 'about_skills_title_zh',
      'about_skills_list_en', 'about_skills_list_zh', 'works_about_title_en', 'works_about_title_zh',
      'works_about_desc_en', 'works_about_desc_zh', 'works_about_aes_en', 'works_about_aes_zh',
      'works_about_aes_desc_en', 'works_about_aes_desc_zh', 'works_about_tool_en', 'works_about_tool_zh',
      'works_about_tool_desc_en', 'works_about_tool_desc_zh', 'showcase_1_subtitle_en', 'showcase_1_subtitle_zh',
      'showcase_1_title_en', 'showcase_1_title_zh', 'showcase_1_redirect', 'showcase_2_badge_en',
      'showcase_2_badge_zh', 'showcase_2_title_en', 'showcase_2_title_zh', 'showcase_2_desc_en',
      'showcase_2_desc_zh', 'showcase_2_redirect', 'contact_label_en', 'contact_label_zh',
      'contact_title_en', 'contact_title_zh', 'contact_hq_en', 'contact_hq_zh',
      'contact_desc_en', 'contact_desc_zh'
    ];

    // 2. Scan localStorage for any other keys matching whitelist or prefixes (e.g. customized list indices)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const isSystem = key === 'admin_logged_in' || key.startsWith('firebase') || key.startsWith('loglevel');
        const isWhitelisted = whitelist.includes(key);
        const prefixList = [
          'archive_', 'about_', 'brand_', 'timeline_', 'showcase_', 'works_about_',
          'contact_', 'curated_', 'note_', 'playlist_', 'custom_', 'logo_',
          'global_', 'ribbon_', 'home_'
        ];
        const hasPrefix = prefixList.some(pref => key.startsWith(pref));
        
        if ((isWhitelisted || hasPrefix) && !isSystem) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            backupData[key] = value;
          }
        }
      }
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.download = `portfolio-backup-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSystemSchema = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing a backup will overwrite the current local portfolio data. Continue?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const rawText = event.target?.result as string;
        const parsed = JSON.parse(rawText);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Invalid backup file structure: Must be a JSON object.');
        }

        // Detect if it is the old nested format or the new flat format
        const isOldFormat = 'projects' in parsed || 'notes' in parsed || 'library' in parsed || 'timeline' in parsed || 'profile' in parsed;

        if (isOldFormat) {
          // Backward compatibility support for old nested format
          if (parsed.projects && Array.isArray(parsed.projects)) {
            localStorage.setItem('archive_projects', JSON.stringify(parsed.projects));
          }
          if (parsed.notes && Array.isArray(parsed.notes)) {
            localStorage.setItem('archive_notes', JSON.stringify(parsed.notes));
          }
          if (parsed.library && Array.isArray(parsed.library)) {
            localStorage.setItem('archive_library', JSON.stringify(parsed.library));
          }
          if (parsed.timeline && Array.isArray(parsed.timeline)) {
            localStorage.setItem('archive_timeline', JSON.stringify(parsed.timeline));
          }
          if (parsed.profile && typeof parsed.profile === 'object') {
            const p = parsed.profile;
            if (p.titleEn) localStorage.setItem('about_title_en', p.titleEn);
            if (p.titleZh) localStorage.setItem('about_title_zh', p.titleZh);
            if (p.subEn) localStorage.setItem('about_sub_en', p.subEn);
            if (p.subZh) localStorage.setItem('about_sub_zh', p.subZh);
            if (p.bioEn) localStorage.setItem('about_bio_en', p.bioEn);
            if (p.bioZh) localStorage.setItem('about_bio_zh', p.bioZh);
            if (p.secondEn) localStorage.setItem('about_second_en', p.secondEn);
            if (p.secondZh) localStorage.setItem('about_second_zh', p.secondZh);
          }
        } else {
          // New flat format - Restore every key precisely
          const whitelist = [
            'archive_projects', 'archive_notes', 'archive_library', 'archive_timeline',
            'playlist_tracks', 'custom_nav_items', 'about_title_en', 'about_title_zh',
            'about_sub_en', 'about_sub_zh', 'about_bio_en', 'about_bio_zh',
            'about_second_en', 'about_second_zh', 'contact_channel_email',
            'contact_channel_linkedin', 'contact_channel_phone', 'brand_hero_sub_en',
            'brand_hero_sub_zh', 'brand_intro_en', 'brand_intro_zh', 'brand_title1_en',
            'brand_title1_zh', 'brand_title2_en', 'brand_title2_zh', 'brand_title3_en',
            'brand_title3_zh', 'timeline_title_en', 'timeline_title_zh', 'timeline_intro_en',
            'timeline_intro_zh', 'ribbon_1_en', 'ribbon_1_zh', 'ribbon_2_en', 'ribbon_2_zh',
            'ribbon_3_en', 'ribbon_3_zh', 'logo_avatar_b64', 'logo_avatar_hover_left',
            'logo_avatar_hover_right', 'brand_name', 'home_module1_bg_b64', 'home_module2_bg_b64',
            'global_page_bg_b64', 'custom_cursor_image', 'custom_cursor_size', 'custom_cursor_enabled',
            'note_top_subtitle_en', 'note_top_subtitle_zh', 'note_top_title_en', 'note_top_title_zh',
            'note_btn_read_en', 'note_btn_read_zh', 'note_title_insights_en', 'note_title_insights_zh',
            'note_btn_launch_en', 'note_btn_launch_zh', 'note_btn_publish_en', 'note_btn_publish_zh',
            'about_contact_title_en', 'about_contact_title_zh', 'about_skills_title_en', 'about_skills_title_zh',
            'about_skills_list_en', 'about_skills_list_zh', 'works_about_title_en', 'works_about_title_zh',
            'works_about_desc_en', 'works_about_desc_zh', 'works_about_aes_en', 'works_about_aes_zh',
            'works_about_aes_desc_en', 'works_about_aes_desc_zh', 'works_about_tool_en', 'works_about_tool_zh',
            'works_about_tool_desc_en', 'works_about_tool_desc_zh', 'showcase_1_subtitle_en', 'showcase_1_subtitle_zh',
            'showcase_1_title_en', 'showcase_1_title_zh', 'showcase_1_redirect', 'showcase_2_badge_en',
            'showcase_2_badge_zh', 'showcase_2_title_en', 'showcase_2_title_zh', 'showcase_2_desc_en',
            'showcase_2_desc_zh', 'showcase_2_redirect', 'contact_label_en', 'contact_label_zh',
            'contact_title_en', 'contact_title_zh', 'contact_hq_en', 'contact_hq_zh',
            'contact_desc_en', 'contact_desc_zh'
          ];

          for (const [key, value] of Object.entries(parsed)) {
            const isSystem = key === 'admin_logged_in' || key.startsWith('firebase') || key.startsWith('loglevel');
            const isWhitelisted = whitelist.includes(key);
            const prefixList = [
              'archive_', 'about_', 'brand_', 'timeline_', 'showcase_', 'works_about_',
              'contact_', 'curated_', 'note_', 'playlist_', 'custom_', 'logo_',
              'global_', 'ribbon_', 'home_'
            ];
            const hasPrefix = prefixList.some(pref => key.startsWith(pref));

            if ((isWhitelisted || hasPrefix) && !isSystem && value !== null && value !== undefined) {
              localStorage.setItem(key, String(value));
            }
          }
        }

        // Trigger existing cloud synchronization and wait for it to finish
        await forceSyncToCloud();

        // Inform user of success
        alert(lang === 'en' ? '💡 PORTFOLIO RESTORED & SYNCED TO CLOUD SUCCESSFULLY!' : '💡 核心系统数据库恢复与云端档案库同步覆盖成功！');
        
        // Refresh the application automatically
        window.location.reload();
      } catch (err: any) {
        alert(lang === 'en' 
          ? `❌ Backup restoration failed: ${err?.message || 'Invalid JSON format'}` 
          : `❌ 上传备份文件格式解析错误: ${err?.message || '不合法的 JSON 格式'}`);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleBgImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (b64: string) => void,
    storageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string || '';
      setter(result);
      localStorage.setItem(storageKey, result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaults = () => {
    if (!confirm(lang === 'en' ? '⚠️ WARNING: Purge all local draft database items and revert to stock assets?' : '⚠️ 严重警告：确认清空所有网页端已经发布编辑的数据，并重置回初始自带默认状态？')) return;
    localStorage.clear();
    setProjectsList(INITIAL_PROJECTS);
    setNotesList(INITIAL_NOTES);
    setLibraryList(INITIAL_LIBRARY);
    setTimelineList(INITIAL_TIMELINE);
    
    setProfileTitleEn('PRACTITIONER PROFILE');
    setProfileTitleZh('主理人艺术档案');
    setProfileSubEn('DESIGNER, CURATOR, DEVELOPER.');
    setProfileSubZh('她是写作者、产品运营、亦是独立设计策划人。');
    setProfileBioEn('I believe the spaces we inhabit—both digital frameworks and physical neighborhoods—should tell coherent stories. By blending Swiss editorial grid structures with nostalgic digital accents, I craft dynamic online experiences that prioritize high readability, typographic balance, and physical ecosystem values.');
    setProfileBioZh('我始终深信，我们肉身所处的物理街弄、与指尖停留滑动、呼吸倾听的数字屏幕架构，都理应孕育深厚连贯的时代叙事。我潜心将高冷理性、遵循网格神圣纪律的瑞士排版原则，与流淌着电子霓虹和市景体温的拟物元素相叠。创造高阶文本可读性、极其苛求版面平衡、且温润善意的互联网栖息地。');
    setProfileSecondEn('My studies explore how cultural heritage and youth behavior patterns can be cataloged through robust visual mediums. This exploration translates into public programs, publications, indie-game exhibits, and custom web applications.');
    setProfileSecondZh('我的关切始终环绕在——怎么依靠视觉媒介的秩序、以及数字音像系统的质感，来细致而无损害地归档那些隐微脆弱的本土市民地方记忆、及边缘生长的当代青年族群趣味。这一切被转化为富有生命张力的线下公共教育工作坊、实验小册子、像素风漫游展品、并最终凝缩在一行行富于动态美感的产品程序里。');
    
    setContactChannelEmail('wlu7853@gmail.com');
    setContactChannelLinkedin('linkedin.com/in/w-archive');
    setContactChannelPhone('+86 188 XXXX XXXX');

    setBrandHeroSubEn('CREATIVITY & STRATEGIC INSIGHTS');
    setBrandHeroSubZh('创造力、行动策展与高能战略主理');
    setBrandIntroEn('Personal Digital Space & Media Zine');
    setBrandIntroZh('个人数字空间 · 青年文创活动档案馆 · 独立媒介专栏');
    setBrandTitle1En('And the');
    setBrandTitle1Zh('而属于本地的');
    setBrandTitle2En('stories');
    setBrandTitle2Zh('广州故事');
    setBrandTitle3En('go on.');
    setBrandTitle3Zh('仍在续写。');

    setTimelineTitleEn("Wendy LU's Journey");
    setTimelineTitleZh('陆芸的创作与生命行进年轮');
    setTimelineIntroEn("A chronological track of a multidisciplinary creator who combines storytelling, content strategy, academic research, functional design, and deep audience understanding. Moving seamlessly between physical layout, human reporting, creative brand campaigns, product lifecycle operations, and the ultimate critical analysis of media environments.");
    setTimelineIntroZh("本时光记录档案追踪了一位集文字叙事、媒介传播策略、实地人种志采访、前端功能构建、以及重度人文宿愿于一体的跨媒介探索者。自如穿行在纸质印刷排印、老城街巷田野调研、创意品牌营销大促、数字化日常漏斗运营、以及表达社会学反思的媒介感知解密之间。");
    
    setAvatarHoverLeft('W. LU AVATAR');
    setAvatarHoverRight('COORD // GZ');
    setIsAdminLoggedIn(false);
    alert(lang === 'en' ? 'System restored cleanly.' : '系统重置复位成功。');
  };

  // Headline profile change saves
  const handleSaveProfileConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('about_title_en', profileTitleEn);
    localStorage.setItem('about_title_zh', profileTitleZh);
    localStorage.setItem('about_sub_en', profileSubEn);
    localStorage.setItem('about_sub_zh', profileSubZh);
    localStorage.setItem('about_bio_en', profileBioEn);
    localStorage.setItem('about_bio_zh', profileBioZh);
    localStorage.setItem('about_second_en', profileSecondEn);
    localStorage.setItem('about_second_zh', profileSecondZh);
    localStorage.setItem('contact_channel_email', contactChannelEmail);
    localStorage.setItem('contact_channel_linkedin', contactChannelLinkedin);
    localStorage.setItem('contact_channel_phone', contactChannelPhone);

    localStorage.setItem('about_contact_title_en', aboutContactTitleEn);
    localStorage.setItem('about_contact_title_zh', aboutContactTitleZh);
    localStorage.setItem('about_skills_title_en', aboutSkillsTitleEn);
    localStorage.setItem('about_skills_title_zh', aboutSkillsTitleZh);
    localStorage.setItem('about_skills_list_en', aboutSkillsListEn);
    localStorage.setItem('about_skills_list_zh', aboutSkillsListZh);

    localStorage.setItem('brand_hero_sub_en', brandHeroSubEn);
    localStorage.setItem('brand_hero_sub_zh', brandHeroSubZh);
    localStorage.setItem('brand_intro_en', brandIntroEn);
    localStorage.setItem('brand_intro_zh', brandIntroZh);
    localStorage.setItem('brand_title1_en', brandTitle1En);
    localStorage.setItem('brand_title1_zh', brandTitle1Zh);
    localStorage.setItem('brand_title2_en', brandTitle2En);
    localStorage.setItem('brand_title2_zh', brandTitle2Zh);
    localStorage.setItem('brand_title3_en', brandTitle3En);
    localStorage.setItem('brand_title3_zh', brandTitle3Zh);

    localStorage.setItem('ribbon_1_en', ribbon1En);
    localStorage.setItem('ribbon_1_zh', ribbon1Zh);
    localStorage.setItem('ribbon_2_en', ribbon2En);
    localStorage.setItem('ribbon_2_zh', ribbon2Zh);
    localStorage.setItem('ribbon_3_en', ribbon3En);
    localStorage.setItem('ribbon_3_zh', ribbon3Zh);

    localStorage.setItem('curated_archives_title_en', curatedArchivesTitleEn);
    localStorage.setItem('curated_archives_title_zh', curatedArchivesTitleZh);

    localStorage.setItem('showcase_1_badge_en', showcase1BadgeEn);
    localStorage.setItem('showcase_1_badge_zh', showcase1BadgeZh);
    localStorage.setItem('showcase_1_subtitle_en', showcase1SubtitleEn);
    localStorage.setItem('showcase_1_subtitle_zh', showcase1SubtitleZh);
    localStorage.setItem('showcase_1_title_en', showcase1TitleEn);
    localStorage.setItem('showcase_1_title_zh', showcase1TitleZh);
    localStorage.setItem('showcase_1_redirect', showcase1Redirect);

    localStorage.setItem('showcase_2_badge_en', showcase2BadgeEn);
    localStorage.setItem('showcase_2_badge_zh', showcase2BadgeZh);
    localStorage.setItem('showcase_2_title_en', showcase2TitleEn);
    localStorage.setItem('showcase_2_title_zh', showcase2TitleZh);
    localStorage.setItem('showcase_2_desc_en', showcase2DescEn);
    localStorage.setItem('showcase_2_desc_zh', showcase2DescZh);
    localStorage.setItem('showcase_2_redirect', showcase2Redirect);

    localStorage.setItem('timeline_title_en', timelineTitleEn);
    localStorage.setItem('timeline_title_zh', timelineTitleZh);
    localStorage.setItem('timeline_intro_en', timelineIntroEn);
    localStorage.setItem('timeline_intro_zh', timelineIntroZh);

    localStorage.setItem('logo_avatar_hover_left', avatarHoverLeft);
    localStorage.setItem('logo_avatar_hover_right', avatarHoverRight);
    localStorage.setItem('home_module1_bg_b64', homeModule1Bg);
    localStorage.setItem('home_module2_bg_b64', homeModule2Bg);
    localStorage.setItem('global_page_bg_b64', globalPageBg);
    window.dispatchEvent(new Event('avatar-updated'));

    setActiveQuickForm(null);
    setIsFabOpen(false);
    alert(lang === 'en' ? 'Practitioner page configs updated successfully.' : '全局中英双语版面文本与各子板块内容配置已成功保全更新！');
  };

  // Filtering for Guest View on Timeline sorted from near (most recent) to far (oldest)
  const visibleTimelineList = timelineList.filter(item => {
    if (isAdminLoggedIn) return true;
    const isDraft = item.status_cms === 'Draft' || item.status_cms === 'Archived';
    const isPrivate = item.visibility === 'Private';
    return !isDraft && !isPrivate;
  });

  const cursorStyle = (customCursorEnabled && customCursorImage) ? {
    cursor: `url(${customCursorImage}) 0 0, auto`
  } : {};

  if (cloudLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center font-mono text-xs text-black">
        <div className="space-y-4 text-center max-w-xs px-6">
          <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-extrabold tracking-widest uppercase">W. LU ARCHIVE</div>
          <div className="text-[10px] text-neutral-500">
            {lang === 'en' ? 'Synchronizing media archive from Cloud Firestore...' : '正在建立与 Cloud Firestore 云端档案库的安全信道连接...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="full-system-container" style={cursorStyle} className="min-h-screen bg-neutral-100 flex flex-col justify-between selection:bg-black selection:text-white relative font-sans overflow-x-hidden pt-12 pb-14 md:pb-0 md:pr-0">
      
      {/* Background Interactive Canvas Animation (Color themes purged) */}
      <InteractiveBg />

      {/* Global Background Image Underlay */}
      {globalPageBg && (
        <div 
          className="fixed inset-0 w-full h-full pointer-events-none z-0" 
          style={{ 
            backgroundImage: `url(${globalPageBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            opacity: 0.14
          }} 
        />
      )}

      {/* Music Playlist Control Box (Integrated in standard locations) */}
      <div id="procedural-synth-playlist-badge" className="fixed top-2 left-4 md:left-6 z-50">
        <Playlist tracks={customTracks} themeColor="#000000" />
      </div>

      {/* Floating Transition Animation Overlay */}
      <AnimatePresence mode="wait">
        {transitionStage !== 'idle' && (
          <motion.div
            key="screen-wiper-wipe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 bg-neutral-950/90 z-50 flex flex-col justify-center items-center select-none"
          >
            <div className="space-y-4 text-center">
              <span className="font-mono text-[9px] text-zinc-400 font-black uppercase tracking-[0.4em] block animate-pulse">
                Wendy LU // PORT SYSTEM INDEX
              </span>
              <h2 className="font-serif text-3xl font-black italic text-white tracking-widest uppercase">
                {nextTab ? nextTab : activeTab}
              </h2>
              <div className="flex justify-center items-center gap-1.5 font-mono text-[9px] text-zinc-500 font-bold">
                <span>TRANSITION ACTIVE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-ping" />
              </div>
              
              <div className="w-48 h-[3px] border border-neutral-800 bg-neutral-900 mx-auto relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: transitionStage === 'covering' ? '100%' : '0%' }}
                  transition={{ duration: 0.45, ease: 'linear' }}
                  className="h-full bg-white"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Structural Outer Frame styled like a Swiss architectural zine layout */}
      <div className="flex-1 flex flex-col md:flex-row w-full bg-white/30 backdrop-blur-[1px] border-2 border-black relative shadow-2xl overflow-hidden min-h-[calc(100vh-3rem)]">
        
        {/* DECORATION PIXEL CORNERS IN THE BORDER LAYOUT */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-black pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-black pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-black pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-black pointer-events-none z-10" />

        {/* LEFT COLUMN BRICK: LOGO DISPLAY & VERTICAL SLIDER STICKER */}
        <aside className="w-full md:w-28 md:fixed md:left-0 md:top-0 md:bottom-0 border-b-2 md:border-b-0 md:border-r-2 border-black flex flex-row md:flex-col items-center justify-between p-4 md:py-6 shrink-0 bg-[#fafaf9]/30 backdrop-blur-[1px] z-40">
          <div className="flex flex-col md:w-full gap-3.5 items-center md:items-center text-center">
            <Logo />
            
            {/* Quick Sidebar Login Entrance */}
            <div className="mt-3 pt-3 border-t border-dashed border-neutral-300 w-full hidden md:flex flex-col gap-1.5 font-mono text-[9px] text-zinc-600">
              {isAdminLoggedIn ? (
                <div className="space-y-1 w-full text-left">
                  <div className="flex items-center gap-1 text-black font-bold uppercase tracking-wider select-none">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse shrink-0" />
                    <span className="text-[8px]">ADMIN ON</span>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="w-full text-center py-0.5 mt-0.5 font-bold bg-black text-white hover:bg-neutral-800 transition-all border border-black cursor-pointer uppercase text-[8px]"
                  >
                    {lang === 'en' ? '[LOGOUT]' : '[安全退出]'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-1 w-full">
                  <span className="text-zinc-500 font-extrabold uppercase block text-[7.5px] tracking-wider select-none">
                    {lang === 'en' ? '🔐 STUDIO KEY' : '🔐 密钥登录'}
                  </span>
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    placeholder={lang === 'en' ? "Key..." : "凭据..."}
                    className="w-full border border-black px-1 py-0.5 bg-white text-[8px] leading-tight outline-none placeholder-zinc-400 text-center"
                  />
                  <button
                    type="submit"
                    className="w-full text-center py-0.5 bg-neutral-200 border border-black hover:bg-black hover:text-white transition-all font-bold uppercase text-[7.5px] cursor-pointer"
                  >
                    ENTER
                  </button>
                  {loginError && (
                    <span className="text-red-500 block text-[7px] leading-tight font-black select-none mt-0.5">
                      {lang === 'en' ? 'KEY_ERR' : '密钥错误'}
                    </span>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Mobile Quick Login Trigger */}
          <div className="md:hidden flex items-center gap-2 font-mono text-[9px]">
            {isAdminLoggedIn ? (
              <button
                onClick={handleAdminLogout}
                className="px-2 py-1 bg-black text-white border border-black font-bold uppercase text-[9px] cursor-pointer"
              >
                {lang === 'en' ? 'Logout' : '退出'}
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('admin');
                }}
                className="px-2 py-1 bg-black text-white border border-black font-bold uppercase text-[9px] flex items-center gap-1 cursor-pointer"
              >
                <span>🔑 Admin</span>
              </button>
            )}
          </div>
          
          <div className="hidden md:flex flex-col items-center gap-2 mt-auto">
            <div style={{ writingMode: 'vertical-rl' }} className="rotate-180 text-[8.5px] tracking-[0.2em] font-mono text-neutral-400 font-extrabold uppercase py-2 select-none">
              EDITORIAL STUDY ARCHIVE // VOL.2026
            </div>
            {/* The studio system board gear UI moved to the bottom left */}
            <button
              onClick={() => handleTabChange('admin')}
              className={`p-1.5 border-2 border-black rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
                activeTab === 'admin'
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-white text-black hover:bg-neutral-100 shadow-sm'
              }`}
              title={lang === 'en' ? 'Studio Plan Board' : '工作台系统大盘'}
            >
              <Settings className="w-3.5 h-3.5 animate-[spin_12s_linear_infinite]" />
            </button>
            {/* Quick system status coordinate tag */}
            <div className="w-1 h-1 bg-black rounded-full animate-pulse" />
          </div>
        </aside>

        {/* MIDDLE COLUMN BRICK: THE MAIN COMPONENT SLIDER ROUTE VIEWPORT */}
        <main className="flex-1 min-w-0 md:ml-28 md:mr-28 relative flex flex-col p-6 md:p-12 pb-24 md:pb-12 z-10 bg-white/10 overflow-y-auto">
          
          {/* Subtle grid accent background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundImageSize: '24px 24px' }} />

          {/* DYNAMIC VIEW ROUTING PORTALS */}
          {activeTab === 'home' && (
            <div id="landing-main-visual" className="relative space-y-12">
              <div className="space-y-4">
                <span className="inline-block px-2 py-0.5 bg-neutral-905 text-white font-mono text-[9px] font-black uppercase tracking-widest leading-none bg-black">
                  {lang === 'en' ? brandHeroSubEn : brandHeroSubZh}
                </span>
                <p className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-widest">
                  {lang === 'en' ? brandIntroEn : brandIntroZh}
                </p>
                <h1 className="text-4xl sm:text-7xl font-serif font-black tracking-tighter leading-none text-neutral-950 selection:bg-black selection:text-white font-black">
                  {lang === 'en' ? brandTitle1En : brandTitle1Zh}<br />
                  <span className="italic font-light">{lang === 'en' ? brandTitle2En : brandTitle2Zh}</span><br />
                  {lang === 'en' ? brandTitle3En : brandTitle3Zh}
                </h1>
              </div>

              {/* High impact aesthetic showcase box mimicking NewJeans & Kiiikii minimal grid banners - Shrink slightly as requested */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 max-w-5xl">
                {/* Visual portfolio entry teaser (Slightly smaller size) */}
                <div 
                  onClick={() => handleTabChange(showcase1Redirect)}
                  className="group relative aspect-[16/10] border-2 border-black bg-neutral-100 flex flex-col justify-end p-5 overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-500 cursor-pointer"
                >
                  {/* Background Image with grayscale & hover effect */}
                  {homeModule1Bg ? (
                    <img 
                      src={homeModule1Bg} 
                      alt="Teaser 1 BG" 
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-90 transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* Decorative Architectural Grid Pattern to replace avatar image */
                    <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-10 group-hover:opacity-20 transition-opacity">
                      <div className="flex justify-between items-start">
                        <div className="font-mono text-[8px] leading-tight text-black">
                          W. LU // ARCHIVE<br />
                          EST. 2021<br />
                          SWISS_AXIS_GRID
                        </div>
                        <div className="text-right font-mono text-[8px] leading-tight text-black">
                          SYSTEM // INTEL<br />
                          NATIVE_SOIL_REC<br />
                          RE-STRUCTURED
                        </div>
                      </div>
                      <div className="text-[12rem] font-serif font-extralight tracking-tighter text-black select-none leading-none -mb-16 -ml-8">
                        LU
                      </div>
                    </div>
                  )}

                  {/* Semitranslucent dark overlay on hover/always, to guarantee text visibility */}
                  <div className={`absolute inset-0 transition-all duration-500 ${homeModule1Bg ? 'bg-black/40 group-hover:bg-black/25' : 'bg-neutral-900/10 group-hover:bg-neutral-950/20'}`} />

                  <div className="absolute top-4 left-4 font-mono text-[8.5px] font-black bg-black text-white px-1.5 py-0.5 border border-white z-10">
                    {lang === 'en' ? showcase1BadgeEn : showcase1BadgeZh}
                  </div>
                  <div className="relative z-10 space-y-1 text-white drop-shadow-md">
                    <p className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest font-bold">
                      {lang === 'en' ? showcase1SubtitleEn : showcase1SubtitleZh}
                    </p>
                    <h3 className="font-serif text-xl font-black italic tracking-tight text-white group-hover:underline leading-snug">
                      {lang === 'en' ? showcase1TitleEn : showcase1TitleZh}
                    </h3>
                  </div>
                  <div className="absolute bottom-5 right-5 text-xl text-white group-hover:translate-x-1.5 transition-transform z-10 drop-shadow">→</div>
                </div>

                {/* Micro Editorial take-outs block (Slightly smaller size) */}
                <div 
                  onClick={() => handleTabChange(showcase2Redirect)}
                  className="group relative flex flex-col justify-between p-5 border-2 border-black bg-black text-white min-h-[220px] md:min-h-0 aspect-[16/10] space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-500 overflow-hidden cursor-pointer"
                >
                  {/* Background Image with grayscale & hover effect */}
                  {homeModule2Bg ? (
                    <img 
                      src={homeModule2Bg} 
                      alt="Teaser 2 BG" 
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-900/20" />
                  )}

                  {/* Semitranslucent screen overlay to guarantee high-contrast reading text */}
                  <div className={`absolute inset-0 transition-all duration-500 ${homeModule2Bg ? 'bg-black/60 group-hover:bg-black/40' : 'bg-transparent'}`} />

                  <div className="space-y-1 relative z-10">
                    <span className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 font-mono text-[8.5px] uppercase tracking-widest font-black inline-block text-white">
                      {lang === 'en' ? showcase2BadgeEn : showcase2BadgeZh}
                    </span>
                    <h3 className="font-serif text-lg font-bold tracking-tight text-white">
                      {lang === 'en' ? showcase2TitleEn : showcase2TitleZh}
                    </h3>
                  </div>
                  <p className="font-serif text-neutral-300 text-xs leading-relaxed max-w-sm relative z-10 drop-shadow line-clamp-2 md:line-clamp-3">
                    {lang === 'en' ? showcase2DescEn : showcase2DescZh}
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabChange(showcase2Redirect);
                    }}
                    className="self-start font-mono text-[10px] font-black uppercase flex items-center gap-1 hover:text-neutral-300 pointer group cursor-pointer relative z-10 mt-1"
                  >
                    <span>{lang === 'en' ? `EXPLORE ${showcase2Redirect.toUpperCase()}` : '进入特写展示'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform text-neutral-300" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'works' && (
            <div className="space-y-12">
              <WorksSection 
                projects={projectsList} 
                lang={lang} 
                isAdminLoggedIn={isAdminLoggedIn}
                onSaveProjects={(updated) => {
                  setProjectsList(updated);
                  saveToLocal('archive_projects', updated);
                }}
              />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-12">
              <NoteSection 
                notes={notesList} 
                lang={lang} 
                isAdminLoggedIn={isAdminLoggedIn}
                onSaveNotes={(updated) => {
                  setNotesList(updated);
                  saveToLocal('archive_notes', updated);
                }}
              />
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-12">
              <LibrarySection 
                items={libraryList} 
                lang={lang} 
                isAdminLoggedIn={isAdminLoggedIn}
                onSaveItems={(updated) => {
                  setLibraryList(updated);
                  saveToLocal('archive_library', updated);
                }}
              />
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-12 font-serif">
              <div className="border-b-2 border-black pb-4 flex justify-between items-end">
                <div>
                  <span className="font-mono text-xs text-neutral-500 font-black uppercase">
                    {lang === 'en' ? 'CHRONOLOGICAL DIRECTION //' : '时序发展年轮 //'}
                  </span>
                  <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-neutral-950 mt-1 font-black">
                    {lang === 'en' ? timelineTitleEn : timelineTitleZh}
                  </h1>
                </div>
                <div className="text-right font-mono text-[9px] text-neutral-400 font-semibold uppercase leading-none hidden sm:block font-bold">
                  {lang === 'en' ? 'A PORTFOLIO OF THE CONTINUING STORIES' : '关于延续、生长与温度的故事集'}
                </div>
              </div>

              {/* Subtitle / Intro to journey */}
              <div className="bg-[#fafaf6] border border-black p-6 font-serif text-sm leading-relaxed text-neutral-800 space-y-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="font-mono text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5 rounded-none select-none">
                  {lang === 'en' ? 'NARRATIVE CONCEPTUAL' : '叙事概念与研究关怀'}
                </span>
                <p>
                  {lang === 'en' ? timelineIntroEn : timelineIntroZh}
                </p>
                {isAdminLoggedIn && (
                  <button
                    onClick={handleOpenTimelineAdd}
                    className="mt-3 px-3 py-1 bg-black text-white border border-black font-mono text-xs uppercase hover:bg-neutral-800 font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'ADD NEW MILESTONE' : '新增行进年轮节点'}</span>
                  </button>
                )}
              </div>

              {/* VERTICAL TIMELINE CONTAINER */}
              <div className="relative pl-8 md:pl-24 py-8 space-y-16">
                {/* Thin timeline vertical spine line */}
                <div className="absolute left-[15px] md:left-[35px] top-0 bottom-0 w-[1px] bg-neutral-350 pointer-events-none border-l border-dashed border-neutral-300" />

                {visibleTimelineList.map((item, idx) => {
                  const stepNum = item.stepNum || item.id.replace('time-', '').padStart(2, '0') || String(idx + 1).padStart(2, '0');
                  const phaseEn = item.phase_en || item.phaseLabel?.replace(/^Phase \d+\s*\/\/\s*/i, '') || '';
                  const phaseZh = item.phase_zh || item.phaseLabelZh?.replace(/^\d+阶段\s*\/\/\s*/i, '') || '';
                  const categoryEn = item.category_en || item.categoryLabel || '';
                  const categoryZh = item.category_zh || item.categoryLabelZh || '';
                  const titleEn = item.title_en || item.stageTitle || '';
                  const titleZh = item.title_zh || item.stageTitleZh || '';
                  const subtitleEn = item.subtitle_en || item.subtitle || '';
                  const subtitleZh = item.subtitle_zh || item.subtitleZh || '';
                  const descriptionEn = item.description_en || item.description || '';
                  const descriptionZh = item.description_zh || item.descriptionZh || '';
                  const tagsEn = item.tags_en || item.tags || [];
                  const tagsZh = item.tags_zh || item.tagsZh || [];

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className={`relative group cursor-pointer transition-all ${draggableTimelineId === item.id ? 'opacity-50 ring-2 ring-dashed ring-black animate-pulse' : ''}`}
                      draggable={draggableTimelineId === item.id}
                      onDragStart={(e) => handleTimelineDragStart(e, item.id)}
                      onDragOver={handleTimelineDragOver}
                      onDrop={(e) => handleTimelineDrop(e, item.id)}
                      onDragEnd={() => setDraggableTimelineId(null)}
                    >
                      {/* Spine Indicator / Floating Large Year Label */}
                      <div className="absolute -left-[32px] md:-left-[88px] top-4 select-none pointer-events-none flex items-center justify-end gap-3 w-16 md:w-20">
                        <span className="font-mono text-[10px] text-neutral-400 font-black tracking-tighter">{stepNum}.</span>
                        <span className="font-serif text-3xl md:text-4xl font-extralight text-neutral-300 group-hover:text-black transition-colors duration-300 leading-none">{item.year}</span>
                      </div>

                      {/* Node Dot with pulse on hover */}
                      <div className="absolute -left-[28px] md:-left-[48px] top-6 w-3 h-3 rounded-none bg-black border border-white group-hover:scale-125 group-hover:bg-neutral-800 transition-all duration-300 z-10" />

                      {/* Card container with off-white warm theme and pixel offsets on hover */}
                      <div className="bg-[#fafaf6] border border-neutral-200 group-hover:border-black p-6 transition-all duration-300 relative group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] bg-cover">
                        {/* Drag Handle or standard pixel cells in right corner */}
                        <div 
                          onDoubleClick={() => {
                            if (isAdminLoggedIn) {
                              setDraggableTimelineId(item.id === draggableTimelineId ? null : item.id);
                            }
                          }}
                          className={`absolute top-2 right-2 flex gap-[2px] items-center p-1 cursor-pointer rounded transition-all duration-300 ${
                            isAdminLoggedIn ? 'cursor-grab hover:bg-neutral-250' : ''
                          } ${
                            draggableTimelineId === item.id ? 'bg-zinc-200 border border-black opacity-100 animate-pulse scale-105 !opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          title={isAdminLoggedIn ? (lang === 'en' ? "Double Click to Drag & Move // 双击触发重新排序拖拽" : "双击启动模块拖动排序") : undefined}
                        >
                          {item.pinned && <span className="text-[8px] font-mono font-black border border-black bg-black text-white px-1 cursor-help mr-2" title="Pinned">📌 PINNED</span>}
                          {item.status_cms === 'Draft' && <span className="text-[8px] font-mono font-black border border-black bg-neutral-200 text-black px-1 cursor-none mr-2">DRAFT</span>}
                          {item.visibility === 'Private' && <span className="text-[8px] font-mono font-black border border-neutral-700 bg-neutral-900 text-white px-1 cursor-none mr-2">🔒 PRIVATE</span>}
                          <div className={`w-[3.5px] h-[3.5px] rounded-full ${draggableTimelineId === item.id ? 'bg-red-500 animate-ping' : 'bg-black'}`} />
                          <div className={`w-[3.5px] h-[3.5px] rounded-full ${draggableTimelineId === item.id ? 'bg-red-500 animate-ping' : 'bg-black'}`} />
                          <div className={`w-[3.5px] h-[3.5px] rounded-full ${draggableTimelineId === item.id ? 'bg-red-500 animate-ping' : 'bg-black'}`} />
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-3">
                            <span className="font-mono text-[10px] text-neutral-400 font-semibold tracking-widest leading-none uppercase select-none">
                              Phase {stepNum} // {lang === 'en' ? phaseEn : phaseZh}
                            </span>
                            <span className="font-mono text-[9px] text-white bg-black border border-neutral-200 px-2 py-0.5 self-start sm:self-auto uppercase select-none font-bold">
                              {lang === 'en' ? categoryEn : categoryZh}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-serif text-xl font-bold tracking-tight text-neutral-900 group-hover:text-black flex items-center gap-2 font-black leading-snug">
                              {lang === 'en' ? titleEn : titleZh}
                            </h3>
                            <p className="font-sans text-xs text-neutral-500 font-medium uppercase tracking-wider mt-0.5 font-bold select-none">
                              {lang === 'en' ? subtitleEn : subtitleZh}
                            </p>
                          </div>

                          <p className="font-sans text-sm text-neutral-600 leading-relaxed font-normal">
                            {lang === 'en' ? descriptionEn : descriptionZh}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {(lang === 'en' ? tagsEn : tagsZh).map(tag => (
                              <span key={tag} className="px-2 py-0.5 border border-neutral-200 bg-white text-[8px] font-mono text-neutral-500 uppercase tracking-wider rounded-none select-none">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Inline Actions for logged-in Administrator */}
                          {isAdminLoggedIn && (
                            <div className="flex gap-2 pt-3 border-t border-dashed border-neutral-200 mt-3 justify-end">
                              <button
                                onClick={(e) => handleOpenTimelineEdit(e, item)}
                                className="px-2 py-1 border border-black bg-white hover:bg-neutral-50 font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>[Edit / 编辑]</span>
                              </button>
                              <button
                                onClick={(e) => handleDeleteTimeline(e, item.id)}
                                className="px-2 py-1 border border-black bg-black hover:bg-neutral-800 text-white font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                                <span>[Delete / 删除]</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {visibleTimelineList.length === 0 && (
                  <div className="p-12 border border-dashed border-neutral-300 text-center font-mono text-xs text-neutral-400">
                    {lang === 'en' ? 'No Milestones published.' : '暂无时序历程节点。'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8 font-serif">
              <div className="border-b-2 border-black pb-4 flex justify-between items-end">
                <div>
                  <span className="font-mono text-xs text-neutral-550 font-black uppercase">
                    {lang === 'en' ? 'About Me //' : '个人介绍与创作宣言 //'}
                  </span>
                  <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-neutral-950 mt-1 font-black">
                    {lang === 'en' ? profileTitleEn : profileTitleZh}
                  </h1>
                </div>
                {isAdminLoggedIn && (
                  <button
                    onClick={() => { setActiveQuickForm('profile'); }}
                    className="px-2.5 py-1 border border-black hover:bg-black hover:text-white font-mono text-xs font-semibold uppercase flex items-center gap-1 cursor-pointer rounded-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'EDIT PROFILE TEXT' : '编辑此板块'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left col: Typographic Brand Mark Profile */}
                <div className="space-y-4">
                  {/* Avatar upload/view slot */}
                  <div 
                    title={isAdminLoggedIn ? "Click or drag image here to upload new avatar / 点击或拖拽上传头像" : "Click to view full image / 点击查看大图"}
                    onClick={() => {
                      if (isAdminLoggedIn) {
                        document.getElementById('about-avatar-picker-input')?.click();
                      } else {
                        setIsPortraitLightboxOpen(true);
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!isAdminLoggedIn) return;
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          compressAndCropToSquare(base64, (compressed) => {
                            setAvatarB64(compressed);
                            localStorage.setItem('logo_avatar_b64', compressed);
                            window.dispatchEvent(new Event('avatar-updated'));
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="border-2 border-black bg-neutral-900 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] aspect-square w-full mx-auto md:mx-0 flex flex-col justify-between relative overflow-hidden group cursor-pointer select-none rounded transition-all hover:scale-[1.01]"
                  >
                    {/* Hidden Native File Picker */}
                    <input 
                      type="file" 
                      id="about-avatar-picker-input" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (!isAdminLoggedIn) return;
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            compressAndCropToSquare(base64, (compressed) => {
                              setAvatarB64(compressed);
                              localStorage.setItem('logo_avatar_b64', compressed);
                              window.dispatchEvent(new Event('avatar-updated'));
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    {avatarB64 ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img 
                          src={avatarB64} 
                          alt="Avatar" 
                          className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105" 
                          referrerPolicy="no-referrer" 
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                          <div className="flex justify-between items-start font-mono text-[8px] text-zinc-300 pointer-events-none">
                            <span>W. LU</span>
                            <span>{isAdminLoggedIn ? 'REPLACE AVATAR' : 'PORTRAIT ZOOM'}</span>
                          </div>
                          <div className="text-center font-mono text-[10px] text-white pointer-events-none px-2 leading-relaxed">
                            {isAdminLoggedIn ? (
                              lang === 'en' ? '[ CLICK / DRAG IMAGE TO UPDATE ]' : '[ 点击或拖拽上传新头像 ]'
                            ) : (
                              lang === 'en' ? '[ CLICK TO VIEW FULL PORTRAIT ]' : '[ 点击查看高清个人大图 ]'
                            )}
                          </div>
                          <div className="flex justify-between items-end font-mono text-[8px] text-zinc-300 pointer-events-none">
                            <span>UP_GRADE</span>
                            <span>{isAdminLoggedIn ? 'ADMIN' : 'VISITOR'}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start font-mono text-[8px] text-neutral-400 p-4" id="editorial-practitioner-block">
                          <span>W. LU</span>
                          <span>VOL.2026</span>
                        </div>
                        
                        <div className="text-center font-serif text-6xl font-black tracking-tighter text-white my-auto flex flex-col items-center justify-center font-black">
                          <span>LU</span>
                          <span className="text-[9px] font-mono tracking-wider font-bold animate-pulse text-neutral-400 mt-2">
                            {isAdminLoggedIn ? (
                              lang === 'en' ? '[UPLOAD PORTRAIT]' : '[点击上传头像]'
                            ) : (
                              lang === 'en' ? '[NO IMAGE]' : '[点击预览]'
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-end font-mono text-[8px] text-neutral-400 p-4">
                          <span>STUDIO INDEX</span>
                          <span>{isAdminLoggedIn ? 'ADMIN' : 'VISITOR'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 bg-neutral-50 border border-black space-y-2 font-mono text-xs rounded">
                    <div className="font-bold uppercase text-black select-none">
                      {lang === 'en' ? aboutContactTitleEn : aboutContactTitleZh}
                    </div>
                    <div className="text-neutral-500 truncate flex items-center gap-1.5 hover:text-black hover:underline transition-colors font-mono">
                      <Mail className="w-3.5 h-3.5 text-black shrink-0" />
                      <a href={`mailto:${contactChannelEmail}`} className="truncate" referrerPolicy="no-referrer">{contactChannelEmail}</a>
                    </div>
                    <div className="text-neutral-500 flex items-center gap-1.5 hover:text-black hover:underline transition-colors truncate font-mono">
                      <Linkedin className="w-3.5 h-3.5 text-black shrink-0" />
                      <a
                        href={contactChannelLinkedin.startsWith('http') ? contactChannelLinkedin : `https://${contactChannelLinkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate"
                        referrerPolicy="no-referrer"
                      >
                        {contactChannelLinkedin}
                      </a>
                    </div>
                    <div className="text-neutral-500 flex items-center gap-1.5 hover:text-black hover:underline transition-colors shrink-0 font-mono">
                      <Phone className="w-3.5 h-3.5 text-black shrink-0" />
                      <a href={`tel:${contactChannelPhone}`} referrerPolicy="no-referrer">{contactChannelPhone}</a>
                    </div>
                  </div>
                </div>

                {/* Right col: Bio & Details of practice */}
                <div className="col-span-1 md:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-serif text-2xl font-black text-black leading-snug">
                      {lang === 'en' ? profileSubEn : profileSubZh}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
                      {lang === 'en' ? profileBioEn : profileBioZh}
                    </p>
                    <p className="text-neutral-750 leading-relaxed text-sm whitespace-pre-line">
                      {lang === 'en' ? profileSecondEn : profileSecondZh}
                    </p>
                  </div>

                  {/* Skills Grid and Interventions */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border border-black p-4 space-y-2 bg-neutral-50 rounded">
                      <h4 className="font-mono text-xs font-black uppercase text-black select-none">
                        {lang === 'en' ? aboutSkillsTitleEn : aboutSkillsTitleZh}
                      </h4>
                      <ul className="font-mono text-[11px] text-neutral-600 space-y-1">
                        {lang === 'en' ? (
                          aboutSkillsListEn.split('\n').filter(Boolean).map((skill, index) => (
                            <li key={index}>• {skill}</li>
                          ))
                        ) : (
                          aboutSkillsListZh.split('\n').filter(Boolean).map((skill, index) => (
                            <li key={index}>• {skill}</li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-8 font-serif">
              <div className="border-b-2 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
                <div>
                  <span className="font-mono text-xs text-neutral-500 font-black uppercase">{lang === 'en' ? contactLabelEn : contactLabelZh}</span>
                  <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-neutral-950 mt-1 font-black">
                    {lang === 'en' ? contactTitleEn : contactTitleZh}
                  </h1>
                </div>
              </div>

              {/* Profile Avatar / Logo Synchronization & Contact Page Live Composer */}
              {isAdminLoggedIn && (
                <div id="contact-live-composer-element" className="border-2 border-black p-6 bg-yellow-50/50 space-y-4 font-mono text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-3xs">
                  <div className="flex justify-between items-center border-b border-black pb-2">
                    <h3 className="font-bold flex items-center gap-1.5 uppercase text-black">
                      <span>✏️ Contact Page Live-Composer // 直接编辑联系配置及头像</span>
                    </h3>
                    <span className="text-[8px] bg-black text-white px-1.5 py-0.5 uppercase select-none">ADMIN_LIVE_EDITS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Avatar uploading & Sync */}
                    <div className="space-y-3 bg-white p-4 border border-black">
                      <span className="text-zinc-500 block uppercase font-bold text-[9px]">👤 Synchronize Profile Picture (Profile Avatar / 头像同步)</span>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 border-2 border-black bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                          {avatarB64 ? (
                            <img src={avatarB64} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-white text-[10px] font-black">W_CMS</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <input 
                            type="file" 
                            accept="image/*" 
                            id="avatar-uploader-input" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  compressAndCropToSquare(base64, (compressed) => {
                                    setAvatarB64(compressed);
                                    localStorage.setItem('logo_avatar_b64', compressed);
                                    // dispatch logo updating events
                                    window.dispatchEvent(new Event('avatar-updated'));
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor="avatar-uploader-input"
                            className="px-3 py-1.5 bg-black text-white border border-black hover:bg-neutral-800 text-[9px] font-bold uppercase cursor-pointer transition-colors block text-center"
                          >
                            [ Upload Portrait / 上传头像 ]
                          </label>
                          {avatarB64 && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setAvatarB64('');
                                localStorage.removeItem('logo_avatar_b64');
                                window.dispatchEvent(new Event('avatar-updated'));
                              }}
                              className="text-red-500 hover:underline text-[9px] block text-center w-full mt-1 font-bold cursor-pointer"
                            >
                              [ Remove / 清除头像 ]
                            </button>
                          )}
                        </div>
                      </div>
                      <span className="text-[8px] text-neutral-400 block pt-1.5 leading-normal border-t border-dashed border-neutral-200">
                        * Supports standard image files. Once uploaded, your custom portrait instantly replaces the default static "W" in the top-left logo container across tabs.
                      </span>
                    </div>

                    {/* Right Column: Direct details overrides */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-neutral-400 block pb-0.5 text-[8px] uppercase font-bold">Email Channel Address</span>
                        <input 
                          type="text" 
                          value={contactChannelEmail} 
                          onChange={(e) => {
                            setContactChannelEmail(e.target.value);
                            localStorage.setItem('contact_channel_email', e.target.value);
                          }} 
                          className="w-full border border-black p-1.5 text-[11px] bg-white outline-none font-bold" 
                        />
                      </div>
                      <div>
                        <span className="text-neutral-400 block pb-0.5 text-[8px] uppercase font-bold">LinkedIn Slug</span>
                        <input 
                          type="text" 
                          value={contactChannelLinkedin} 
                          onChange={(e) => {
                            setContactChannelLinkedin(e.target.value);
                            localStorage.setItem('contact_channel_linkedin', e.target.value);
                          }} 
                          className="w-full border border-black p-1.5 text-[11px] bg-white outline-none font-bold" 
                        />
                      </div>
                      <div>
                        <span className="text-neutral-400 block pb-0.5 text-[8px] uppercase font-bold">Phone Hotline</span>
                        <input 
                          type="text" 
                          value={contactChannelPhone} 
                          onChange={(e) => {
                            setContactChannelPhone(e.target.value);
                            localStorage.setItem('contact_channel_phone', e.target.value);
                          }} 
                          className="w-full border border-black p-1.5 text-[11px] bg-white outline-none font-bold" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Direct bilingual copywriting configuration grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2 bg-neutral-100/50 p-3 border border-neutral-300">
                      <span className="text-black font-semibold uppercase block text-[9px] border-b border-neutral-200 pb-1">English COPYWRITES (CONTACT PAGE)</span>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">Top Tag Line</label>
                        <input 
                          type="text" 
                          value={contactLabelEn} 
                          onChange={(e) => { setContactLabelEn(e.target.value); localStorage.setItem('contact_label_en', e.target.value); }} 
                          className="w-full border border-neutral-300 bg-white p-1 text-[11px] outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">Main Header (H1)</label>
                        <input 
                          type="text" 
                          value={contactTitleEn} 
                          onChange={(e) => { setContactTitleEn(e.target.value); localStorage.setItem('contact_title_en', e.target.value); }} 
                          className="w-full border border-neutral-300 bg-white p-1 text-[11px] outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">HQ Header</label>
                        <input 
                          type="text" 
                          value={contactHqEn} 
                          onChange={(e) => { setContactHqEn(e.target.value); localStorage.setItem('contact_hq_en', e.target.value); }} 
                          className="w-full border border-neutral-300 bg-white p-1 text-[11px] outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">Introduction Description</label>
                        <textarea 
                          rows={3} 
                          value={contactDescEn} 
                          onChange={(e) => { setContactDescEn(e.target.value); localStorage.setItem('contact_desc_en', e.target.value); }}
                          className="w-full border border-neutral-300 bg-white p-1 text-[10.5px] leading-relaxed outline-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 bg-neutral-100/50 p-3 border border-neutral-300">
                      <span className="text-black font-semibold uppercase block text-[9px] border-b border-neutral-200 pb-1">中文翻译配置 (CONTACT PAGE)</span>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">顶部修饰口号</label>
                        <input 
                          type="text" 
                          value={contactLabelZh} 
                          onChange={(e) => { setContactLabelZh(e.target.value); localStorage.setItem('contact_label_zh', e.target.value); }} 
                          className="w-full border border-neutral-300 bg-white p-1 text-[11px] outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">主标题名位 (H1)</label>
                        <input 
                          type="text" 
                          value={contactTitleZh} 
                          onChange={(e) => { setContactTitleZh(e.target.value); localStorage.setItem('contact_title_zh', e.target.value); }} 
                          className="w-full border border-neutral-300 bg-white p-1 text-[11px] outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">数字对话总部小标题</label>
                        <input 
                          type="text" 
                          value={contactHqZh} 
                          onChange={(e) => { setContactHqZh(e.target.value); localStorage.setItem('contact_hq_zh', e.target.value); }} 
                          className="w-full border border-neutral-300 bg-white p-1 text-[11px] outline-none" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] text-neutral-500 block uppercase font-bold">对话引导备考说明</label>
                        <textarea 
                          rows={3} 
                          value={contactDescZh} 
                          onChange={(e) => { setContactDescZh(e.target.value); localStorage.setItem('contact_desc_zh', e.target.value); }}
                          className="w-full border border-neutral-300 bg-white p-1 text-[10.5px] leading-relaxed outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
                    <button 
                      type="button"
                      onClick={() => {
                        alert(lang === 'en' ? 'Contact configs saved & saved to LocalStorage!' : '直接编辑的联系信道口号与内容已实时保全！');
                      }}
                      className="px-4 py-2 bg-black text-white hover:bg-neutral-800 border-2 border-black font-bold uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
                    >
                      {lang === 'en' ? '✓ SAVE CONFIGS' : '✓ 确认并固化本次修改'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form column */}
                <form onSubmit={handleContactSubmit} className="space-y-4 border border-black p-6 bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <span className="font-mono text-[10px] uppercase text-neutral-400 font-black block mb-2 select-none">
                    {lang === 'en' ? 'SECURED COMMUNICATIONS' : '安全加密信件发射投递'}
                  </span>
                  
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-neutral-400 uppercase select-none">
                      {lang === 'en' ? 'Your Name (Required)' : '阁下的名讳/称名（必填）'}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={lang === 'en' ? "e.g. Liam Smith" : "例如：李芸生"} 
                      className="w-full bg-neutral-50 border border-black p-2 text-xs font-mono outline-none focus:bg-white text-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-neutral-400 uppercase select-none">
                      {lang === 'en' ? 'Email Address (Required)' : '联系电子信箱（必填）'}
                    </label>
                    <input 
                      type="type" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={lang === 'en' ? "e.g. liam@example.com" : "例如：liam@sh-studio.com"} 
                      className="w-full bg-neutral-50 border border-black p-2 text-xs font-mono outline-none focus:bg-white text-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-neutral-400 uppercase select-none">
                      {lang === 'en' ? 'Message Inquiry' : '合作原委/感言详情'}
                    </label>
                    <textarea 
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={lang === 'en' ? "Write your creative collaboration proposal or feedback to W..." : "在这里写下您的合作细节提案、研究会召集意向、或对温芸之家的宝贵评审和阅后感言..."} 
                      className="w-full bg-neutral-50 border border-black p-2 text-xs font-mono outline-none focus:bg-white text-xs leading-relaxed text-black"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-black text-white hover:bg-neutral-800 font-mono text-xs py-2.5 border border-black transition-all font-black uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[10px]"
                  >
                    <span>
                      {isSent 
                        ? (lang === 'en' ? 'ENCRYPTING MESSAGE...' : '信件入库发射中...') 
                        : (lang === 'en' ? 'SUBMIT MESSAGE / ARCHIVE TRANSMIT' : '保密发射信件并载入系统数据库')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </form>

                {/* Info Channels column */}
                <div className="space-y-6">
                  <div className="border border-black p-6 space-y-4 bg-neutral-50">
                    <h4 className="font-mono text-xs font-black uppercase text-black tracking-widest select-none">
                      {lang === 'en' ? contactHqEn : contactHqZh}
                    </h4>
                    <p className="text-sm text-neutral-700 leading-relaxed text-xs">
                      {lang === 'en' ? contactDescEn : contactDescZh}
                    </p>
                    <div className="space-y-2 pt-2 border-t border-dashed border-neutral-300 font-mono text-xs">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-black shrink-0" />
                        <span>Email: <a href={`mailto:${contactChannelEmail}`} className="font-bold underline hover:text-black">{contactChannelEmail}</a></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-4 h-4 text-black shrink-0" />
                        <span>LinkedIn: <a href={contactChannelLinkedin.startsWith('http') ? contactChannelLinkedin : `https://${contactChannelLinkedin}`} target="_blank" rel="noreferrer" className="font-bold underline hover:text-black">{contactChannelLinkedin}</a></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-black shrink-0" />
                        <span>Phone Hotline: <a href={`tel:${contactChannelPhone}`} className="font-bold underline hover:text-black">{contactChannelPhone}</a></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black text-white space-y-1 font-mono text-[9px]">
                    <span className="text-neutral-400 text-[8px] uppercase font-black block select-none">
                      {lang === 'en' ? 'ENCRYPTION KEY DETAILS' : '底层密码密钥及坐标'}
                    </span>
                    <div>CIPHER: AES-256 SECURED SHARED PORTAL PREVIEW</div>
                    <div>GEOGRAPHIC COORDINATES: 23.1291° N, 113.2644° E (GUANGZHOU, CHINA)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-8">
              {/* Not logged in view */}
              {!isAdminLoggedIn ? (
                <div className="max-w-md mx-auto border-2 border-black p-8 bg-[#fafaf6] space-y-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-[#000000] my-8 rounded">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-xl bg-black text-white mx-auto font-mono font-bold font-black rotate-45 select-none my-2">
                      <Key className="w-5 h-5 antialiased -rotate-45" />
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest">{lang === 'en' ? 'SECURED CABINET' : '创作管理终端安全验证'}</span>
                    <h2 className="font-serif text-2xl font-black">{lang === 'en' ? 'Enter Studio Workplace' : '进入创作者工作台'}</h2>
                    <p className="font-mono text-[10px] text-neutral-400">{lang === 'en' ? 'Credential authorization requested.' : '请输入管理员进入凭证进入高级网页编辑。'}</p>
                  </div>

                  <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="text-neutral-400 text-[9px] uppercase font-bold block mb-1">{lang === 'en' ? 'Passcode' : '验证访问密钥'}</label>
                      <input
                        required
                        type="password"
                        placeholder="••••••"
                        value={passcodeInput}
                        onChange={(e) => setPasscodeInput(e.target.value)}
                        className="w-full border-2 border-black p-3 text-center bg-white h-11 text-base tracking-widest text-black outline-none font-bold"
                      />
                    </div>
                    {loginError && (
                      <p className="text-[10px] font-bold text-center text-black py-1 bg-neutral-100 border border-neutral-300 font-mono">
                        {loginError}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="w-full h-10 bg-black text-white hover:bg-neutral-800 border-2 border-black font-extrabold uppercase tracking-widest text-xs cursor-pointer transition-all"
                    >
                      {lang === 'en' ? 'Verifying & Unlock' : '验证解锁并进入'}
                    </button>
                    <div className="text-center pt-2">
                      <span className="text-[9px] text-neutral-400 leading-relaxed block border-t border-dashed border-neutral-200 pt-2 font-mono">
                        {lang === 'en' ? 'Standard demo passcode: wendy' : '管理员默认测试进入凭据：wendy'}
                      </span>
                    </div>
                  </form>
                </div>
              ) : (
                /* Main Studio Workspace view: resembles Ghost CMS, Notion and clean editorial control boards */
                <div id="authoring-studio-main" className="space-y-8 animate-fade-in">
                  <div className="border-b-2 border-black pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="font-mono text-xs text-neutral-400 font-black uppercase">STUDIO SYSTEM BOARD //</span>
                      <h1 className="font-serif text-3xl font-bold uppercase tracking-tight text-neutral-950 mt-1">
                        {lang === 'en' ? 'Studio Dashboard' : '工作中心与内容管理系统'}
                      </h1>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono bg-black text-white px-2.5 py-1 border border-black select-none font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Practitioner Signed' : '作者模式已登录'}</span>
                      </div>
                      <button
                        onClick={handleAdminLogout}
                        className="px-2.5 py-1 border border-black bg-white hover:bg-neutral-50 font-mono text-[9px] font-semibold uppercase flex items-center gap-1.5 cursor-pointer rounded-xs transition-colors"
                        title="Sign Out Creator Mode"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Logout' : '退出'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Studio System Board Sub-Pages Tabs Menu */}
                  <div className="flex flex-wrap gap-1 border-b border-black pb-3 font-mono text-[10.5px]">
                    <button
                      onClick={() => setAdminSubTab('dashboard')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'dashboard'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>📊</span>
                      <span>{lang === 'en' ? 'Data Overview' : '数据页面'}</span>
                    </button>
                    <button
                      onClick={() => setAdminSubTab('scheduler')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'scheduler'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>⚙️</span>
                      <span>{lang === 'en' ? 'Data Scheduler' : '离线数据调度台'}</span>
                    </button>
                    <button
                      onClick={() => setAdminSubTab('homepage')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'homepage'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>🏠</span>
                      <span>{lang === 'en' ? 'Homepage Copy' : '主页标语与资源位配置'}</span>
                    </button>
                    <button
                      onClick={() => setAdminSubTab('about')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'about'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>👤</span>
                      <span>{lang === 'en' ? 'Personal Info Settings' : '个人信息配置'}</span>
                    </button>
                    <button
                      onClick={() => setAdminSubTab('navigation')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'navigation'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>🧭</span>
                      <span>{lang === 'en' ? 'Navbar Layout' : '导航栏双语与排序配置'}</span>
                    </button>
                    <button
                      onClick={() => setAdminSubTab('notes_meta')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'notes_meta'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>📰</span>
                      <span>{lang === 'en' ? 'Notes Custom' : '专栏文案配置'}</span>
                    </button>
                    <button
                      onClick={() => setAdminSubTab('playlist_mgr')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'playlist_mgr'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>🎵</span>
                      <span>{lang === 'en' ? 'Playbox Music' : '上传歌曲/播放列表'}</span>
                    </button>
                    <button
                      onClick={() => setAdminSubTab('settings_custom')}
                      className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        adminSubTab === 'settings_custom'
                          ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      <span>⚙️</span>
                      <span>{lang === 'en' ? 'Cursor Setting' : '全局个性化/光标管理'}</span>
                    </button>
                  </div>

                  {/* SUB Tabanel 1: DATA DISPLAY PAGE */}
                  {adminSubTab === 'dashboard' && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Bento analytics stats summaries */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono select-none">
                        <div className="border border-black p-4 bg-white flex flex-col justify-between h-24 shadow-sm">
                          <span className="text-neutral-400 text-[9px] font-bold uppercase">WORKS PORTFOLIOS</span>
                          <span className="font-serif text-3xl font-black text-black">{projectsList.length}</span>
                        </div>
                        <div className="border border-black p-4 bg-white flex flex-col justify-between h-24 shadow-sm">
                          <span className="text-neutral-400 text-[9px] font-bold uppercase">NOTE REPOSITORIES</span>
                          <span className="font-serif text-3xl font-black text-black">{notesList.length}</span>
                        </div>
                        <div className="border border-black p-4 bg-white flex flex-col justify-between h-24 shadow-sm">
                          <span className="text-neutral-400 text-[9px] font-bold uppercase">MEDIA REVIEWS</span>
                          <span className="font-serif text-3xl font-black text-black">{libraryList.length}</span>
                        </div>
                        <div className="border border-black p-4 bg-white flex flex-col justify-between h-24 shadow-sm">
                          <span className="text-neutral-400 text-[9px] font-bold uppercase">TIMELINE EVENTS</span>
                          <span className="font-serif text-3xl font-black text-black">{timelineList.length}</span>
                        </div>
                      </div>

                      {/* Readers activity & Storage specs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                        <div className="md:col-span-2 border border-black p-5 bg-white space-y-4 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                            <span className="font-bold text-black uppercase">📊 Reader Traffic & Interventions Index</span>
                            <span className="text-[8px] bg-neutral-100 px-1 py-0.5 border text-neutral-500">REALTIME_METRIC</span>
                          </div>
                          
                          {/* Aesthetic SVG grid mock chart depicting visitor levels per hour */}
                          <div className="aspect-[21/9] w-full border border-neutral-200 bg-neutral-50/50 p-2 relative flex items-end">
                            {/* SVG Graph wireframe */}
                            <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="0" y1="20" x2="100" y2="20" stroke="#ccc" strokeWidth="0.5" />
                              <line x1="0" y1="40" x2="100" y2="40" stroke="#ccc" strokeWidth="0.5" />
                              <line x1="0" y1="60" x2="100" y2="60" stroke="#ccc" strokeWidth="0.5" />
                              <line x1="0" y1="80" x2="100" y2="80" stroke="#ccc" strokeWidth="0.5" strokeDasharray="2,2" />
                              <polyline points="0,95 10,85 20,70 30,75 40,50 50,45 60,80 70,60 80,30 90,40 100,20" fill="none" stroke="#222" strokeWidth="1.5" />
                              <path d="0,95 L10,85 L20,70 L30,75 L40,50 L50,45 L60,80 L70,60 L80,30 L90,40 L100,20 L100,100 L0,100 Z" fill="rgba(0,0,0,0.02)" />
                            </svg>
                            <div className="relative z-10 w-full flex justify-between text-[8px] text-neutral-450 px-1">
                              <span>06:00 (YOUTH_ENGAGE)</span>
                              <span>12:00 (ZINE_TRAFFIC)</span>
                              <span>18:00 (PLAYLIST_HITS)</span>
                              <span>00:00 (SYSTEM_SCHED)</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-[9px] text-zinc-500 font-bold">
                            <span>TOTAL TRAFFIC SESSIONS: 2,945</span>
                            <span>ACTIVE DISPATCHES: 100% ONLINE</span>
                          </div>
                        </div>

                        <div className="border border-black p-5 bg-[#fafaf6] space-y-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                          <div className="space-y-3">
                            <span className="font-bold text-black uppercase block border-b border-neutral-300 pb-1">🗄️ Cache Registry Info</span>
                            <div className="space-y-1.5 text-[11px] text-neutral-700">
                              <div className="flex justify-between">
                                <span className="text-neutral-400">DBMS ENGINE:</span>
                                <span className="font-bold text-black">LocalStorage Cache V3</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-400">TOTAL STORAGE SEGMENT:</span>
                                <span className="font-bold text-black">~{(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-400">ALLOCATION CAP:</span>
                                <span className="font-bold text-black">5.0 MB (Std Limit)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-400">STATUS DIAGNOSTICS:</span>
                                <span className="font-mono text-green-600 font-black">● SEEDED_OK</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-black text-[9px] text-white p-2.5 border border-white font-mono leading-relaxed uppercase">
                            * System seeded under Wendy's custom admin authentication key securely. Content updates preserve native Swiss editorial typography values.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB Tabanel 2: OFFLINE CONTENT DATA SCHEDULER */}
                  {adminSubTab === 'scheduler' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stream columns */}
                        <div className="lg:col-span-2 border-2 border-black p-6 bg-white space-y-6 shadow-sm rounded">
                          <div className="flex justify-between items-center border-b border-black pb-3">
                            <h3 className="font-serif text-lg font-black uppercase tracking-tight flex items-center gap-1.5">
                              <Settings2 className="w-4 h-4 text-black" />
                              <span>{lang === 'en' ? 'Active Offline Streams Index' : '离线数据清单调度台'}</span>
                            </h3>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 border border-black bg-neutral-50 select-none">LOCAL_CACHE</span>
                          </div>

                          <div className="space-y-4 font-mono text-xs">
                            {/* Works Stream list */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>🎨 PORTFOLIO WORKS ({projectsList.length})</span>
                                <button onClick={() => { handleTabChange('works'); }} className="text-[9px] underline hover:text-neutral-500">[View Works Live]</button>
                              </h4>
                              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 border border-neutral-100 p-2 bg-neutral-50">
                                {projectsList.map(p => (
                                  <div key={p.id} className="flex justify-between items-center gap-2 p-1.5 bg-white border border-neutral-200 text-[11px]">
                                    <span className="truncate pr-1 font-bold text-black" title={p.title}>{p.title}</span>
                                    <div className="flex gap-1.5 items-center shrink-0">
                                      {p.status_cms === 'Draft' && <span className="px-1 text-[8px] bg-neutral-100 text-neutral-400 border select-none">DRAFT</span>}
                                      {p.visibility === 'Private' && <span className="text-[10px]" title="Private">🔒</span>}
                                      <span className="text-[9px] text-neutral-300">|</span>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Confirm deletion of portfolio listing: ${p.title}?`)) {
                                            const updated = projectsList.filter(item => item.id !== p.id);
                                            setProjectsList(updated);
                                            saveToLocal('archive_projects', updated);
                                          }
                                        }}
                                        className="text-black hover:text-neutral-500 font-bold font-mono text-[9px] px-1 hover:bg-neutral-50 cursor-pointer"
                                      >
                                        [DELETE]
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {projectsList.length === 0 && <span className="text-neutral-400 italic text-[10px] p-2 block">No portfolios indexed.</span>}
                              </div>
                            </div>

                            {/* Notes Stream list */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>📝 WECHAT NOTES ({notesList.length})</span>
                                <button onClick={() => { handleTabChange('notes'); }} className="text-[9px] underline hover:text-neutral-500">[View Notes Live]</button>
                              </h4>
                              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 border border-neutral-100 p-2 bg-neutral-50">
                                {notesList.map(n => (
                                  <div key={n.id} className="flex justify-between items-center gap-2 p-1.5 bg-white border border-neutral-200 text-[11px]">
                                    <span className="truncate pr-1 font-bold text-black" title={n.title}>{n.title}</span>
                                    <div className="flex gap-1.5 items-center shrink-0">
                                      {n.status_cms === 'Draft' && <span className="px-1 text-[8px] bg-neutral-100 text-neutral-400 border select-none">DRAFT</span>}
                                      {n.visibility === 'Private' && <span className="text-[10px]" title="Private">🔒</span>}
                                      <span className="text-[9px] text-neutral-300">|</span>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Confirm deletion of note: ${n.title}?`)) {
                                            const updated = notesList.filter(item => item.id !== n.id);
                                            setNotesList(updated);
                                            saveToLocal('archive_notes', updated);
                                          }
                                        }}
                                        className="text-black hover:text-neutral-500 font-bold font-mono text-[9px] px-1 hover:bg-neutral-50 cursor-pointer"
                                      >
                                        [DELETE]
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {notesList.length === 0 && <span className="text-neutral-400 italic text-[10px] p-2 block">No notes indexed.</span>}
                              </div>
                            </div>

                            {/* Media Stream lists */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>📚 CRITICAL STUDIES LIBRARY LOGS ({libraryList.length})</span>
                                <button onClick={() => { handleTabChange('library'); }} className="text-[9px] underline hover:text-neutral-500">[View Library Live]</button>
                              </h4>
                              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 border border-neutral-100 p-2 bg-neutral-50">
                                {libraryList.map(l => (
                                  <div key={l.id} className="flex justify-between items-center gap-2 p-1.5 bg-white border border-neutral-200 text-[11px]">
                                    <span className="truncate pr-1 font-bold text-black" title={l.title}>{l.title}</span>
                                    <div className="flex gap-1.5 items-center shrink-0">
                                      <span className="px-1.5 py-0.5 border border-black bg-black text-white text-[8px] font-bold uppercase rounded-none select-none shrink-0 scale-90">{l.status}</span>
                                      {l.status_cms === 'Draft' && <span className="px-1 text-[8px] bg-neutral-100 text-neutral-400 border select-none">DRAFT</span>}
                                      {l.visibility === 'Private' && <span className="text-[10px]" title="Private">🔒</span>}
                                      <span className="text-[9px] text-neutral-300">|</span>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Confirm deletion of book/film study audit: ${l.title}?`)) {
                                            const updated = libraryList.filter(item => item.id !== l.id);
                                            setLibraryList(updated);
                                            saveToLocal('archive_library', updated);
                                          }
                                        }}
                                        className="text-black hover:text-neutral-500 font-bold font-mono text-[9px] px-1 hover:bg-neutral-50 cursor-pointer"
                                      >
                                        [DELETE]
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {libraryList.length === 0 && <span className="text-neutral-400 italic text-[10px] p-2 block">No critical readings/watchlists registered.</span>}
                              </div>
                            </div>

                            {/* Timeline milestones stream */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>⌛ TIMELINE MILESTONE EVENTS ({timelineList.length})</span>
                                <button onClick={() => { handleTabChange('timeline'); }} className="text-[9px] underline hover:text-neutral-500">[View Timeline Live]</button>
                              </h4>
                              <div className="max-h-52 overflow-y-auto space-y-1 pr-1 border border-neutral-100 p-2 bg-neutral-50">
                                {timelineList.map((tData, index) => {
                                  const titleEn = tData.title_en || tData.stageTitle || '';
                                  const titleZh = tData.title_zh || tData.stageTitleZh || '';
                                  return (
                                    <div key={tData.id} className="flex justify-between items-center gap-2 p-1.5 bg-white border border-neutral-200 text-[11px]">
                                      <span className="truncate pr-1 font-bold text-black" title={titleEn}><span className="text-neutral-400 text-[10px] mr-1">({tData.year})</span> {lang === 'en' ? titleEn : titleZh}</span>
                                      <div className="flex gap-1.5 items-center shrink-0">
                                        {tData.status_cms === 'Draft' && <span className="px-1 text-[8px] bg-neutral-100 text-neutral-400 border select-none">DRAFT</span>}
                                        {tData.visibility === 'Private' && <span className="text-[10px]" title="Private">🔒</span>}
                                        <span className="text-[9px] text-neutral-300">|</span>
                                        <button
                                          disabled={index === 0}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nextList = [...timelineList];
                                            const temp = nextList[index];
                                            nextList[index] = nextList[index - 1];
                                            nextList[index - 1] = temp;
                                            setTimelineList(nextList);
                                            saveToLocal('archive_timeline', nextList);
                                          }}
                                          className="px-1 bg-neutral-105 hover:bg-neutral-200 border border-neutral-300 rounded text-[9.5px] disabled:opacity-25 active:scale-95 transition-all text-neutral-700 cursor-pointer font-bold select-none"
                                          title="Move Up"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          disabled={index === timelineList.length - 1}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const nextList = [...timelineList];
                                            const temp = nextList[index];
                                            nextList[index] = nextList[index + 1];
                                            nextList[index + 1] = temp;
                                            setTimelineList(nextList);
                                            saveToLocal('archive_timeline', nextList);
                                          }}
                                          className="px-1 bg-neutral-105 hover:bg-neutral-200 border border-neutral-300 rounded text-[9.5px] disabled:opacity-25 active:scale-95 transition-all text-neutral-700 cursor-pointer font-bold select-none"
                                          title="Move Down"
                                        >
                                          ▼
                                        </button>
                                        <span className="text-[9px] text-neutral-300">|</span>
                                        <button
                                          onClick={(e) => handleOpenTimelineEdit(e, tData)}
                                          className="text-neutral-600 hover:text-black font-bold font-mono text-[9px] px-1 cursor-pointer"
                                        >
                                          [EDIT]
                                        </button>
                                        <button
                                          onClick={(e) => handleDeleteTimeline(e, tData.id)}
                                          className="text-black hover:text-neutral-500 font-bold font-mono text-[9px] px-1 hover:bg-neutral-50 cursor-pointer"
                                        >
                                          [DELETE]
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                {timelineList.length === 0 && <span className="text-neutral-400 italic text-[10px] p-2 block">No milestones compiled.</span>}
                              </div>
                            </div>

                            {/* Audio Playlist Stream */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>🎵 CUSTOM PLAYLIST TRACKS ({customTracks.length})</span>
                                <button onClick={() => { handleTabChange('home'); }} className="text-[9px] underline hover:text-neutral-500">[View Audio Player]</button>
                              </h4>
                              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-neutral-100 p-2 bg-neutral-50">
                                {customTracks.map((t, idx) => (
                                  <div key={t.id || idx} className="flex justify-between items-center gap-2 p-1.5 bg-white border border-neutral-200 text-[11px]">
                                    <span className="truncate font-bold text-black" title={t.title}>{t.title} <span className="text-neutral-400 font-normal">by {t.artist}</span></span>
                                    <span className="text-[9.5px] px-1 py-0.2 border border-black bg-neutral-100 uppercase shrink-0 scale-90">{t.category || 'Curated'}</span>
                                  </div>
                                ))}
                                {customTracks.length === 0 && <span className="text-neutral-400 italic text-[10px] p-2 block">No audio tracks registered.</span>}
                              </div>
                            </div>

                            {/* Portal Navigation Stream */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>🗺️ PORTAL NAVIGATION LINKS ({customNavItems.length})</span>
                                <span className="text-[9px] text-neutral-450">[Menu Structure]</span>
                              </h4>
                              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-neutral-100 p-2 bg-neutral-50">
                                {customNavItems.map((n, idx) => (
                                  <div key={n.id || idx} className="flex justify-between items-center gap-2 p-1.5 bg-white border border-neutral-200 text-[11px]">
                                    <span className="truncate font-bold text-black">{n.label_en} <span className="text-neutral-400 font-normal">/ {n.label_zh}</span></span>
                                    <span className="text-[9px] text-neutral-400 shrink-0 font-mono">ID: {n.id}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Branding & Visual System Stream */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>🖼️ BRANDING & VISUAL SYSTEM</span>
                                <span className="text-[9px] text-neutral-450">[Visual Configuration]</span>
                              </h4>
                              <div className="border border-neutral-100 p-2 bg-neutral-50 space-y-1.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                                  <div className="bg-white border p-1.5 rounded-none flex justify-between"><span className="text-neutral-400">Brand Name:</span> <span className="font-bold">{localStorage.getItem('brand_name') || 'WENDY LU'}</span></div>
                                  <div className="bg-white border p-1.5 rounded-none flex justify-between"><span className="text-neutral-400">Custom Cursor:</span> <span className="font-bold">{customCursorEnabled ? `ON (${customCursorSize}px)` : 'OFF'}</span></div>
                                  <div className="bg-white border p-1.5 rounded-none flex justify-between"><span className="text-neutral-400">Avatar Hover L:</span> <span className="font-bold max-w-[100px] truncate">{avatarHoverLeft}</span></div>
                                  <div className="bg-white border p-1.5 rounded-none flex justify-between"><span className="text-neutral-400">Avatar Hover R:</span> <span className="font-bold max-w-[100px] truncate">{avatarHoverRight}</span></div>
                                  <div className="bg-white border p-1.5 rounded-none flex flex-col gap-1">
                                    <div className="flex justify-between"><span className="text-neutral-400">Module 1 Bg:</span> <span className="font-bold">{homeModule1Bg ? 'CUSTOM IMAGE' : 'DEFAULT'}</span></div>
                                    {homeModule1Bg && <img src={homeModule1Bg} className="h-10 w-full object-cover border border-neutral-200 mt-1" alt="Module 1" />}
                                  </div>
                                  <div className="bg-white border p-1.5 rounded-none flex flex-col gap-1">
                                    <div className="flex justify-between"><span className="text-neutral-400">Module 2 Bg:</span> <span className="font-bold">{homeModule2Bg ? 'CUSTOM IMAGE' : 'DEFAULT'}</span></div>
                                    {homeModule2Bg && <img src={homeModule2Bg} className="h-10 w-full object-cover border border-neutral-200 mt-1" alt="Module 2" />}
                                  </div>
                                  <div className="sm:col-span-2 bg-white border p-1.5 rounded-none flex justify-between"><span className="text-neutral-400">Page Global Bg:</span> <span className="font-bold truncate max-w-[200px]">{globalPageBg ? 'CUSTOM IMAGE' : 'DEFAULT'}</span></div>
                                  <div className="sm:col-span-2 bg-white border p-1.5 rounded-none flex justify-between"><span className="text-neutral-400">Hero Sub (EN):</span> <span className="font-bold truncate max-w-[200px]">{brandHeroSubEn}</span></div>
                                  <div className="sm:col-span-2 bg-white border p-1.5 rounded-none flex justify-between"><span className="text-neutral-400">Hero Sub (ZH):</span> <span className="font-bold truncate max-w-[200px]">{brandHeroSubZh}</span></div>
                                </div>
                              </div>
                            </div>

                            {/* Homepage Slogan Layout Stream */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>📣 HOMEPAGE HERO & SLOGANS</span>
                                <span className="text-[9px] text-neutral-450">[Main Slogans]</span>
                              </h4>
                              <div className="border border-neutral-100 p-2 bg-neutral-50 space-y-1.5">
                                <div className="space-y-1.5 text-[10px]">
                                  <div className="bg-white border p-1.5 rounded-none">
                                    <div className="font-bold text-neutral-500 mb-0.5">Hero Slogan Subtitle (EN/ZH):</div>
                                    <div className="text-black font-semibold">{brandHeroSubEn}</div>
                                    <div className="text-neutral-600 mt-0.5">{brandHeroSubZh}</div>
                                  </div>
                                  <div className="bg-white border p-1.5 rounded-none">
                                    <div className="font-bold text-neutral-500 mb-0.5">Brand Intro Slogan / Subheading (EN/ZH):</div>
                                    <div className="text-black font-semibold">{brandIntroEn}</div>
                                    <div className="text-neutral-600 mt-0.5">{brandIntroZh}</div>
                                  </div>
                                  <div className="bg-white border p-1.5 rounded-none">
                                    <div className="font-bold text-neutral-500 mb-0.5">Sequential Big Headline (EN/ZH):</div>
                                    <div className="text-black font-mono">
                                      {brandTitle1En} {brandTitle2En} {brandTitle3En}
                                    </div>
                                    <div className="text-neutral-600 mt-0.5">
                                      {brandTitle1Zh} {brandTitle2Zh} {brandTitle3Zh}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Core Skills & Craft Stream */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>🛠️ ABOUT SKILLS & CRAFT</span>
                                <span className="text-[9px] text-neutral-450">[Expertise List]</span>
                              </h4>
                              <div className="border border-neutral-100 p-2 bg-neutral-50 space-y-1.5">
                                <div className="space-y-1.5 text-[10px]">
                                  <div className="bg-white border p-1.5 rounded-none">
                                    <div className="font-bold text-neutral-550 mb-1 flex justify-between">
                                      <span>TITLE:</span>
                                      <span className="font-bold text-black">{aboutSkillsTitleEn} / {aboutSkillsTitleZh}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 pt-1 border-t border-dashed border-neutral-100">
                                      <div>
                                        <div className="font-bold text-neutral-400 mb-0.5">English list:</div>
                                        <ul className="list-disc pl-3 text-neutral-700 space-y-0.5">
                                          {aboutSkillsListEn.split('\n').filter(Boolean).map((skill, idx) => (
                                            <li key={idx} className="truncate">{skill}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <div className="font-bold text-neutral-400 mb-0.5">Chinese list:</div>
                                        <ul className="list-disc pl-3 text-neutral-700 space-y-0.5">
                                          {aboutSkillsListZh.split('\n').filter(Boolean).map((skill, idx) => (
                                            <li key={idx} className="truncate">{skill}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* CMS Editable Blocks Stream */}
                            <div className="space-y-2">
                              <h4 className="font-bold border-b border-dashed border-neutral-200 pb-1 uppercase text-neutral-505 text-[11px] flex justify-between">
                                <span>✍️ EDITABLE CMS METADATA BLOCKS</span>
                                <span className="text-[9px] text-neutral-450">[Bilingual Text]</span>
                              </h4>
                              <div className="border border-neutral-100 p-2 bg-neutral-50 space-y-1.5">
                                <div className="space-y-1.5 text-[10px]">
                                  <div className="bg-white border p-1.5 rounded-none">
                                    <div className="font-bold text-neutral-500 mb-0.5">Profile Title & Subtitle:</div>
                                    <div className="text-black">{profileTitleEn} / {profileTitleZh}</div>
                                    <div className="text-neutral-600 mt-1 truncate">{profileSubEn} // {profileSubZh}</div>
                                  </div>
                                  <div className="bg-white border p-1.5 rounded-none">
                                    <div className="font-bold text-neutral-500 mb-0.5">Contact Channels:</div>
                                    <div className="text-black">Email: {contactChannelEmail}</div>
                                    <div className="text-neutral-600">Linkedin: {contactChannelLinkedin}</div>
                                    <div className="text-neutral-600">Phone: {contactChannelPhone}</div>
                                  </div>
                                  <div className="bg-white border p-1.5 rounded-none">
                                    <div className="font-bold text-neutral-500 mb-0.5">Curated Showcase Highlights:</div>
                                    <div className="text-black truncate"><span className="text-neutral-400 font-normal">Showcase 1:</span> {showcase1TitleEn}</div>
                                    <div className="text-black truncate"><span className="text-neutral-400 font-normal">Showcase 2:</span> {showcase2TitleEn}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Backups & Developers Cabinet */}
                        <div className="border border-black p-5 bg-[#fafaf6] space-y-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded h-fit">
                          <span className="text-black font-extrabold uppercase text-[10px] border-b border-black pb-1.5 block">SYSTEM REGISTRY MANAGEMENT</span>
                          <span className="text-[9.5px] text-neutral-550 block leading-normal pt-1">
                            Export your entire local portfolio list, notes archive structure, and custom playlist preferences into a single client-side backup JSON file, or restore one instantly.
                          </span>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2">
                            <button
                              onClick={handleExportSystemSchema}
                              className="bg-white border border-black p-2 rounded-xs select-none hover:bg-neutral-50 tracking-tighter uppercase font-bold flex items-center justify-center gap-1 cursor-pointer text-black"
                              title="Download full content database as JSON file"
                            >
                              <Download className="w-3 h-3 text-black shrink-0" />
                              <span>BACKUP DB</span>
                            </button>
                            
                            <label className="bg-white border border-black p-2 rounded-xs hover:bg-neutral-50 tracking-tighter uppercase font-bold flex items-center justify-center gap-1 cursor-pointer select-none text-black">
                              <Upload className="w-3 h-3 text-black shrink-0" />
                              <span>RESTORE DB</span>
                              <input
                                type="file"
                                accept=".json"
                                onChange={handleImportSystemSchema}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <button
                            onClick={handleResetToDefaults}
                            className="w-full py-1 border border-dashed border-neutral-450 hover:bg-black hover:text-white rounded text-neutral-500 hover:border-black font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer flex items-center justify-center gap-1.5 bg-transparent mt-3"
                            title="Delete all website modifications and roll back to preloaded stock assets"
                          >
                            <RotateCcw className="w-3 h-3 shrink-0" />
                            <span>Revert Stock Defaults</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB Tabanel 3: HOMEPAGE SLOGANS, KEY RIBBONS & TARGET REDIRECTS CONFIGURATOR */}
                  {adminSubTab === 'homepage' && (
                    <form onSubmit={handleSaveProfileConfigs} className="space-y-6 animate-fade-in font-mono text-xs">
                      <div className="border border-black p-6 bg-white space-y-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-sm">
                        <div className="flex justify-between items-center border-b border-black pb-2">
                          <h3 className="font-serif text-base font-black uppercase text-black">🏠 Homepage Slogans & Taglines Settings</h3>
                          <span className="text-[8px] bg-neutral-100 border text-neutral-500 px-1 py-0.5">SLOGAN_COPYS</span>
                        </div>

                        {/* Top banner tag & intro zine description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Top Highlight Tag (English)</label>
                            <input
                              type="text"
                              value={brandHeroSubEn}
                              onChange={(e) => setBrandHeroSubEn(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs text-black outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">顶部霓虹高亮口号 (中文)</label>
                            <input
                              type="text"
                              value={brandHeroSubZh}
                              onChange={(e) => setBrandHeroSubZh(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs text-black outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Subtitle / Digital Zine Theme Title (English)</label>
                            <input
                              type="text"
                              value={brandIntroEn}
                              onChange={(e) => setBrandIntroEn(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs text-black outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">底端边注分类主轴说明 (中文)</label>
                            <input
                              type="text"
                              value={brandIntroZh}
                              onChange={(e) => setBrandIntroZh(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs text-black outline-none"
                            />
                          </div>
                        </div>

                        {/* 3-Part headline slogan */}
                        <div className="space-y-3 bg-neutral-50 p-4 border border-neutral-300 rounded">
                          <span className="text-[9px] uppercase font-extrabold text-black block border-b pb-1">🪟 Three-segment hero headlines ("And the stories go on...")</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1.5">
                            <div className="space-y-1 bg-white p-2 border border-neutral-205">
                              <span className="text-[8px] uppercase text-neutral-400 font-bold block mb-1">Segment 1 (e.g. And the / 而属于本地的)</span>
                              <input
                                type="text"
                                value={brandTitle1En}
                                onChange={(e) => setBrandTitle1En(e.target.value)}
                                className="w-full border border-neutral-300 p-1 text-[11px] bg-white text-black outline-none font-bold"
                                placeholder="En segment 1"
                              />
                              <input
                                type="text"
                                value={brandTitle1Zh}
                                onChange={(e) => setBrandTitle1Zh(e.target.value)}
                                className="w-full border border-neutral-300 p-1 text-[11px] bg-white text-black outline-none mt-1"
                                placeholder="Zh segment 1"
                              />
                            </div>

                            <div className="space-y-1 bg-white p-2 border border-neutral-205">
                              <span className="text-[8px] uppercase text-neutral-400 font-bold block mb-1">Segment 2 (e.g. stories / 广州故事)</span>
                              <input
                                type="text"
                                value={brandTitle2En}
                                onChange={(e) => setBrandTitle2En(e.target.value)}
                                className="w-full border border-neutral-300 p-1 text-[11px] bg-white text-black outline-none font-bold"
                                placeholder="En segment 2"
                              />
                              <input
                                type="text"
                                value={brandTitle2Zh}
                                onChange={(e) => setBrandTitle2Zh(e.target.value)}
                                className="w-full border border-neutral-300 p-1 text-[11px] bg-white text-black outline-none mt-1"
                                placeholder="Zh segment 2"
                              />
                            </div>

                            <div className="space-y-1 bg-white p-2 border border-neutral-205">
                              <span className="text-[8px] uppercase text-neutral-400 font-bold block mb-1">Segment 3 (e.g. go on. / 仍在续写。)</span>
                              <input
                                type="text"
                                value={brandTitle3En}
                                onChange={(e) => setBrandTitle3En(e.target.value)}
                                className="w-full border border-neutral-300 p-1 text-[11px] bg-white text-black outline-none font-bold"
                                placeholder="En segment 3"
                              />
                              <input
                                type="text"
                                value={brandTitle3Zh}
                                onChange={(e) => setBrandTitle3Zh(e.target.value)}
                                className="w-full border border-neutral-300 p-1 text-[11px] bg-white text-black outline-none mt-1"
                                placeholder="Zh segment 3"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Mid-page Ribbon Items config */}
                        <div className="space-y-2 bg-neutral-50 p-4 border border-neutral-300 rounded">
                          <span className="text-[9px] uppercase font-extrabold text-black block border-b pb-1">🎗️ Mid-Page Quote Ribbon Tags (中英双语模式编辑)</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1.5">
                            <div className="space-y-1 bg-white p-2 border border-neutral-200">
                              <span className="text-[8px] uppercase text-neutral-400 font-bold block">Tag Segment 1 (En / Zh)</span>
                              <input
                                type="text"
                                value={ribbon1En}
                                onChange={(e) => setRibbon1En(e.target.value)}
                                className="w-full border border-neutral-350 p-1 text-[11px] outline-none"
                              />
                              <input
                                type="text"
                                value={ribbon1Zh}
                                onChange={(e) => setRibbon1Zh(e.target.value)}
                                className="w-full border border-neutral-350 p-1 text-[11px] outline-none mt-1"
                              />
                            </div>
                            <div className="space-y-1 bg-white p-2 border border-neutral-200">
                              <span className="text-[8px] uppercase text-neutral-400 font-bold block">Tag Segment 2 (En / Zh)</span>
                              <input
                                type="text"
                                value={ribbon2En}
                                onChange={(e) => setRibbon2En(e.target.value)}
                                className="w-full border border-neutral-350 p-1 text-[11px] outline-none"
                              />
                              <input
                                type="text"
                                value={ribbon2Zh}
                                onChange={(e) => setRibbon2Zh(e.target.value)}
                                className="w-full border border-neutral-350 p-1 text-[11px] outline-none mt-1"
                              />
                            </div>
                            <div className="space-y-1 bg-white p-2 border border-neutral-200">
                              <span className="text-[8px] uppercase text-neutral-400 font-bold block">Tag Segment 3 (En / Zh)</span>
                              <input
                                type="text"
                                value={ribbon3En}
                                onChange={(e) => setRibbon3En(e.target.value)}
                                className="w-full border border-neutral-350 p-1 text-[11px] outline-none"
                              />
                              <input
                                type="text"
                                value={ribbon3Zh}
                                onChange={(e) => setRibbon3Zh(e.target.value)}
                                className="w-full border border-neutral-350 p-1 text-[11px] outline-none mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Curated feature header and Timeline Journey Headers config */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 bg-neutral-50 p-4 border border-neutral-300 rounded">
                            <span className="text-[9px] uppercase font-extrabold text-black block border-b pb-1">📺 Curated Showcase Section Header</span>
                            <div className="space-y-1 pt-1.5">
                              <label className="text-[8px] text-neutral-400 uppercase font-black">Section Title (EN / ZH)</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={curatedArchivesTitleEn}
                                  onChange={(e) => setCuratedArchivesTitleEn(e.target.value)}
                                  className="w-full border border-black p-1 text-[11px] bg-white outline-none"
                                />
                                <input
                                  type="text"
                                  value={curatedArchivesTitleZh}
                                  onChange={(e) => setCuratedArchivesTitleZh(e.target.value)}
                                  className="w-full border border-black p-1 text-[11px] bg-white outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 bg-neutral-50 p-4 border border-neutral-300 rounded">
                            <span className="text-[9px] uppercase font-extrabold text-black block border-b pb-1">⌛ Timeline Journey Core Header</span>
                            <div className="space-y-1 pt-1.5">
                              <label className="text-[8px] text-neutral-400 uppercase font-black">Journey Title (EN / ZH)</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={timelineTitleEn}
                                  onChange={(e) => setTimelineTitleEn(e.target.value)}
                                  className="w-full border border-black p-1 text-[11px] bg-white outline-none font-bold"
                                />
                                <input
                                  type="text"
                                  value={timelineTitleZh}
                                  onChange={(e) => setTimelineTitleZh(e.target.value)}
                                  className="w-full border border-black p-1 text-[11px] bg-white outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Intro write-outs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 p-4 border border-neutral-300 rounded">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Journey Biography Overview (English)</label>
                            <textarea
                              rows={3}
                              value={timelineIntroEn}
                              onChange={(e) => setTimelineIntroEn(e.target.value)}
                              className="w-full border border-neutral-300 p-2 text-xs bg-white text-neutral-800 leading-relaxed outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">年轮历程概述简介说明 (中文)</label>
                            <textarea
                              rows={3}
                              value={timelineIntroZh}
                              onChange={(e) => setTimelineIntroZh(e.target.value)}
                              className="w-full border border-neutral-300 p-2 text-xs bg-white text-neutral-800 leading-relaxed outline-none"
                            />
                          </div>
                        </div>

                        {/* Homepage two visual showcase blocks replacements and redirect options */}
                        <div className="border border-neutral-300 p-4 bg-neutral-100/50 space-y-4 rounded">
                          <div className="flex justify-between items-center border-b border-neutral-350 pb-1.5">
                            <span className="text-black font-extrabold uppercase text-[10px]">🏠 Homepage Hero Showcases (Two display positions configured bilingually)</span>
                            <span className="text-[8.5px] bg-black text-white px-1 font-mono uppercase">SPOT_DISPATCHERS</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                            {/* Showcase Spot 1: Visual Art Project card */}
                            <div className="p-4 bg-white border border-black space-y-3 shadow-xs">
                              <span className="text-[9px] font-black uppercase text-black block border-b pb-1 mb-2">🎁 Display Slot 1 (Left Visual Card)</span>
                              <div>
                                <label className="text-[8px] text-neutral-400 uppercase font-bold block mb-0.5">Top Category Tag (En / Zh)</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input 
                                    type="text" 
                                    value={showcase1BadgeEn} 
                                    onChange={(e) => setShowcase1BadgeEn(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                  <input 
                                    type="text" 
                                    value={showcase1BadgeZh} 
                                    onChange={(e) => setShowcase1BadgeZh(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-[8px] text-neutral-400 uppercase font-bold block mb-0.5">Small Subtitle (En / Zh)</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input 
                                    type="text" 
                                    value={showcase1SubtitleEn} 
                                    onChange={(e) => setShowcase1SubtitleEn(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                  <input 
                                    type="text" 
                                    value={showcase1SubtitleZh} 
                                    onChange={(e) => setShowcase1SubtitleZh(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[8px] text-neutral-400 uppercase font-bold block mb-0.5">Main Showcase Title (En / Zh)</label>
                                <div className="space-y-1">
                                  <input 
                                    type="text" 
                                    value={showcase1TitleEn} 
                                    onChange={(e) => setShowcase1TitleEn(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px] font-bold" 
                                  />
                                  <input 
                                    type="text" 
                                    value={showcase1TitleZh} 
                                    onChange={(e) => setShowcase1TitleZh(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                </div>
                              </div>

                              <div className="pt-2 border-t border-dashed">
                                <label className="text-[8px] text-neutral-400 uppercase font-black block mb-1">Target Click Redirect Page (跳转目标页面)</label>
                                <div className="flex gap-2">
                                  <select
                                    value={showcase1Redirect}
                                    onChange={(e) => setShowcase1Redirect(e.target.value)}
                                    className="border border-black p-1 bg-neutral-50 outline-none text-[10.5px] text-black font-bold flex-1"
                                  >
                                    <option value="home">HOME (首页面)</option>
                                    <option value="works">WORKS (策划作品/作品页面)</option>
                                    <option value="notes">NOTES (学术专栏/研阅笔记)</option>
                                    <option value="library">LIBRARY (媒体文史/评论数据库)</option>
                                    <option value="about">ABOUT (履历与宣言)</option>
                                    <option value="contact">CONTACT (对讲直接对话)</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleTabChange(showcase1Redirect)}
                                    className="px-2 py-1 bg-black text-white hover:bg-neutral-800 text-[9px] font-bold uppercase transition"
                                  >
                                    [ TEST/🔥跳转 ]
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Showcase Spot 2: Editorial Text Card */}
                            <div className="p-4 bg-white border border-black space-y-3 shadow-xs">
                              <span className="text-[9px] font-black uppercase text-black block border-b pb-1 mb-2">🎁 Display Slot 2 (Right Black Card)</span>
                              <div>
                                <label className="text-[8px] text-neutral-400 uppercase font-bold block mb-0.5">Top Accent Category (En / Zh)</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <input 
                                    type="text" 
                                    value={showcase2BadgeEn} 
                                    onChange={(e) => setShowcase2BadgeEn(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                  <input 
                                    type="text" 
                                    value={showcase2BadgeZh} 
                                    onChange={(e) => setShowcase2BadgeZh(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[8px] text-neutral-400 uppercase font-bold block mb-0.5">Main Card Headline Title (En / Zh)</label>
                                <div className="space-y-1">
                                  <input 
                                    type="text" 
                                    value={showcase2TitleEn} 
                                    onChange={(e) => setShowcase2TitleEn(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px] font-bold" 
                                  />
                                  <input 
                                    type="text" 
                                    value={showcase2TitleZh} 
                                    onChange={(e) => setShowcase2TitleZh(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[11px]" 
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[8px] text-neutral-400 uppercase font-bold block mb-0.5">Long Description copy (En / Zh)</label>
                                <div className="space-y-1">
                                  <textarea 
                                    rows={2}
                                    value={showcase2DescEn} 
                                    onChange={(e) => setShowcase2DescEn(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[10px] leading-relaxed" 
                                  />
                                  <textarea 
                                    rows={2}
                                    value={showcase2DescZh} 
                                    onChange={(e) => setShowcase2DescZh(e.target.value)} 
                                    className="border p-1 bg-white outline-none w-full text-[10px] leading-relaxed" 
                                  />
                                </div>
                              </div>

                              <div className="pt-2 border-t border-dashed">
                                <label className="text-[8px] text-neutral-400 uppercase font-black block mb-1">Target Click Redirect Page (跳转目标页面)</label>
                                <div className="flex gap-2">
                                  <select
                                    value={showcase2Redirect}
                                    onChange={(e) => setShowcase2Redirect(e.target.value)}
                                    className="border border-black p-1 bg-neutral-50 outline-none text-[10.5px] text-black font-bold flex-1"
                                  >
                                    <option value="home">HOME (首页面)</option>
                                    <option value="works">WORKS (作品列表页面)</option>
                                    <option value="notes">NOTES (学术专栏笔记)</option>
                                    <option value="library">LIBRARY (媒体史评论)</option>
                                    <option value="about">ABOUT (主理人介绍)</option>
                                    <option value="contact">CONTACT (对讲直接对话)</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleTabChange(showcase2Redirect)}
                                    className="px-2 py-1 bg-black text-white hover:bg-neutral-800 text-[9px] font-bold uppercase transition"
                                  >
                                    [ TEST/🔥跳转 ]
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Homepage & Global Background Images Upload Module */}
                        <div className="border border-neutral-300 p-4 bg-neutral-100/50 space-y-4 rounded">
                          <div className="flex justify-between items-center border-b border-neutral-350 pb-1.5">
                            <span className="text-black font-extrabold uppercase text-[10px]">🖼️ Custom Background Images Upload (模块背景与全局壁纸)</span>
                            <span className="text-[8.5px] bg-black text-white px-1 font-mono uppercase">BACKGROUND_ENGINE</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                            {/* Card 1 Background */}
                            <div className="p-3 bg-white border border-neutral-300 rounded space-y-2">
                              <span className="text-[9px] font-bold uppercase text-neutral-500 block">Slot 1 (Left Card) Background Image</span>
                              {homeModule1Bg ? (
                                <div className="space-y-1">
                                  <img src={homeModule1Bg} alt="slot1-bg font-light" className="h-16 w-full object-cover border border-neutral-200" />
                                  <button
                                    type="button"
                                    onClick={() => { setHomeModule1Bg(''); localStorage.removeItem('home_module1_bg_b64'); }}
                                    className="w-full text-center py-1 text-[8.5px] bg-red-100 hover:bg-red-200 text-red-700 uppercase font-mono font-black"
                                  >
                                    [ Clear / 清除 ]
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleBgImageUpload(e, setHomeModule1Bg, 'home_module1_bg_b64')}
                                  className="w-full text-[10px] border border-dashed border-neutral-300 p-2 cursor-pointer font-bold"
                                />
                              )}
                            </div>

                            {/* Card 2 Background */}
                            <div className="p-3 bg-white border border-neutral-300 rounded space-y-2">
                              <span className="text-[9px] font-bold uppercase text-neutral-500 block">Slot 2 (Right Card) Background Image</span>
                              {homeModule2Bg ? (
                                <div className="space-y-1">
                                  <img src={homeModule2Bg} alt="slot2-bg" className="h-16 w-full object-cover border border-neutral-200" />
                                  <button
                                    type="button"
                                    onClick={() => { setHomeModule2Bg(''); localStorage.removeItem('home_module2_bg_b64'); }}
                                    className="w-full text-center py-1 text-[8.5px] bg-red-100 hover:bg-red-200 text-red-700 uppercase font-mono font-black"
                                  >
                                    [ Clear / 清除 ]
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleBgImageUpload(e, setHomeModule2Bg, 'home_module2_bg_b64')}
                                  className="w-full text-[10px] border border-dashed border-neutral-300 p-2 cursor-pointer font-bold"
                                />
                              )}
                            </div>

                            {/* Global Page Background */}
                            <div className="p-3 bg-white border border-neutral-300 rounded space-y-2">
                              <span className="text-[9px] font-bold uppercase text-neutral-500 block">🖥️ Global Webpage Background Image</span>
                              {globalPageBg ? (
                                <div className="space-y-1">
                                  <img src={globalPageBg} alt="global-bg" className="h-16 w-full object-cover border border-neutral-200" />
                                  <button
                                    type="button"
                                    onClick={() => { setGlobalPageBg(''); localStorage.removeItem('global_page_bg_b64'); }}
                                    className="w-full text-center py-1 text-[8.5px] bg-red-100 hover:bg-red-200 text-red-700 uppercase font-mono font-black"
                                  >
                                    [ Clear / 清除 ]
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleBgImageUpload(e, setGlobalPageBg, 'global_page_bg_b64')}
                                  className="w-full text-[10px] border border-dashed border-neutral-300 p-2 cursor-pointer font-bold"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-black text-white hover:bg-neutral-850 font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 border-2 border-black cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>✓ SAVE SLOGANS & SHOWCASES</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* SUB Tabanel 4: ABOUT PAGE BIOGRAPHY */}
                  {adminSubTab === 'about' && (
                    <form onSubmit={handleSaveProfileConfigs} className="space-y-6 animate-fade-in font-mono text-xs">
                      <div className="border border-black p-6 bg-white space-y-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded">
                        <div className="flex justify-between items-center border-b border-black pb-2">
                          <h3 className="font-serif text-base font-black uppercase text-black">👤 About Page Copy & Biography Settings</h3>
                          <span className="text-[8px] bg-neutral-100 border text-neutral-500 px-1 py-0.5">BIOGRAPHY</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">About Practitioner Section Header (English)</label>
                            <input
                              type="text"
                              value={profileTitleEn}
                              onChange={(e) => setProfileTitleEn(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">关于主理人板块修饰标头 (中文)</label>
                            <input
                              type="text"
                              value={profileTitleZh}
                              onChange={(e) => setProfileTitleZh(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Practitioner Profession Subtitle (English)</label>
                            <input
                              type="text"
                              value={profileSubEn}
                              onChange={(e) => setProfileSubEn(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold text-black"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">主理人一句话宗旨头衔描述 (中文)</label>
                            <input
                              type="text"
                              value={profileSubZh}
                              onChange={(e) => setProfileSubZh(e.target.value)}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Main Practitioner Biography (English)</label>
                            <textarea
                              rows={5}
                              value={profileBioEn}
                              onChange={(e) => setProfileBioEn(e.target.value)}
                              className="w-full border border-black p-2.5 text-xs inline-block leading-relaxed bg-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">主理人第一段学术社会学经历详情 (中文)</label>
                            <textarea
                              rows={5}
                              value={profileBioZh}
                              onChange={(e) => setProfileBioZh(e.target.value)}
                              className="w-full border border-black p-2.5 text-xs inline-block leading-relaxed bg-white outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Second Biography Paragraph Focus (English)</label>
                            <textarea
                              rows={4}
                              value={profileSecondEn}
                              onChange={(e) => setProfileSecondEn(e.target.value)}
                              className="w-full border border-black p-2.5 text-xs leading-relaxed bg-white outline-none text-neutral-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">主理人第二段实践与社区更新计划说明 (中文)</label>
                            <textarea
                              rows={4}
                              value={profileSecondZh}
                              onChange={(e) => setProfileSecondZh(e.target.value)}
                              className="w-full border border-black p-2.5 text-xs leading-relaxed bg-white outline-none text-neutral-750"
                            />
                          </div>
                        </div>

                        {/* Title Customize for Contact Title and Skills Title */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
                          <div className="space-y-2">
                            <h4 className="font-bold uppercase text-[10px] text-zinc-800">☎️ Contact Block Section Header</h4>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase text-neutral-400 font-bold block">Contact Channels Title (English)</label>
                              <input 
                                type="text"
                                value={aboutContactTitleEn}
                                onChange={(e) => setAboutContactTitleEn(e.target.value)}
                                className="w-full border border-black p-2 text-xs bg-white outline-none font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase text-neutral-400 font-bold block">中枢通道标题 (中文)</label>
                              <input 
                                type="text"
                                value={aboutContactTitleZh}
                                onChange={(e) => setAboutContactTitleZh(e.target.value)}
                                className="w-full border border-black p-2 text-xs bg-white outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-bold uppercase text-[10px] text-zinc-800">🛠️ Skills List Block Header</h4>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase text-neutral-400 font-bold block">Skills Title (English)</label>
                              <input 
                                type="text"
                                value={aboutSkillsTitleEn}
                                onChange={(e) => setAboutSkillsTitleEn(e.target.value)}
                                className="w-full border border-black p-2 text-xs bg-white outline-none font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase text-neutral-400 font-bold block">兵器量仪标题 (中文)</label>
                              <input 
                                type="text"
                                value={aboutSkillsTitleZh}
                                onChange={(e) => setAboutSkillsTitleZh(e.target.value)}
                                className="w-full border border-black p-2 text-xs bg-white outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Skills List content split by newline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Bilingual Skills List (English - Newline Split)</label>
                            <textarea 
                              rows={5}
                              value={aboutSkillsListEn}
                              onChange={(e) => setAboutSkillsListEn(e.target.value)}
                              placeholder="Type one skill per line..."
                              className="w-full border border-black p-2.5 text-xs bg-white outline-none font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">实干兵器清单 (中文 - 换行分隔)</label>
                            <textarea 
                              rows={5}
                              value={aboutSkillsListZh}
                              onChange={(e) => setAboutSkillsListZh(e.target.value)}
                              placeholder="每行输入一项兵器技能..."
                              className="w-full border border-black p-2.5 text-xs bg-white outline-none font-mono"
                            />
                          </div>
                        </div>

                        {/* Avatar Hover Text Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
                          <div className="col-span-full">
                            <h4 className="font-bold uppercase text-[10px] text-zinc-800">👤 Avatar Hover Popup Text (头像悬浮弹出框文本自定义在 settings 选项)</h4>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400 block">Hover Popup Left Status text (English/Default)</label>
                            <input 
                              type="text"
                              value={avatarHoverLeft}
                              onChange={(e) => setAvatarHoverLeft(e.target.value)}
                              className="w-full border border-black p-2 text-xs bg-white outline-none font-bold"
                              placeholder="W. LU AVATAR"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400 block">Hover Popup Right Coordination text (English/Default)</label>
                            <input 
                              type="text"
                              value={avatarHoverRight}
                              onChange={(e) => setAvatarHoverRight(e.target.value)}
                              className="w-full border border-black p-2 text-xs bg-white outline-none"
                              placeholder="COORD // GZ"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-black text-white hover:bg-neutral-850 font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 border-2 border-black cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>✓ SAVE PERSONAL CONFIGURATIONS</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {adminSubTab === 'navigation' && (
                    <div className="space-y-6 animate-fade-in font-mono text-xs">
                      <div className="border border-black p-6 bg-white space-y-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded">
                        <div className="flex justify-between items-center border-b border-black pb-2">
                          <h3 className="font-serif text-base font-black uppercase text-black">🧭 Right Navbar Titles & Custom Sequence</h3>
                          <span className="text-[8px] bg-neutral-100 border text-neutral-500 px-1 py-0.5">NAVIGATION</span>
                        </div>

                        <span className="text-zinc-500 block leading-relaxed text-[11px]">
                          * Change labels below to rename how tabs display on the right fixed dock. Change their ordering instantly using the Up / Down controls.
                        </span>

                        <div className="space-y-3">
                          {customNavItems.map((item, index) => (
                            <div key={item.id} className="border border-black p-3 bg-neutral-50 flex items-center justify-between gap-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 font-bold text-black uppercase">
                                  <span className="text-neutral-400">#{index+1} ID:</span> {item.id}
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] block font-bold text-neutral-400">LABEL (ENGLISH)</label>
                                  <input 
                                    type="text"
                                    value={item.label_en}
                                    onChange={(e) => {
                                      const updated = [...customNavItems];
                                      updated[index].label_en = e.target.value;
                                      setCustomNavItems(updated);
                                    }}
                                    className="w-full border border-black p-1 text-xs bg-white text-black outline-none font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] block font-bold text-neutral-400">标签标称 (中文)</label>
                                  <input 
                                    type="text"
                                    value={item.label_zh}
                                    onChange={(e) => {
                                      const updated = [...customNavItems];
                                      updated[index].label_zh = e.target.value;
                                      setCustomNavItems(updated);
                                    }}
                                    className="w-full border border-black p-1 text-xs bg-white text-black outline-none"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-1.5 self-end md:self-center shrink-0">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => {
                                    const nextList = [...customNavItems];
                                    const temp = nextList[index];
                                    nextList[index] = nextList[index - 1];
                                    nextList[index - 1] = temp;
                                    setCustomNavItems(nextList);
                                    localStorage.setItem('custom_nav_items', JSON.stringify(nextList));
                                  }}
                                  className="px-2 py-1 border border-black text-xs font-bold hover:bg-black hover:text-white transition cursor-pointer disabled:opacity-25"
                                >
                                  ▲ UP
                                </button>
                                <button
                                  type="button"
                                  disabled={index === customNavItems.length - 1}
                                  onClick={() => {
                                    const nextList = [...customNavItems];
                                    const temp = nextList[index];
                                    nextList[index] = nextList[index + 1];
                                    nextList[index + 1] = temp;
                                    setCustomNavItems(nextList);
                                    localStorage.setItem('custom_nav_items', JSON.stringify(nextList));
                                  }}
                                  className="px-2 py-1 border border-black text-xs font-bold hover:bg-black hover:text-white transition cursor-pointer disabled:opacity-25"
                                >
                                  ▼ DOWN
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end pt-2 border-t">
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem('custom_nav_items', JSON.stringify(customNavItems));
                              alert(lang === 'en' ? 'Navbar order and bilingual titles saved successfully!' : '导航栏双语标题与排布物理序列已保存成功！');
                            }}
                            className="px-5 py-2.5 bg-black text-white hover:bg-neutral-850 font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>✓ APPLY & SAVE NAV LAYOUT</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminSubTab === 'notes_meta' && (
                    <div className="space-y-6 animate-fade-in font-mono text-xs">
                      <div className="border border-black p-6 bg-white space-y-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded">
                        <div className="flex justify-between items-center border-b border-black pb-2">
                          <h3 className="font-serif text-base font-black uppercase text-black">📰 Notes Section Titles & Button Labels Customizer</h3>
                          <span className="text-[8px] bg-neutral-100 border text-neutral-500 px-1 py-0.5">NOTES_LABELS</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Notes Top Subtitle (English)</label>
                            <input 
                              type="text"
                              value={noteTopSubtitleEn}
                              onChange={(e) => {
                                setNoteTopSubtitleEn(e.target.value);
                                localStorage.setItem('note_top_subtitle_en', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">最上方副标栏 (中文)</label>
                            <input 
                              type="text"
                              value={noteTopSubtitleZh}
                              onChange={(e) => {
                                setNoteTopSubtitleZh(e.target.value);
                                localStorage.setItem('note_top_subtitle_zh', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Notes Main Section Title (English)</label>
                            <input 
                              type="text"
                              value={noteTopTitleEn}
                              onChange={(e) => {
                                setNoteTopTitleEn(e.target.value);
                                localStorage.setItem('note_top_title_en', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">研读标文主标题 (中文)</label>
                            <input 
                              type="text"
                              value={noteTopTitleZh}
                              onChange={(e) => {
                                setNoteTopTitleZh(e.target.value);
                                localStorage.setItem('note_top_title_zh', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">"Read Insights" button label (English)</label>
                            <input 
                              type="text"
                              value={noteBtnReadEn}
                              onChange={(e) => {
                                setNoteBtnReadEn(e.target.value);
                                localStorage.setItem('note_btn_read_en', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">“研读解密”按钮文本 (中文)</label>
                            <input 
                              type="text"
                              value={noteBtnReadZh}
                              onChange={(e) => {
                                setNoteBtnReadZh(e.target.value);
                                localStorage.setItem('note_btn_read_zh', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">"Editorial Insights Bulletin" panel title (English)</label>
                            <input 
                              type="text"
                              value={noteTitleInsightsEn}
                              onChange={(e) => {
                                setNoteTitleInsightsEn(e.target.value);
                                localStorage.setItem('note_title_insights_en', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">“研读主干内容洞察”板块标头 (中文)</label>
                            <input 
                              type="text"
                              value={noteTitleInsightsZh}
                              onChange={(e) => {
                                setNoteTitleInsightsZh(e.target.value);
                                localStorage.setItem('note_title_insights_zh', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">"Launch Original Interface" button label (English)</label>
                            <input 
                              type="text"
                              value={noteBtnLaunchEn}
                              onChange={(e) => {
                                setNoteBtnLaunchEn(e.target.value);
                                localStorage.setItem('note_btn_launch_en', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">“进入模拟原文链道”按钮文本 (中文)</label>
                            <input 
                              type="text"
                              value={noteBtnLaunchZh}
                              onChange={(e) => {
                                setNoteBtnLaunchZh(e.target.value);
                                localStorage.setItem('note_btn_launch_zh', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">"Publish New Article" trigger copy (English)</label>
                            <input 
                              type="text"
                              value={noteBtnPublishEn}
                              onChange={(e) => {
                                setNoteBtnPublishEn(e.target.value);
                                localStorage.setItem('note_btn_publish_en', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">“发表新专栏文章”按钮文本 (中文)</label>
                            <input 
                              type="text"
                              value={noteBtnPublishZh}
                              onChange={(e) => {
                                setNoteBtnPublishZh(e.target.value);
                                localStorage.setItem('note_btn_publish_zh', e.target.value);
                              }}
                              className="w-full border border-black p-2 bg-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              alert(lang === 'en' ? 'Bilingual labels updated successfully!' : '专栏文案及标号内容保存成功！');
                            }}
                            className="px-5 py-2.5 bg-black text-white hover:bg-neutral-850 font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>✓ SAVE NOTES COPIES</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminSubTab === 'playlist_mgr' && (
                    <div className="space-y-6 animate-fade-in font-mono text-xs">
                      <div className="border border-black p-6 bg-white space-y-6 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded">
                        <div className="flex justify-between items-center border-b border-black pb-2">
                          <h3 className="font-serif text-base font-black uppercase text-black">🎵 Sound System & Playlist Tracks Manager</h3>
                          <span className="text-[8px] bg-neutral-100 border text-neutral-500 px-1 py-0.5">PLAYLIST_MANAGER</span>
                        </div>

                        <span className="text-zinc-500 block leading-relaxed text-[11px]">
                          * Drag & Drop audio files (.mp3, .wav, or .ogg) or select a file manually to upload songs, which populate and autoplay in the high-fidelity sound playlist at the top of the viewport!
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Left Column: Drag & Drop Area */}
                          <div className="md:col-span-1 space-y-3">
                            <label className="text-[9px] uppercase font-bold text-neutral-400 block">Drag or Upload Audio / 拖拽或上传曲目</label>
                            
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files?.[0];
                                if (file && file.type.startsWith('audio/')) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    const originalTitle = file.name.replace(/\.[^/.]+$/, "");
                                    const artistInput = prompt(lang === 'en' ? "Please enter Artist Name:" : "请输入表演艺术家/合成器名称:") || "Resident Synth";
                                    const finalTitle = prompt(lang === 'en' ? "Please confirm Song Title:" : "请确认歌曲名称:", originalTitle) || originalTitle;
                                    
                                    const trackId = `track-custom-${Date.now()}`;
                                    audioDB.setTrackData(trackId, base64).then(() => {
                                      const newTrack = {
                                        id: trackId,
                                        title: finalTitle,
                                        artist: artistInput,
                                        fileUrl: '', // Clear this to save localstorage quota!
                                        duration: '03:15'
                                      };
                                      const updated = [newTrack, ...customTracks];
                                      setCustomTracks(updated);
                                      localStorage.setItem('playlist_tracks', JSON.stringify(updated));
                                      window.dispatchEvent(new Event('playlist-updated'));
                                      alert(lang === 'en' ? 'Track uploaded and selected for default autoplay!' : '全新声轨曲目已成功加载并被设置为系统首选自动播放！');
                                    }).catch(err => {
                                      console.error("Failed to save audio track in browser store:", err);
                                      alert(lang === 'en' ? 'Failed to save track in database.' : '存储到本地数据库失败。');
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                } else {
                                  alert(lang === 'en' ? 'Please upload standard audio files.' : '请上传标准音频格式曲目（如 MP3, WAV 等）');
                                }
                              }}
                              onClick={() => {
                                document.getElementById('music-track-picker-input')?.click();
                              }}
                              className="border-2 border-dashed border-neutral-300 hover:border-black p-6 rounded bg-neutral-50 flex flex-col justify-center items-center text-center cursor-pointer transition-colors aspect-video"
                            >
                              <input 
                                type="file" 
                                id="music-track-picker-input" 
                                accept="audio/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const base64 = event.target?.result as string;
                                      const originalTitle = file.name.replace(/\.[^/.]+$/, "");
                                      const artistInput = prompt(lang === 'en' ? "Please enter Artist Name:" : "请输入表演艺术家/合成器名称:") || "Resident Synth";
                                      const finalTitle = prompt(lang === 'en' ? "Please confirm Song Title:" : "请确认歌曲名称:", originalTitle) || originalTitle;
                                      
                                      const trackId = `track-custom-${Date.now()}`;
                                      audioDB.setTrackData(trackId, base64).then(() => {
                                        const newTrack = {
                                          id: trackId,
                                          title: finalTitle,
                                          artist: artistInput,
                                          fileUrl: '', // Clear to save localstorage quota!
                                          duration: '03:15'
                                        };
                                        const updated = [newTrack, ...customTracks];
                                        setCustomTracks(updated);
                                        localStorage.setItem('playlist_tracks', JSON.stringify(updated));
                                        window.dispatchEvent(new Event('playlist-updated'));
                                        alert(lang === 'en' ? 'Track uploaded and selected for default autoplay!' : '全新声轨曲目已成功加载并被设置为系统首选自动播放！');
                                      }).catch(err => {
                                        console.error("Failed to save audio track in browser store:", err);
                                        alert(lang === 'en' ? 'Failed to save track in database.' : '存储到本地数据库失败。');
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                              <span className="font-bold text-[10px] text-zinc-700">
                                {lang === 'en' ? 'DRAG FILE HERE OR CLICK TO UPLOAD' : '拖入音频文件或点击浏览本地上传'}
                              </span>
                              <span className="text-[8px] text-zinc-400 mt-1">.mp3, .wav, .ogg Supported</span>
                            </div>
                          </div>

                          {/* Right Column: Track queue List */}
                          <div className="md:col-span-2 space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[9px] uppercase font-bold text-neutral-400 block">Current Sound Playlist ({customTracks.length} tracks)</label>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(lang === 'en' ? "Restore tracks to default set?" : "确定要恢复到默认出厂配置声轨吗？")) {
                                    setCustomTracks(TRACKS);
                                    localStorage.setItem('playlist_tracks', JSON.stringify(TRACKS));
                                    window.dispatchEvent(new Event('playlist-updated'));
                                  }
                                }}
                                className="text-red-500 hover:underline text-[9px] font-bold"
                              >
                                [ RESTORE DEFAULTS / 恢复默认 ]
                              </button>
                            </div>

                            <div className="border border-black rounded divide-y divide-neutral-200 max-h-[300px] overflow-y-auto bg-neutral-50 p-1 space-y-1">
                              {customTracks.map((track, idx) => {
                                const isDefault = track.id.startsWith('track-') && !track.id.startsWith('track-custom-');
                                return (
                                  <div 
                                    key={track.id} 
                                    draggable={true}
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('text/plain', idx.toString());
                                      e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      const srcIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                                      if (isNaN(srcIdx) || srcIdx === idx) return;
                                      
                                      const reordered = [...customTracks];
                                      const [moved] = reordered.splice(srcIdx, 1);
                                      reordered.splice(idx, 0, moved);
                                      
                                      setCustomTracks(reordered);
                                      localStorage.setItem('playlist_tracks', JSON.stringify(reordered));
                                      window.dispatchEvent(new Event('playlist-updated'));
                                    }}
                                    className="flex justify-between items-center p-2 bg-white border border-neutral-100 hover:border-black transition rounded-xs cursor-grab active:cursor-grabbing"
                                    title={lang === 'en' ? 'Drag and drop to adjust play sequence' : '按住拖动调整歌曲播放顺序'}
                                  >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      {/* Drag Indicator Grip Handle */}
                                      <div className="text-stone-400 hover:text-black transition shrink-0">
                                        <GripVertical className="w-3.5 h-3.5" />
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          window.dispatchEvent(new CustomEvent('play-track-command', { detail: { id: track.id } }));
                                        }}
                                        className="w-5 h-5 flex items-center justify-center bg-zinc-100 hover:bg-black text-black hover:text-white border border-black/10 rounded transition cursor-pointer shrink-0 font-bold select-none text-[8.5px]"
                                        title="Play track / 播放音乐"
                                      >
                                        ▶
                                      </button>
                                      
                                      <div className="min-w-0 font-sans">
                                        <div className="font-bold text-[10px] text-black truncate flex items-center gap-1.5 leading-tight">
                                          <span>{idx + 1}.</span>
                                          <span className="truncate">{track.title}</span>
                                          {!isDefault && (
                                            <span className="text-[7px] font-sans px-1 bg-zinc-200 text-neutral-705 font-black rounded-xs scale-90 leading-none">USER</span>
                                          )}
                                        </div>
                                        <div className="text-[9px] text-neutral-400 truncate mt-0.5">{track.artist}</div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(lang === 'en' ? `Remove track "${track.title}"?` : `确定要删除 "${track.title}" 曲目吗？`)) {
                                          const filtered = customTracks.filter(t => t.id !== track.id);
                                          audioDB.deleteTrackData(track.id);
                                          setCustomTracks(filtered);
                                          localStorage.setItem('playlist_tracks', JSON.stringify(filtered));
                                          window.dispatchEvent(new Event('playlist-updated'));
                                        }
                                      }}
                                      className="text-red-550 hover:bg-red-50 p-1.5 rounded transition cursor-pointer text-[10px]"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB Tabpanel 8: CUSTOM CURSOR & GLOBAL SYSTEM SETTINGS */}
                  {adminSubTab === 'settings_custom' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-sm space-y-6 text-[#000000]">
                        <div className="border-b border-black/10 pb-3">
                          <span className="text-[9px] font-mono text-neutral-400 font-bold block uppercase tracking-widest">// GLOBAL AESTHETICS ENGINE</span>
                          <h2 className="font-serif text-xl font-bold uppercase">{lang === 'en' ? 'Genuinely Custom Cursors' : '全局自定义光标与个性化配置'}</h2>
                          <p className="font-mono text-[10px] text-neutral-400 mt-1">
                            {lang === 'en' 
                              ? 'Upload reference icons/images (e.g. .png, .jpg, .svg) and rescale live canvas coordinates to style custom vectors.' 
                              : '创作者工作台专属：在此上传光标设计图（支持透明PNG/SVG/JPG），并拖动大小滑块拉伸进行全局渲染。鼠标在网页中移动时，将实时显示为该光标！'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Image Upload Zone */}
                          <div className="space-y-4 font-mono text-xs">
                            <span className="font-bold text-[10px] uppercase text-zinc-500 block">1. Cursor Asset Source / 光标图片源</span>
                            
                            <div className="border border-black p-4 bg-neutral-50 rounded-sm">
                              {customCursorImage ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3 bg-white p-2 border border-black/10 shadow-sm rounded-xs">
                                    <div 
                                      className="w-10 h-10 border border-black/30 flex items-center justify-center bg-stone-100 relative overflow-hidden shrink-0"
                                      style={{ cursor: `url(${customCursorImage}) 0 0, auto` }}
                                      title={lang === 'en' ? 'Hover here to preview cursor' : '悬停此处预览光标'}
                                    >
                                      <img 
                                        src={customCursorImage} 
                                        alt="cursor file" 
                                        className="object-contain" 
                                        style={{ width: `${customCursorSize}px`, height: `${customCursorSize}px` }}
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-black text-[10px] text-zinc-800">active_cursor_asset</div>
                                      <div className="text-[8.5px] text-neutral-400">Scaled: {customCursorSize}px × {customCursorSize}px</div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCustomCursorImage(null);
                                        localStorage.removeItem('custom_cursor_image');
                                      }}
                                      className="px-2 py-0.5 border border-red-500 hover:bg-red-50 text-red-500 font-extrabold text-[9px] cursor-pointer"
                                    >
                                      [DELETE]
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4 space-y-3_wrap">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    id="cursor-asset-uploader"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file && file.type.startsWith('image/')) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const base64 = event.target?.result as string;
                                          if (base64) {
                                            // Render onto a helper canvas to scale immediately and filter background
                                            const img = new Image();
                                            img.onload = () => {
                                              const canvas = document.createElement('canvas');
                                              const size = customCursorSize; 
                                              canvas.width = size;
                                              canvas.height = size;
                                              const ctx = canvas.getContext('2d');
                                              if (ctx) {
                                                ctx.drawImage(img, 0, 0, size, size);
                                                const smallBase = canvas.toDataURL('image/png');
                                                setCustomCursorImage(smallBase);
                                                localStorage.setItem('custom_cursor_image', smallBase);
                                              }
                                            };
                                            img.src = base64;
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor="cursor-asset-uploader"
                                    className="cursor-pointer inline-block px-4 py-2 bg-black text-white hover:bg-neutral-800 font-extrabold uppercase text-[10px] border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] font-sans"
                                  >
                                    {lang === 'en' ? 'Upload Custom Cursor / 本地选择光标图片' : '本地上传光标图片'}
                                  </label>
                                  <div className="text-[8px] text-zinc-400 mt-2 block">Supports transparent png / svg vector shapes. Web safe pixel scaling auto-applied.</div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Sizing & Calibration Controls */}
                          <div className="space-y-4 font-mono text-xs">
                            <span className="font-bold text-[10px] uppercase text-zinc-500 block">2. Scale & Toggle Engine / 缩放与使能开关</span>
                            
                            <div className="space-y-4 border border-black/10 p-4 rounded bg-stone-50">
                              <div className="flex justify-between items-center bg-white p-2.5 border border-black/5 rounded">
                                <label className="flex items-center gap-2 font-bold text-[10.5px] cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    checked={customCursorEnabled}
                                    onChange={(e) => {
                                      setCustomCursorEnabled(e.target.checked);
                                      localStorage.setItem('custom_cursor_enabled', String(e.target.checked));
                                    }}
                                    className="w-4 h-4 border border-black accent-black rounded-none"
                                  />
                                  <span>{lang === 'en' ? 'Enable Custom Cursor' : '开启自定义光标功能'}</span>
                                </label>
                              </div>

                              <div className="space-y-1.5 pt-1.5 border-t border-black/5">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span>📏 CURSOR SIZE / 光标大小</span>
                                  <span className="text-zinc-500">{customCursorSize}px</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="16" 
                                  max="48" 
                                  value={customCursorSize}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setCustomCursorSize(val);
                                    localStorage.setItem('custom_cursor_size', String(val));
                                    
                                    // When dynamic size changes, recreate scaled base64 cursor if original is present
                                    if (customCursorImage) {
                                      const img = new Image();
                                      img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        canvas.width = val;
                                        canvas.height = val;
                                        const ctx = canvas.getContext('2d');
                                        if (ctx) {
                                          ctx.drawImage(img, 0, 0, val, val);
                                          const resized = canvas.toDataURL('image/png');
                                          setCustomCursorImage(resized);
                                          localStorage.setItem('custom_cursor_image', resized);
                                        }
                                      };
                                      img.src = customCursorImage;
                                    }
                                  }}
                                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none accent-black cursor-pointer"
                                />
                                <div className="flex justify-between text-[7px] text-zinc-400 uppercase font-black tracking-wider">
                                  <span>16px (small)</span>
                                  <span>48px (high-vis)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive playground box */}
                        <div className="border border-black p-4 bg-zinc-100 rounded text-center relative select-none">
                          <span className="font-serif text-[10px] italic text-zinc-500 block mb-1">
                            {lang === 'en' ? '--- CURSOR EXPERIMENTAL PLAYGROUND ---' : '=== 鼠标光标创意交互测试区 ==='}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {lang === 'en' ? 'Hover/Drag inside this panel to verify vector orientation.' : '将鼠标在这个灰色卡片内移动，可立即测试您上传设计的专属自定义鼠标！'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SOCIAL & COPYRIGHT FOOTER EMBEDDED IN CORE MAIN CONTAINER */}
          <footer className="mt-auto pt-16 flex flex-col sm:flex-row justify-between items-center border-t border-black/10 gap-4">
            <div className="font-mono text-[10px] flex gap-6 font-bold">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:line-through uppercase flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-black" /> LINKEDIN
              </a>
              <a href="mailto:wlu7853@gmail.com" className="hover:line-through uppercase flex items-center gap-1">
                <Mail className="w-3 h-3 text-black" /> EMAIL
              </a>
              {/* GitHub link permanently deleted per custom requirements! */}
            </div>
            
            <div className="text-center sm:text-right font-mono text-[9px] text-neutral-400 font-semibold leading-relaxed">
              © 2026 ARCHIVED BY W. DESIGNED UNDER EDITORIAL DIRECTIVES.<br />
              ALL SYSTEM REGISTERS PROTECTED.
            </div>
          </footer>
        </main>

        {/* 3. RIGHT FIXED DOCK NAVIGATION BAR */}
        <Navbar activeTab={activeTab} setActiveTab={handleTabChange} lang={lang} setLang={setLang} customNavItems={customNavItems} />
      </div>

      {/* DRAGGABLE FLOATING ACTION CAPTURE BALL (FAB) FOR REGISTERED ADMINISTRATORS ONLY */}
      {isAdminLoggedIn && (
        <motion.div
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
          id="floating-administrator-capture-anchor"
          className="fixed bottom-20 md:bottom-12 right-12 z-55 group select-none cursor-grab"
          style={{ x: 0, y: 0 }}
        >
          <div className="relative">
            {/* Grab drag guide text indicator showing only on hover */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-mono font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white">
              ✊🏼 DRAG ME ANYWHERE
            </div>

            {/* Expanded items list above key triggers */}
            <AnimatePresence>
              {isFabOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-14 right-0 bg-white border-2 border-black p-3.5 space-y-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-mono text-[10.5px] font-bold uppercase w-56 rounded pointer-events-auto"
                  id="expanded-creation-drawer"
                >
                  <span className="text-[8px] text-neutral-400 block border-b border-neutral-100 pb-1.5 mb-1 select-none font-bold">⚡ STUDIO CONTROL HUB</span>
                  <button 
                    onClick={() => { setActiveQuickForm('project'); setIsFabOpen(false); }}
                    className="w-full text-left py-1 hover:bg-neutral-50 hover:pl-1.5 transition-all text-neutral-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    🎨 {lang === 'en' ? 'Add Portfolio Work' : '新增作品档案'}
                  </button>
                  <button 
                    onClick={() => { setActiveQuickForm('note'); setIsFabOpen(false); }}
                    className="w-full text-left py-1 hover:bg-neutral-50 hover:pl-1.5 transition-all text-neutral-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    📝 {lang === 'en' ? 'Add WeChat Note' : '新增微信专栏'}
                  </button>
                  <button 
                    onClick={() => { setActiveQuickForm('library'); setIsFabOpen(false); }}
                    className="w-full text-left py-1 hover:bg-neutral-50 hover:pl-1.5 transition-all text-neutral-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    📚 {lang === 'en' ? 'Add Library Review' : '新增书影音评阅'}
                  </button>
                  <button 
                    onClick={() => { handleOpenTimelineAdd(); }}
                    className="w-full text-left py-1 hover:bg-neutral-50 hover:pl-1.5 transition-all text-neutral-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    ⌛ {lang === 'en' ? 'Add Timeline Stage' : '新增时序年轮节点'}
                  </button>
                  <button 
                    onClick={() => { setActiveQuickForm('profile'); setIsFabOpen(false); }}
                    className="w-full text-left py-1 hover:bg-neutral-50 hover:pl-1.5 transition-all text-neutral-800 flex items-center gap-1.5 cursor-pointer border-t border-dashed border-neutral-200 mt-1.5 pt-1.5"
                  >
                    👤 {lang === 'en' ? 'Edit Practise Profile' : '编辑主理人宣言'}
                  </button>
                  <button 
                    onClick={() => { 
                      setBrandNameInput(localStorage.getItem('brand_name') || 'WENDY LU');
                      setHoverLeftInput(localStorage.getItem('logo_avatar_hover_left') || 'W. LU AVATAR');
                      setHoverRightInput(localStorage.getItem('logo_avatar_hover_right') || 'COORD // GZ');
                      setIsBrandEditorOpen(true); 
                      setIsFabOpen(false); 
                    }}
                    className="w-full text-left py-1 hover:bg-neutral-50 hover:pl-1.5 transition-all text-neutral-900 flex items-center gap-1.5 cursor-pointer border-t border-solid border-neutral-300 mt-1.5 pt-1.5 font-extrabold"
                  >
                    ✏️ {lang === 'en' ? 'Edit Sidebar Name' : '编辑左侧展示名字'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => { setIsFabOpen(!isFabOpen); }}
              className={`w-14 h-14 bg-black text-white hover:bg-neutral-900 flex flex-col items-center justify-center border border-white cursor-pointer shadow-2xl hover:scale-110 transition-all rounded-full relative z-40 select-none ${isFabOpen ? 'rotate-180 bg-neutral-950 text-white' : ''}`}
              title="Studio Portal CMS Capture Menu"
            >
              {isFabOpen ? (
                <span className="text-sm leading-none font-sans font-black">✕</span>
              ) : (
                <>
                  <span className="text-base font-serif font-black tracking-tight select-none">W</span>
                  <span className="text-[6.5px] font-mono leading-none tracking-widest font-black select-none mt-0.5">CMS</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* SLIDING BRAND NAME EDITING SUB-DRAWER COLUMN */}
      <AnimatePresence>
        {isBrandEditorOpen && isAdminLoggedIn && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 md:right-28 top-0 bottom-0 w-full md:w-80 bg-stone-50 border-l-2 border-black z-50 flex flex-col p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-black pb-3 mb-6 font-mono text-xs font-black select-none">
              <span className="flex items-center gap-1">✏️ {lang === 'en' ? 'SIDEBAR NAME CUSTOMIZER' : '左固定栏品牌定制子栏'}</span>
              <button 
                onClick={() => setIsBrandEditorOpen(false)}
                className="px-1.5 py-0.5 border border-black bg-black text-white hover:bg-neutral-800 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-5 font-mono text-xs overflow-y-auto pr-1">
              <div>
                <label className="text-neutral-500 text-[10px] uppercase font-bold block mb-1.5 select-none">
                  {lang === 'en' ? 'Sidebar Display Name' : '展示名称 (WENDY LU 字样)'}
                </label>
                <input
                  type="text"
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  placeholder="e.g. Wendy LU"
                  className="w-full border border-black p-2 bg-white font-bold uppercase text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-3 border-t border-dashed border-neutral-300">
                <label className="text-neutral-500 text-[10px] uppercase font-bold block mb-1.5 select-none">
                  {lang === 'en' ? 'Avatar Hover Subtitle (Left)' : '头像悬浮卡片副标 (左)'}
                </label>
                <input
                  type="text"
                  value={hoverLeftInput}
                  onChange={(e) => setHoverLeftInput(e.target.value)}
                  placeholder="e.g. W. LU AVATAR"
                  className="w-full border border-black p-2 bg-white text-xs text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-neutral-500 text-[10px] uppercase font-bold block mb-1.5 select-none">
                  {lang === 'en' ? 'Avatar Hover Coordinates (Right)' : '头像悬浮卡片坐标 (右)'}
                </label>
                <input
                  type="text"
                  value={hoverRightInput}
                  onChange={(e) => setHoverRightInput(e.target.value)}
                  placeholder="e.g. COORD // GZ"
                  className="w-full border border-black p-2 bg-white text-xs text-black outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    localStorage.setItem('brand_name', brandNameInput.toUpperCase() || 'WENDY LU');
                    localStorage.setItem('logo_avatar_hover_left', hoverLeftInput || 'W. LU AVATAR');
                    localStorage.setItem('logo_avatar_hover_right', hoverRightInput || 'COORD // GZ');
                    window.dispatchEvent(new Event('avatar-updated'));
                    setIsBrandEditorOpen(false);
                  }}
                  className="w-full py-2.5 bg-black text-white hover:bg-neutral-850 border border-black font-extrabold uppercase text-center transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                >
                  {lang === 'en' ? '✔ APPLY CHANGE' : '✔ 确认应用修改'}
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 pt-4 leading-relaxed select-none space-y-2">
                <p>
                  {lang === 'en' 
                    ? 'This dynamic drawer panel opens as a supplementary sub-bar to support bespoke typography configs.' 
                    : '本定制子树作为全局架构的辅助控制轨，点按应用后，相应的数据指令将通过消息总线广播，实时同步至左侧极简人文构架中。'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK FLOATING MODAL FORM OVERLAYS FOR THE CREATOR */}
      {isAdminLoggedIn && activeQuickForm && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white border-2 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded">
            <div className="flex justify-between items-center border-b border-black pb-2">
              <h2 className="font-serif text-lg font-black uppercase text-black">
                ✨ Quick Create: {activeQuickForm.toUpperCase()}
              </h2>
              <button
                onClick={() => { setActiveQuickForm(null); }}
                className="font-mono text-[9px] uppercase font-bold border border-black bg-black text-white px-2 py-1 hover:bg-neutral-800"
              >
                [CANCEL]
              </button>
            </div>

            {/* QUICK FORM: PROJECT */}
            {activeQuickForm === 'project' && (
              <form onSubmit={handleDirectAddProject} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Project Work Title</label>
                  <input
                    required
                    type="text"
                    value={addProjTitle}
                    onChange={(e) => setAddProjTitle(e.target.value)}
                    placeholder="e.g. Traditional Food Mapping Zine"
                    className="w-full border border-black p-2 bg-neutral-50 focus:bg-white text-xs text-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Date Tag</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 2024-06"
                      value={addProjDate}
                      onChange={(e) => setAddProjDate(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Category</label>
                    <select
                      value={addProjCategory}
                      onChange={(e: any) => setAddProjCategory(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-9 text-[11px] text-black"
                    >
                      <option value="Storytelling">Storytelling (文稿与策划)</option>
                      <option value="Campaigns">Campaigns (活动与快闪运作)</option>
                      <option value="Design & Creation">Design & Creation (排印构成设计)</option>
                      <option value="Growth & Community">Growth & Community (成长机制运营)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Client / Partner</label>
                    <input
                      type="text"
                      placeholder="e.g. Guangzhou Press"
                      value={addProjClient}
                      onChange={(e) => setAddProjClient(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Your Creative Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Planner"
                      value={addProjRole}
                      onChange={(e) => setAddProjRole(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Cover Image Source URL</label>
                  <input
                    type="text"
                    value={addProjImg}
                    onChange={(e) => setAddProjImg(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Comma-separated Tags</label>
                  <input
                    type="text"
                    value={addProjTags}
                    onChange={(e) => setAddProjTags(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Brief Description Narrative</label>
                  <textarea
                    rows={3}
                    placeholder="Details about spatial planning, grid compositing, community value..."
                    value={addProjDesc}
                    onChange={(e) => setAddProjDesc(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase cursor-pointer"
                  >
                    Publish Portfolio Listing
                  </button>
                </div>
              </form>
            )}

            {/* QUICK FORM: WECHAT NOTE */}
            {activeQuickForm === 'note' && (
              <form onSubmit={handleDirectAddNote} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Document Title</label>
                  <input
                    required
                    type="text"
                    value={addNoteTitle}
                    onChange={(e) => setAddNoteTitle(e.target.value)}
                    placeholder="e.g. 恩宁路微改造人本故事"
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Brief Summary Description</label>
                  <textarea
                    rows={2}
                    required
                    value={addNoteSummary}
                    onChange={(e) => setAddNoteSummary(e.target.value)}
                    placeholder="How community shared memory behaves under historical lane revivals..."
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">WeChat / Official Story URL Link</label>
                  <input
                    required
                    type="url"
                    value={addNoteUrl}
                    onChange={(e) => setAddNoteUrl(e.target.value)}
                    placeholder="https://mp.weixin.qq.com/..."
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Reading Estimate</label>
                    <input
                      type="text"
                      value={addNoteReadTime}
                      onChange={(e) => setAddNoteReadTime(e.target.value)}
                      placeholder="e.g. 5 min read"
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Comma-split tags</label>
                    <input
                      type="text"
                      placeholder="e.g. 恩宁路, 城市微更新"
                      value={addNoteTags}
                      onChange={(e) => setAddNoteTags(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase cursor-pointer"
                  >
                    Publish Document Log in Notes
                  </button>
                </div>
              </form>
            )}

            {/* QUICK FORM: LIBRARY REVIEW */}
            {activeQuickForm === 'library' && (
              <form onSubmit={handleDirectAddLibrary} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Medium Title</label>
                  <input
                    required
                    type="text"
                    value={addLibTitle}
                    onChange={(e) => setAddLibTitle(e.target.value)}
                    placeholder="e.g. Designing Programmatic Aesthetics"
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Creator / Director / Author</label>
                  <input
                    required
                    type="text"
                    value={addLibCreator}
                    onChange={(e) => setAddLibCreator(e.target.value)}
                    placeholder="e.g. Massimo Vignelli"
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Type Focus</label>
                    <select
                      value={addLibType}
                      onChange={(e: any) => setAddLibType(e.target.value)}
                      className="w-full border border-black p-1 focus:bg-white h-9 text-[11px] text-black"
                    >
                      <option value="book">Book (书籍)</option>
                      <option value="movie">Movie (电影)</option>
                      <option value="music">Music (声频)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Study Status</label>
                    <select
                      value={addLibStatus}
                      onChange={(e: any) => setAddLibStatus(e.target.value)}
                      className="w-full border border-black p-1 focus:bg-white h-9 text-[11px] text-black font-mono"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">Reading / Watching</option>
                      <option value="Wishlist">Wishlist Plan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Your Rating</label>
                    <select
                      value={addLibRating}
                      onChange={(e) => setAddLibRating(Number(e.target.value))}
                      className="w-full border border-black p-1 focus:bg-white h-9 text-[11px] text-black font-mono"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5.0)</option>
                      <option value={4}>⭐⭐⭐⭐ (4.0)</option>
                      <option value={3}>⭐⭐⭐ (3.0)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Quick Mini Critical Review statement</label>
                  <textarea
                    rows={3}
                    placeholder="Fav quotes or brief spatial-cultural review notes..."
                    value={addLibNote}
                    onChange={(e) => setAddLibNote(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase"
                  >
                    Publish Library Item Log
                  </button>
                </div>
              </form>
            )}

            {/* QUICK FORM: TIMELINE MILESTONE (ADD AND EDIT) */}
            {activeQuickForm === 'timeline' && (
              <form onSubmit={handleSaveTimelineForm} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Year (e.g. 2026)</label>
                    <input
                      required
                      type="text"
                      value={timeYear}
                      onChange={(e) => setTimeYear(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Step Number Label</label>
                    <input
                      required
                      type="text"
                      value={timeStepNum}
                      onChange={(e) => setTimeStepNum(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-dashed border-neutral-150 pt-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Phase Definition (English)</label>
                    <input
                      required
                      placeholder="e.g. Foundational Typo"
                      type="text"
                      value={timePhaseEn}
                      onChange={(e) => setTimePhaseEn(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">阶段说明 (中文中文)</label>
                    <input
                      required
                      placeholder="例如：视觉秩序与网格编排"
                      type="text"
                      value={timePhaseZh}
                      onChange={(e) => setTimePhaseZh(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-dashed border-neutral-150 pt-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Vertical Category Badge (EN)</label>
                    <input
                      required
                      placeholder="e.g. Visual Design"
                      type="text"
                      value={timeCategoryEn}
                      onChange={(e) => setTimeCategoryEn(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">主分类徽章 (中文)</label>
                    <input
                      required
                      placeholder="例如：非虚构纪实"
                      type="text"
                      value={timeCategoryZh}
                      onChange={(e) => setTimeCategoryZh(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-dashed border-neutral-150 pt-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">High-impact main Title (EN)</label>
                    <input
                      required
                      placeholder="e.g. Design & Grid Formulation"
                      type="text"
                      value={timeTitleEn}
                      onChange={(e) => setTimeTitleEn(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">主标题文本 (中文)</label>
                    <input
                      required
                      placeholder="例如：恩宁路手作艺人口述史普查"
                      type="text"
                      value={timeTitleZh}
                      onChange={(e) => setTimeTitleZh(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-dashed border-neutral-150 pt-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Institution Label (EN)</label>
                    <input
                      placeholder="e.g. Studio Morph Co."
                      type="text"
                      value={timeSubtitleEn}
                      onChange={(e) => setTimeSubtitleEn(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">机构背景说明 (中文)</label>
                    <input
                      placeholder="例如：广州本土风物志特约撰稿"
                      type="text"
                      value={timeSubtitleZh}
                      onChange={(e) => setTimeSubtitleZh(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-150 pt-2">
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Description Narrative (EN)</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Conducted extensive studies on traditional neighborhoods..."
                    value={timeDescEn}
                    onChange={(e) => setTimeDescEn(e.target.value)}
                    className="w-full border border-black p-1.5 focus:bg-white text-[11px] text-black leading-relaxed"
                  />
                </div>

                <div className="border-t border-dashed border-neutral-150 pt-2">
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">事纪详情叙事 (中文)</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="对濒危草根手艺人、非物质文化印记进行抢救性质朴文字收录记录..."
                    value={timeDescZh}
                    onChange={(e) => setTimeDescZh(e.target.value)}
                    className="w-full border border-black p-1.5 focus:bg-white text-[11px] text-black leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-dashed border-neutral-150 pt-2">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Tags (Comma-split, EN)</label>
                    <input
                      placeholder="Layout, Typography"
                      type="text"
                      value={timeTagsEn}
                      onChange={(e) => setTimeTagsEn(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">标签分类 (逗号分隔, 中文)</label>
                    <input
                      placeholder="口述史, 田野走访"
                      type="text"
                      value={timeTagsZh}
                      onChange={(e) => setTimeTagsZh(e.target.value)}
                      className="w-full border border-black p-1.5 focus:bg-white h-8 text-[11px] text-black"
                    />
                  </div>
                </div>

                {/* Status Toggles and Boolean Settings */}
                <div className="grid grid-cols-2 gap-2 border-y border-dashed border-neutral-200 py-3">
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">CMS Status</label>
                    <select
                      value={timeCmsStatus}
                      onChange={(e: any) => setTimeCmsStatus(e.target.value)}
                      className="w-full border border-black p-1 h-8 text-[11px] text-black"
                    >
                      <option value="Published">🌍 Published (正式发布)</option>
                      <option value="Draft">📝 Draft (设为草稿)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Visibility</label>
                    <select
                      value={timeVisibility}
                      onChange={(e: any) => setTimeVisibility(e.target.value)}
                      className="w-full border border-black p-1 h-8 text-[11px] text-black"
                    >
                      <option value="Public">🌍 Public (所有人可见)</option>
                      <option value="Private">🔒 Private (仅作者查看)</option>
                    </select>
                  </div>
                </div>

                <div className="py-1">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timePinned}
                      onChange={(e) => setTimePinned(e.target.checked)}
                      className="w-4 h-4 checked:bg-black uppercase border border-black accent-black rounded-none"
                    />
                    <span>📌 Pin to Homepage timeline sequence</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase cursor-pointer"
                  >
                    {editingTimelineItem ? 'Update Milestone' : 'Compile & Save Milestone Event'}
                  </button>
                </div>
              </form>
            )}

            {/* QUICK FORM: PROFILE COPY */}
            {activeQuickForm === 'profile' && (
              <form onSubmit={handleSaveProfileConfigs} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">About Section EN Title</label>
                  <input
                    required
                    type="text"
                    value={profileTitleEn}
                    onChange={(e) => setProfileTitleEn(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">关于板块中文标题</label>
                  <input
                    required
                    type="text"
                    value={profileTitleZh}
                    onChange={(e) => setProfileTitleZh(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Subtitle / Slogan description EN</label>
                  <input
                    required
                    type="text"
                    value={profileSubEn}
                    onChange={(e) => setProfileSubEn(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">副标题/一句话自我评述 中文</label>
                  <input
                    required
                    type="text"
                    value={profileSubZh}
                    onChange={(e) => setProfileSubZh(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Main Practitioner Biography (English)</label>
                  <textarea
                    rows={4}
                    value={profileBioEn}
                    onChange={(e) => setProfileBioEn(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs leading-relaxed text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">修辞叙事主要传记 (中文)</label>
                  <textarea
                    rows={4}
                    value={profileBioZh}
                    onChange={(e) => setProfileBioZh(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs leading-relaxed text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Secondary Paragraph (English)</label>
                  <textarea
                    rows={3}
                    value={profileSecondEn}
                    onChange={(e) => setProfileSecondEn(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs leading-relaxed text-black"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">次要补充详情段落 (中文)</label>
                  <textarea
                    rows={3}
                    value={profileSecondZh}
                    onChange={(e) => setProfileSecondZh(e.target.value)}
                    className="w-full border border-black p-2 bg-neutral-50 text-xs leading-relaxed text-black"
                  />
                </div>

                <div className="border-t border-dashed border-neutral-300 pt-3 space-y-3">
                  <h4 className="font-mono text-xs font-bold text-black uppercase">Contact Links & Channels</h4>
                  
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Contact Email Address</label>
                    <input
                      required
                      type="email"
                      value={contactChannelEmail}
                      onChange={(e) => setContactChannelEmail(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">LinkedIn Profile link slug</label>
                    <input
                      required
                      type="text"
                      value={contactChannelLinkedin}
                      onChange={(e) => setContactChannelLinkedin(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Contact Phone Number</label>
                    <input
                      required
                      type="text"
                      value={contactChannelPhone}
                      onChange={(e) => setContactChannelPhone(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs text-black"
                    />
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-300 pt-3 space-y-3">
                  <h4 className="font-mono text-xs font-bold text-black uppercase">Homepage Slogans & Taglines</h4>
                  
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Top Highlight Tag (EN / ZH)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        placeholder="CREATIVITY & STRATEGIC INSIGHTS"
                        type="text"
                        value={brandHeroSubEn}
                        onChange={(e) => setBrandHeroSubEn(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                      <input
                        placeholder="创造力、行动策展与高能战略主理"
                        type="text"
                        value={brandHeroSubZh}
                        onChange={(e) => setBrandHeroSubZh(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Subtitle / Zine Theme (EN / ZH)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        placeholder="Personal Digital Space & Media Zine"
                        type="text"
                        value={brandIntroEn}
                        onChange={(e) => setBrandIntroEn(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                      <input
                        placeholder="个人数字空间 · 青年文创活动档案馆"
                        type="text"
                        value={brandIntroZh}
                        onChange={(e) => setBrandIntroZh(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Headline Slogan Segment 1 (EN / ZH)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        placeholder="And the"
                        type="text"
                        value={brandTitle1En}
                        onChange={(e) => setBrandTitle1En(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                      <input
                        placeholder="而属于本地的"
                        type="text"
                        value={brandTitle1Zh}
                        onChange={(e) => setBrandTitle1Zh(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Headline Slogan Segment 2 (EN / ZH - Italicized)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        placeholder="stories"
                        type="text"
                        value={brandTitle2En}
                        onChange={(e) => setBrandTitle2En(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                      <input
                        placeholder="广州故事"
                        type="text"
                        value={brandTitle2Zh}
                        onChange={(e) => setBrandTitle2Zh(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Headline Slogan Segment 3 (EN / ZH)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        placeholder="go on."
                        type="text"
                        value={brandTitle3En}
                        onChange={(e) => setBrandTitle3En(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                      <input
                        placeholder="仍在续写。"
                        type="text"
                        value={brandTitle3Zh}
                        onChange={(e) => setBrandTitle3Zh(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-300 pt-3 space-y-3">
                  <h4 className="font-mono text-xs font-bold text-black uppercase">Timeline Journey Headers</h4>
                  
                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Timeline Journey Section Title (EN / ZH)</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        placeholder="Wendy LU's Journey"
                        type="text"
                        value={timelineTitleEn}
                        onChange={(e) => setTimelineTitleEn(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                      <input
                        placeholder="陆芸的创作与生命行进年轮"
                        type="text"
                        value={timelineTitleZh}
                        onChange={(e) => setTimelineTitleZh(e.target.value)}
                        className="border border-black p-2 text-xs bg-neutral-50 text-black w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Timeline Journey Intro Paragraph (English)</label>
                    <textarea
                      rows={3}
                      value={timelineIntroEn}
                      onChange={(e) => setTimelineIntroEn(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs leading-relaxed text-black"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Timeline Journey Intro Paragraph (中文)</label>
                    <textarea
                      rows={3}
                      value={timelineIntroZh}
                      onChange={(e) => setTimelineIntroZh(e.target.value)}
                      className="w-full border border-black p-2 bg-neutral-50 text-xs leading-relaxed text-black"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase"
                  >
                    Publish Profile texts configuration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Task 8: Guest floating scroll-to-top bubble */}
      <button
        onClick={() => {
          const container = document.getElementById('primary-content-viewport') || window;
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="fixed bottom-6 left-6 md:bottom-8 md:left-32 z-55 w-12 h-12 rounded-full border border-black bg-white hover:bg-black hover:text-white text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center font-mono leading-none group"
        title={lang === 'en' ? 'Scroll to Top' : '返回顶部'}
      >
        <span className="text-sm font-bold group-hover:-translate-y-0.5 transition-transform">↑</span>
        <span className="text-[7.5px] font-black tracking-wider uppercase mt-0.5">TOP</span>
      </button>

    </div>
  );
}
