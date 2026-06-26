/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WorkCategory = 'All' | 'Storytelling' | 'Campaigns' | 'Design & Creation' | 'Growth & Community' | 'About';

export type CMSStatus = 'Published' | 'Draft' | 'Archived';
export type CMSVisibility = 'Public' | 'Private';

export interface Project {
  id: string;
  title: string;
  title_zh?: string; // bilingual support
  category: WorkCategory;
  client?: string;
  client_zh?: string; // bilingual support
  date: string;
  description: string;
  description_zh?: string; // bilingual support
  details: string[]; // Key achievements or steps
  details_zh?: string[]; // bilingual support
  imageUrl: string;
  tags: string[];
  externalUrl?: string;
  role?: string;
  role_zh?: string; // bilingual support
  featured?: boolean;
  status?: CMSStatus;
  status_cms?: CMSStatus;
  visibility?: CMSVisibility;
  pinned?: boolean;
  videoUrl?: string; // video uploads or URLs
  gallery?: string[]; // multiple images upload
}

export interface Note {
  id: string;
  title: string;
  title_zh?: string; // bilingual support
  summary: string;
  summary_zh?: string; // bilingual support
  publishDate: string;
  date_published?: string;
  readTime: string;
  url: string; // Original URL
  insights?: string[]; // Key learnings or focus bullet points
  insights_zh?: string[]; // bilingual support
  tags: string[];
  status?: CMSStatus;
  status_cms?: CMSStatus;
  visibility?: CMSVisibility;
  pinned?: boolean;
  featured?: boolean;
}

export interface LibraryItem {
  id: string;
  type: 'book' | 'movie' | 'music';
  title: string;
  title_zh?: string; // bilingual support
  creator: string; // Author, Director, or Artist
  creator_zh?: string; // bilingual support
  status: 'In Progress' | 'Completed' | 'Wishlist';
  rating: number; // 1-5 stars
  date: string; // When read/watched
  note?: string; // Insights / personal review
  note_zh?: string; // bilingual support
  coverColor?: string; // Styled editorial cover background
  coverImage?: string; // Base64 or image URL
  status_cms?: CMSStatus; // supporting CMS drafts
  visibility?: CMSVisibility;
  pinned?: boolean;
  featured?: boolean;
}

export interface TimelineEntry {
  id: string;
  year: string;
  phaseLabel: string;
  phaseLabelZh?: string;
  categoryLabel: string;
  categoryLabelZh?: string;
  stageTitle: string;
  stageTitleZh?: string;
  subtitle: string;
  subtitleZh?: string;
  description: string;
  descriptionZh?: string;
  tags: string[];
  tagsZh?: string[];
  status?: CMSStatus;
  visibility?: CMSVisibility;
  pinned?: boolean;
  stepNum?: string;

  // Backports for robust multi-key bindings
  phase_en?: string;
  phase_zh?: string;
  category_en?: string;
  category_zh?: string;
  title_en?: string;
  title_zh?: string;
  subtitle_en?: string;
  subtitle_zh?: string;
  description_en?: string;
  description_zh?: string;
  tags_en?: string[];
  tags_zh?: string[];
  status_cms?: CMSStatus;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string; // Audio source (we can generate Web Audio synth nodes to play real audio or standard creative-common tracks)
  duration: string;
}

