/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Project, WorkCategory, CMSStatus, CMSVisibility } from '../types';
import { ArrowUpRight, Search, FileText, Calendar, ShieldAlert, Edit, Trash2, Plus, Check, EyeOff, Pin, Upload, Video, Play, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { UI_TRANSLATIONS } from '../utils/translations';
import { motion, AnimatePresence } from 'motion/react';

interface WorksSectionProps {
  projects: Project[];
  lang?: 'en' | 'zh';
  isAdminLoggedIn?: boolean;
  onSaveProjects?: (projects: Project[]) => void;
}

export default function WorksSection({ projects, lang = 'en', isAdminLoggedIn = false, onSaveProjects }: WorksSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Works About page custom editable contents
  const [isEditingAboutBlock, setIsEditingAboutBlock] = useState(false);
  const [worksAboutTitleEn, setWorksAboutTitleEn] = useState(() => localStorage.getItem('works_about_title_en') || 'The Practitioner Methodology');
  const [worksAboutTitleZh, setWorksAboutTitleZh] = useState(() => localStorage.getItem('works_about_title_zh') || '媒介策展与叙事工程实践方法论');
  const [worksAboutDescEn, setWorksAboutDescEn] = useState(() => localStorage.getItem('works_about_desc_en') || 'Synthesizing historical urban reporting, robust layout frameworks, community dialogue, and Web Audio synthesizers to preserve memory.');
  const [worksAboutDescZh, setWorksAboutDescZh] = useState(() => localStorage.getItem('works_about_desc_zh') || '将城市田野调查、冷色严苛现代版面、社区在地协作工作坊与声频数字媒介相结合，筑造富有温度的历史档案馆与体验场域。');
  const [worksAboutAestheticEn, setWorksAboutAestheticEn] = useState(() => localStorage.getItem('works_about_aes_en') || 'Aesthetic Guidelines');
  const [worksAboutAestheticZh, setWorksAboutAestheticZh] = useState(() => localStorage.getItem('works_about_aes_zh') || '极简视觉与几何哲学');
  const [worksAboutAestheticDescEn, setWorksAboutAestheticDescEn] = useState(() => localStorage.getItem('works_about_aes_desc_en') || 'Swiss typographic discipline paired with modular grid partitions.');
  const [worksAboutAestheticDescZh, setWorksAboutAestheticDescZh] = useState(() => localStorage.getItem('works_about_aes_desc_zh') || '瑞士学术社论排版，配合多维模块分区与冷峻黑白艺术表达。');
  const [worksAboutToolkitEn, setWorksAboutToolkitEn] = useState(() => localStorage.getItem('works_about_tool_en') || 'Technical Toolkit');
  const [worksAboutToolkitZh, setWorksAboutToolkitZh] = useState(() => localStorage.getItem('works_about_tool_zh') || '实战兵器与媒介技术');
  const [worksAboutToolkitDescEn, setWorksAboutToolkitDescEn] = useState(() => localStorage.getItem('works_about_tool_desc_en') || 'React 18, Vite Engine, Tailwind structural tokens, Web Audio procedural synthetics, and D3 analytics systems.');
  const [worksAboutToolkitDescZh, setWorksAboutToolkitDescZh] = useState(() => localStorage.getItem('works_about_tool_desc_zh') || 'React 18、Vite极速热构建、Tailwind多级语汇、Web Audio声能合成、以及D3可视化地图交互。');

  // Lightbox index for improved multi-image viewing Experience
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);

  // Editor states
  const [editingProj, setEditingProj] = useState<Project | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states (English)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<WorkCategory>('Storytelling');
  const [formClient, setFormClient] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImgUrl, setFormImgUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formStatus, setFormStatus] = useState<CMSStatus>('Published');
  const [formVisibility, setFormVisibility] = useState<CMSVisibility>('Public');
  const [formPinned, setFormPinned] = useState(false);

  // Form states (Chinese Bilingual properties)
  const [formTitleZh, setFormTitleZh] = useState('');
  const [formClientZh, setFormClientZh] = useState('');
  const [formRoleZh, setFormRoleZh] = useState('');
  const [formDescZh, setFormDescZh] = useState('');
  const [formDetailsZh, setFormDetailsZh] = useState('');

  // Form multimedia uploads
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formGallery, setFormGallery] = useState<string[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Reusable custom visual cropper states for works and gallery
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropX, setCropX] = useState<number>(10);
  const [cropY, setCropY] = useState<number>(10);
  const [cropW, setCropW] = useState<number>(80);
  const [cropH, setCropH] = useState<number>(45);
  const [cropAspect, setCropAspect] = useState<'free' | '16:9' | '4:3' | '1:1'>('16:9');
  const [onCropComplete, setOnCropComplete] = useState<((cropped: string) => void) | null>(null);

  // Drag states for interactive cropper dragging
  const [dragMode, setDragMode] = useState<{
    type: 'move' | 'resize' | 'draw';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
    edges?: { left: boolean; right: boolean; top: boolean; bottom: boolean };
  } | null>(null);

  const handleCropperPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    const thresholdPercent = 6;
    const isNearLeft = Math.abs(xPercent - cropX) < thresholdPercent;
    const isNearRight = Math.abs(xPercent - (cropX + cropW)) < thresholdPercent;
    const isNearTop = Math.abs(yPercent - cropY) < thresholdPercent;
    const isNearBottom = Math.abs(yPercent - (cropY + cropH)) < thresholdPercent;

    const isInside = xPercent >= cropX && xPercent <= cropX + cropW &&
                     yPercent >= cropY && yPercent <= cropY + cropH;

    e.currentTarget.setPointerCapture(e.pointerId);

    if (isNearLeft || isNearRight || isNearTop || isNearBottom) {
      setDragMode({
        type: 'resize',
        startX: xPercent,
        startY: yPercent,
        initialX: cropX,
        initialY: cropY,
        initialW: cropW,
        initialH: cropH,
        edges: { left: isNearLeft, right: isNearRight, top: isNearTop, bottom: isNearBottom }
      });
    } else if (isInside) {
      setDragMode({
        type: 'move',
        startX: xPercent,
        startY: yPercent,
        initialX: cropX,
        initialY: cropY,
        initialW: cropW,
        initialH: cropH
      });
    } else {
      setDragMode({
        type: 'draw',
        startX: xPercent,
        startY: yPercent,
        initialX: xPercent,
        initialY: yPercent,
        initialW: 0,
        initialH: 0
      });
    }
  };

  const handleCropperPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const dx = xPercent - dragMode.startX;
    const dy = yPercent - dragMode.startY;

    if (dragMode.type === 'move') {
      const nextX = Math.max(0, Math.min(100 - dragMode.initialW, dragMode.initialX + dx));
      const nextY = Math.max(0, Math.min(100 - dragMode.initialH, dragMode.initialY + dy));
      adjustCropBox(nextX, nextY, dragMode.initialW, dragMode.initialH, cropAspect);
    } else if (dragMode.type === 'resize' && dragMode.edges) {
      let nextX = dragMode.initialX;
      let nextY = dragMode.initialY;
      let nextW = dragMode.initialW;
      let nextH = dragMode.initialH;

      if (dragMode.edges.left) {
        const proposedX = Math.max(0, dragMode.initialX + dx);
        nextW = Math.max(8, dragMode.initialX + dragMode.initialW - proposedX);
        nextX = dragMode.initialX + dragMode.initialW - nextW;
      } else if (dragMode.edges.right) {
        nextW = Math.max(8, Math.min(100 - dragMode.initialX, dragMode.initialW + dx));
      }

      if (dragMode.edges.top) {
        const proposedY = Math.max(0, dragMode.initialY + dy);
        nextH = Math.max(8, dragMode.initialY + dragMode.initialH - proposedY);
        nextY = dragMode.initialY + dragMode.initialH - nextH;
      } else if (dragMode.edges.bottom) {
        nextH = Math.max(8, Math.min(100 - dragMode.initialY, dragMode.initialH + dy));
      }

      adjustCropBox(nextX, nextY, nextW, nextH, cropAspect);
    } else if (dragMode.type === 'draw') {
      const startPointX = dragMode.startX;
      const startPointY = dragMode.startY;

      let nextX = Math.min(startPointX, xPercent);
      let nextY = Math.min(startPointY, yPercent);
      let nextW = Math.max(5, Math.abs(xPercent - startPointX));
      let nextH = Math.max(5, Math.abs(yPercent - startPointY));

      adjustCropBox(nextX, nextY, nextW, nextH, cropAspect);
    }
  };

  const handleCropperPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragMode) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragMode(null);
  };

  const initiateCropper = (file: File, callback: (cropped: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setImageToCrop(base64);
        setCropX(10);
        setCropY(10);
        setCropW(80);
        setCropH(45); // close to 16:9
        setCropAspect('16:9');
        setOnCropComplete(() => callback);
      }
    };
    reader.readAsDataURL(file);
  };

  const adjustCropBox = (x: number, y: number, w: number, h: number, aspect: string) => {
    let nextW = w;
    let nextH = h;
    if (aspect === '3:4') {
      nextH = Math.min(100 - y, (w * 4) / 3);
      if (y + nextH > 100) {
        nextH = 100 - y;
        nextW = (nextH * 3) / 4;
      }
    } else if (aspect === '16:9') {
      nextH = Math.min(100 - y, (w * 9) / 16);
      if (y + nextH > 100) {
        nextH = 100 - y;
        nextW = (nextH * 16) / 9;
      }
    } else if (aspect === '4:3') {
      nextH = Math.min(100 - y, (w * 3) / 4);
      if (y + nextH > 100) {
        nextH = 100 - y;
        nextW = (nextH * 4) / 3;
      }
    } else if (aspect === '1:1') {
      nextH = Math.min(100 - y, w);
      if (y + nextH > 100) {
        nextH = 100 - y;
        nextW = nextH;
      }
    }
    setCropX(Math.max(0, Math.min(100 - nextW, x)));
    setCropY(Math.max(0, Math.min(100 - nextH, y)));
    setCropW(nextW);
    setCropH(nextH);
  };

  const executeCrop = () => {
    if (!imageToCrop) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sX = img.naturalWidth * (cropX / 100);
      const sY = img.naturalHeight * (cropY / 100);
      const sW = img.naturalWidth * (cropW / 100);
      const sH = img.naturalHeight * (cropH / 100);

      canvas.width = 800;
      canvas.height = (sH / sW) * 800;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL('image/jpeg', 0.88);
      if (onCropComplete) {
        onCropComplete(base64);
      }
      setImageToCrop(null);
    };
    img.src = imageToCrop;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGalleryIndex !== null && activeProject?.gallery) {
        if (e.key === 'ArrowLeft') {
          setActiveGalleryIndex(prev => prev! > 0 ? prev! - 1 : activeProject.gallery!.length - 1);
        } else if (e.key === 'ArrowRight') {
          setActiveGalleryIndex(prev => prev! < activeProject.gallery!.length - 1 ? prev! + 1 : 0);
        } else if (e.key === 'Escape') {
          setActiveGalleryIndex(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGalleryIndex, activeProject]);

  const categories: WorkCategory[] = ['All', 'Storytelling', 'Campaigns', 'Design & Creation', 'Growth & Community', 'About'];

  const categoryLabels: Record<string, string> = {
    'All': lang === 'en' ? 'ALL' : '全部作品',
    'Storytelling': lang === 'en' ? 'Storytelling' : '故事叙事',
    'Campaigns': lang === 'en' ? 'Campaigns' : '社会策展',
    'Design & Creation': lang === 'en' ? 'Design & Creation' : '设计与创作',
    'Growth & Community': lang === 'en' ? 'Growth & Community' : '成长与社群',
    'About': lang === 'en' ? 'About' : '关于自述'
  };

  // Filter based on roles, search, and login status (hide drafts/private from guests)
  const filteredProjects = projects.filter(proj => {
    const matchesCategory = selectedCategory === 'All' ? true : proj.category === selectedCategory;
    const matchesSearch = proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proj.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (proj.description && proj.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (isAdminLoggedIn) {
      return matchesCategory && matchesSearch;
    } else {
      const isDraftStatus = proj.status === 'Draft' || proj.status === 'Archived';
      const isPrivateStatus = proj.visibility === 'Private';
      return matchesCategory && matchesSearch && !isDraftStatus && !isPrivateStatus;
    }
  }).sort((a, b) => {
    const pinA = a.pinned ? 1 : 0;
    const pinB = b.pinned ? 1 : 0;
    return pinB - pinA; // priorize pinned items at the very beginning
  });

  const t = UI_TRANSLATIONS[lang];

  // Helper function to compress and crop to 16:9 standard aspect ratio
  const compressAndCropImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsProcessingFile(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            setIsProcessingFile(false);
            return;
          }
          
          // Set standard crop constraints (e.g. 960 x 540 for 16:9 HD ratio)
          const targetWidth = 960;
          const targetHeight = 540;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          const imgRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;
          
          let sx = 0;
          let sy = 0;
          let sWidth = img.width;
          let sHeight = img.height;
          
          if (imgRatio > targetRatio) {
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
          } else if (imgRatio < targetRatio) {
            sHeight = img.width / targetRatio;
            sy = (img.height - sHeight) / 2;
          }
          
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
          const compressed = canvas.toDataURL('image/jpeg', 0.82); // High resolution with excellent footprint
          resolve(compressed);
          setIsProcessingFile(false);
        };
        img.onerror = () => {
          reject(new Error('Invalid image'));
          setIsProcessingFile(false);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Reader error'));
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper handling file selection for cover
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      initiateCropper(file, (cropped) => {
        setFormImgUrl(cropped);
      });
    }
  };

  // Helper handling file drop for cover
  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      initiateCropper(file, (cropped) => {
        setFormImgUrl(cropped);
      });
    }
  };

  // Gallery multi-images uploader
  const handleGalleryFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files) as File[];
      const processSequence = (index: number) => {
        if (index >= fileList.length) return;
        const currentFile = fileList[index];
        initiateCropper(currentFile, (cropped) => {
          setFormGallery(prev => [...prev, cropped]);
          processSequence(index + 1);
        });
      };
      processSequence(0);
    }
  };

  // Local small video uploader (converts minor MP4 into base64, otherwise allows direct URL)
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert(lang === 'en' ? '⚠️ Local video uploads are limited to 15MB for client-side operations. Please enter a direct URL instead.' : '⚠️ 本地视频持久化限制在15MB以内。更大型号建议直接填入视频网络URL地址。');
        return;
      }
      setIsProcessingFile(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormVideoUrl(event.target?.result as string);
        setIsProcessingFile(false);
      };
      reader.onerror = () => {
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open editor helper
  const handleOpenEdit = (e: React.MouseEvent, proj: Project) => {
    e.stopPropagation();
    setEditingProj(proj);
    setIsAddingNew(false);
    setFormTitle(proj.title);
    setFormCategory(proj.category);
    setFormClient(proj.client || '');
    setFormDate(proj.date);
    setFormRole(proj.role || '');
    setFormDesc(proj.description);
    setFormImgUrl(proj.imageUrl);
    setFormTags(proj.tags.join(', '));
    setFormDetails(proj.details.join('\n'));
    setFormStatus(proj.status || 'Published');
    setFormVisibility(proj.visibility || 'Public');
    setFormPinned(proj.pinned || false);

    // Bilingual states loading
    setFormTitleZh(proj.title_zh || '');
    setFormClientZh(proj.client_zh || '');
    setFormRoleZh(proj.role_zh || '');
    setFormDescZh(proj.description_zh || '');
    setFormDetailsZh(proj.details_zh ? proj.details_zh.join('\n') : '');

    // Multimedia loading
    setFormVideoUrl(proj.videoUrl || '');
    setFormGallery(proj.gallery || []);
  };

  const handleOpenAdd = () => {
    setEditingProj(null);
    setIsAddingNew(true);
    setFormTitle('');
    setFormCategory(selectedCategory === 'About' ? 'Storytelling' : selectedCategory);
    setFormClient('');
    setFormDate(new Date().toISOString().split('T')[0].substring(0, 7));
    setFormRole('');
    setFormDesc('');
    setFormImgUrl('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80');
    setFormTags('Campaign, Digital');
    setFormDetails(lang === 'en' ? 'Archived securely.\nIntegrated layout design.' : '项目安全归档。\n自适应布局对齐。');
    setFormStatus('Published');
    setFormVisibility('Public');
    setFormPinned(false);

    // Bilingual defaults
    setFormTitleZh('');
    setFormClientZh('');
    setFormRoleZh('');
    setFormDescZh('');
    setFormDetailsZh('');
    
    // Media defaults
    setFormVideoUrl('');
    setFormGallery([]);
  };

  const handleDeleteProj = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t.confirmDelete)) return;
    if (onSaveProjects) {
      const updated = projects.filter(p => p.id !== id);
      onSaveProjects(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const detailsArr = formDetails.split('\n').map(l => l.trim()).filter(Boolean);
    const detailsZhArr = formDetailsZh.split('\n').map(l => l.trim()).filter(Boolean);
    const tagsArr = formTags.split(',').map(tag => tag.trim()).filter(Boolean);

    if (isAddingNew) {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        title: formTitle,
        title_zh: formTitleZh.trim() || undefined,
        category: formCategory,
        client: formClient || undefined,
        client_zh: formClientZh.trim() || undefined,
        date: formDate,
        role: formRole || undefined,
        role_zh: formRoleZh.trim() || undefined,
        description: formDesc,
        description_zh: formDescZh.trim() || undefined,
        imageUrl: formImgUrl,
        tags: tagsArr,
        details: detailsArr,
        details_zh: detailsZhArr.length > 0 ? detailsZhArr : undefined,
        status: formStatus,
        visibility: formVisibility,
        pinned: formPinned,
        videoUrl: formVideoUrl || undefined,
        gallery: formGallery.length > 0 ? formGallery : undefined
      };
      if (onSaveProjects) {
        onSaveProjects([newProj, ...projects]);
      }
    } else if (editingProj) {
      const updated = projects.map(item => {
        if (item.id === editingProj.id) {
          return {
            ...item,
            title: formTitle,
            title_zh: formTitleZh.trim() || undefined,
            category: formCategory,
            client: formClient || undefined,
            client_zh: formClientZh.trim() || undefined,
            date: formDate,
            role: formRole || undefined,
            role_zh: formRoleZh.trim() || undefined,
            description: formDesc,
            description_zh: formDescZh.trim() || undefined,
            imageUrl: formImgUrl,
            tags: tagsArr,
            details: detailsArr,
            details_zh: detailsZhArr.length > 0 ? detailsZhArr : undefined,
            status: formStatus,
            visibility: formVisibility,
            pinned: formPinned,
            videoUrl: formVideoUrl || undefined,
            gallery: formGallery.length > 0 ? formGallery : undefined
          };
        }
        return item;
      });
      if (onSaveProjects) {
        onSaveProjects(updated);
      }
    }

    setEditingProj(null);
    setIsAddingNew(false);
  };

  return (
    <div id="works-grid-block-wrapper" className="space-y-8">
      {/* Page Header (Editorial Column spacing) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-4 gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-black mb-1">
            {lang === 'en' ? 'Collection Folder //' : '收藏品目录 //'}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 uppercase selection:bg-black selection:text-white font-black">
            {t.worksTitle}
          </h1>
        </div>

        {/* Category Navigation Bar & Add New in Admin Mode */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              id={`category-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              className={`px-3 py-1.5 border border-black transition-all font-semibold uppercase relative cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-black text-white translate-x-[2px] translate-y-[2px] shadow-[0px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}

          {isAdminLoggedIn && (
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1.5 border border-dashed border-black bg-neutral-100 hover:bg-black hover:text-white text-black font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer rounded shadow-sm"
              title="Add New Project"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'ADD PROJECT' : '新增作品'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub category details for 'About' inside Works */}
      {selectedCategory === 'About' && (
        <div className="p-6 bg-white border border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center justify-between border-b border-dashed border-neutral-200 pb-2">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
              <span>FOLDER: Works.About // METHODLOGY_INDEX</span>
            </div>
            {isAdminLoggedIn && (
              <button
                onClick={() => setIsEditingAboutBlock(!isEditingAboutBlock)}
                className="px-2.5 py-1 border border-black hover:bg-black hover:text-white font-mono text-[9px] uppercase cursor-pointer rounded font-black transition-colors"
              >
                {isEditingAboutBlock ? '[CANCEL]' : '[🔧 EDIT ABOUT WORKS]'}
              </button>
            )}
          </div>

          {isEditingAboutBlock ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem('works_about_title_en', worksAboutTitleEn);
              localStorage.setItem('works_about_title_zh', worksAboutTitleZh);
              localStorage.setItem('works_about_desc_en', worksAboutDescEn);
              localStorage.setItem('works_about_desc_zh', worksAboutDescZh);
              localStorage.setItem('works_about_aes_en', worksAboutAestheticEn);
              localStorage.setItem('works_about_aes_zh', worksAboutAestheticZh);
              localStorage.setItem('works_about_aes_desc_en', worksAboutAestheticDescEn);
              localStorage.setItem('works_about_aes_desc_zh', worksAboutAestheticDescZh);
              localStorage.setItem('works_about_tool_en', worksAboutToolkitEn);
              localStorage.setItem('works_about_tool_zh', worksAboutToolkitZh);
              localStorage.setItem('works_about_tool_desc_en', worksAboutToolkitDescEn);
              localStorage.setItem('works_about_tool_desc_zh', worksAboutToolkitDescZh);
              setIsEditingAboutBlock(false);
            }} className="space-y-4 font-mono text-xs pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">About Title (English)</label>
                  <input type="text" value={worksAboutTitleEn} onChange={(e) => setWorksAboutTitleEn(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs" />
                </div>
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">关于自述标题 (中文)</label>
                  <input type="text" value={worksAboutTitleZh} onChange={(e) => setWorksAboutTitleZh(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs font-sans" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Method Description (English)</label>
                  <textarea rows={2.5} value={worksAboutDescEn} onChange={(e) => setWorksAboutDescEn(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs" />
                </div>
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">媒介策展与方法描述 (中文)</label>
                  <textarea rows={2.5} value={worksAboutDescZh} onChange={(e) => setWorksAboutDescZh(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs font-sans" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-dashed border-neutral-200 pt-3">
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Left Card Title (EN)</label>
                  <input type="text" value={worksAboutAestheticEn} onChange={(e) => setWorksAboutAestheticEn(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs" />
                  <label className="text-neutral-400 font-bold block mb-1 mt-2">Left Card Description (EN)</label>
                  <textarea rows={2} value={worksAboutAestheticDescEn} onChange={(e) => setWorksAboutAestheticDescEn(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs" />
                </div>
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">左侧框标题 (中文)</label>
                  <input type="text" value={worksAboutAestheticZh} onChange={(e) => setWorksAboutAestheticZh(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs font-sans" />
                  <label className="text-neutral-400 font-bold block mb-1 mt-2">左侧框描述内容 (中文)</label>
                  <textarea rows={2} value={worksAboutAestheticDescZh} onChange={(e) => setWorksAboutAestheticDescZh(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs font-sans" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-dashed border-neutral-200 pt-3">
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">Right Card Title (EN)</label>
                  <input type="text" value={worksAboutToolkitEn} onChange={(e) => setWorksAboutToolkitEn(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs" />
                  <label className="text-neutral-400 font-bold block mb-1 mt-2">Right Card Description (EN)</label>
                  <textarea rows={2} value={worksAboutToolkitDescEn} onChange={(e) => setWorksAboutToolkitDescEn(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs" />
                </div>
                <div>
                  <label className="text-neutral-400 font-bold block mb-1">右侧框标题 (中文)</label>
                  <input type="text" value={worksAboutToolkitZh} onChange={(e) => setWorksAboutToolkitZh(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs font-sans" />
                  <label className="text-neutral-400 font-bold block mb-1 mt-2">右侧框描述内容 (中文)</label>
                  <textarea rows={2} value={worksAboutToolkitDescZh} onChange={(e) => setWorksAboutToolkitDescZh(e.target.value)} className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-black text-xs font-sans" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white hover:bg-neutral-800 py-2.5 font-bold uppercase cursor-pointer border border-black transition-all flex items-center justify-center gap-1 shadow-sm font-mono text-xs rounded"
              >
                <Check className="w-4 h-4" />
                Save Practice Methodology About Block
              </button>
            </form>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-bold text-black uppercase">{lang === 'en' ? worksAboutTitleEn : worksAboutTitleZh}</h2>
              <p className="font-serif text-neutral-850 leading-relaxed text-sm md:text-base">
                {lang === 'en' ? worksAboutDescEn : worksAboutDescZh}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-4">
                <div className="p-4 bg-neutral-50 border border-black">
                  <span className="font-bold uppercase text-black">{lang === 'en' ? worksAboutAestheticEn : worksAboutAestheticZh}</span>
                  <p className="text-neutral-600 mt-2 leading-relaxed">{lang === 'en' ? worksAboutAestheticDescEn : worksAboutAestheticDescZh}</p>
                </div>
                <div className="p-4 bg-neutral-50 border border-black">
                  <span className="font-bold uppercase text-black">{lang === 'en' ? worksAboutToolkitEn : worksAboutToolkitZh}</span>
                  <p className="text-neutral-600 mt-2 leading-relaxed">{lang === 'en' ? worksAboutToolkitDescEn : worksAboutToolkitDescZh}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Control panel & Searching info */}
      <div className="flex items-center gap-3 border border-black bg-white px-3 py-2 shadow-sm rounded">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder={t.filteringWorks}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent outline-none font-mono text-xs text-black placeholder-neutral-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-neutral-400 hover:text-black font-mono text-xs cursor-pointer"
          >
            {lang === 'en' ? '[CLEAR]' : '[清空检索]'}
          </button>
        )}
      </div>

      {/* Works Showcase Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              id={`project-card-${proj.id}`}
              onClick={() => setActiveProject(proj)}
              className="group border border-black bg-white hover:border-neutral-900 transition-all cursor-pointer relative shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
            >
              {/* Media layout area */}
              <div className="aspect-video w-full overflow-hidden bg-neutral-100 border-b border-black relative">
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 font-mono text-[9px] border border-white font-bold select-none">
                  {proj.date}
                </div>

                {/* Status elements if logged in / custom indicators */}
                <div className="absolute top-2 left-2 flex gap-1 select-none pointer-events-none">
                  {proj.pinned && (
                    <div className="bg-black border border-white text-white p-1" title="Pinned to Homepage">
                      <Pin className="w-3 h-3" />
                    </div>
                  )}
                  {proj.status === 'Draft' && (
                    <span className="bg-neutral-800 text-white font-mono text-[8px] font-bold px-1 py-0.2 uppercase border border-white">
                      Draft
                    </span>
                  )}
                  {proj.visibility === 'Private' && (
                    <div className="bg-neutral-800 border border-white text-white p-1" title="Private">
                      <EyeOff className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Inline Editing Controls directly on hover */}
                {isAdminLoggedIn && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                    <button
                      onClick={(e) => handleOpenEdit(e, proj)}
                      className="p-2 bg-white text-black border border-black hover:bg-neutral-100 font-mono text-xs font-bold uppercase flex items-center gap-1 cursor-pointer shadow-sm rounded-xs"
                      title="Edit details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'EDIT' : '编辑'}</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteProj(e, proj.id)}
                      className="p-2 bg-neutral-900 border border-black text-white hover:bg-red-950 font-mono text-xs font-bold uppercase flex items-center gap-1 cursor-pointer shadow-sm rounded-xs"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'DELETE' : '删除'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text Area */}
              <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-serif text-lg font-bold text-black tracking-tight group-hover:underline decoration-1 leading-snug">
                      {lang === 'zh' ? (proj.title_zh || proj.title) : proj.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-black shrink-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                  <p className="font-serif text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {lang === 'zh' ? (proj.description_zh || proj.description) : proj.description}
                  </p>
                </div>

                {/* Tags lists */}
                <div className="flex flex-wrap gap-1 pt-3 border-t border-neutral-100 mt-2">
                  {proj.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 border border-neutral-300 text-neutral-500 font-mono text-[9px] uppercase hover:border-black hover:text-black transition-all"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        selectedCategory !== 'About' && (
          <div className="p-12 border border-dashed border-neutral-400 text-center rounded">
            <ShieldAlert className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
            <p className="font-mono text-xs text-neutral-500">
              {t.noProjectItems}
            </p>
          </div>
        )
      )}

      {/* Project Details Modal Slider Drawer */}
      {/* Project Details Full Screen Overlay Slider Board */}
      <AnimatePresence>
        {activeProject && !editingProj && !isAddingNew && (
          <motion.div
            id="project-detail-slider-portal"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="fixed left-0 md:left-28 right-0 top-0 bottom-0 bg-white z-50 border-l border-neutral-300 overflow-y-auto flex flex-col pt-12 md:pt-6 pb-16 select-none"
          >
            <div className="border-b-2 border-black p-4 flex justify-between items-center bg-neutral-50 shrink-0 gap-4">
              <button
                onClick={() => setActiveProject(null)}
                className="flex items-center gap-1.5 font-mono font-bold text-[10px] bg-white text-black px-3 py-1.5 border border-black hover:bg-neutral-50 cursor-pointer uppercase rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'BACK TO LIST / 返回作品集' : '返回列表'}</span>
              </button>
              
              <div className="hidden sm:block font-mono text-[10px] uppercase tracking-widest font-black text-neutral-400">
                {t.archiveRef}: {activeProject.id}
              </div>

              <button
                onClick={() => setActiveProject(null)}
                className="font-mono font-bold text-xs bg-black text-white px-3 py-1.5 border border-black hover:bg-neutral-800 cursor-pointer text-[10px] uppercase rounded shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                {t.close}
              </button>
            </div>

            <div className="max-w-4xl mx-auto w-full p-6 space-y-6 flex-1 select-text">
              {/* Media Hub: HTML5 video prioritize or cover layout */}
              {activeProject.videoUrl ? (
                <div className="border-2 border-black bg-black shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden aspect-video relative group">
                  <video
                    src={activeProject.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    poster={activeProject.imageUrl}
                    id={`active-video-player-${activeProject.id}`}
                  />
                  <div className="absolute top-2 right-2 bg-red-650 text-white font-mono text-[9px] px-1 bg-neutral-900/80 uppercase">
                    🎥 Video Player
                  </div>
                </div>
              ) : (
                <img
                  src={activeProject.imageUrl}
                  alt={activeProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-video object-cover border border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:scale-[1.01] transition-transform duration-300"
                />
              )}

              <div className="space-y-4 pt-2">
                <span className="px-2 py-1 bg-black text-white rounded-xs font-mono text-[9px] font-bold uppercase">
                  {categoryLabels[activeProject.category] || activeProject.category}
                </span>
                <h2 className="font-serif text-3xl font-black text-neutral-950 uppercase pt-2 leading-tight">
                  {lang === 'zh' ? (activeProject.title_zh || activeProject.title) : activeProject.title}
                </h2>
              </div>

              {/* Metadata list */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-y border-neutral-200 py-6 font-mono text-xs">
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] tracking-wider">{t.client}</span>
                  <div className="font-bold text-black mt-1 text-sm">
                    {lang === 'zh' 
                      ? (activeProject.client_zh || activeProject.client || '独立研究与实践')
                      : (activeProject.client || 'Personal Project')}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] tracking-wider">{t.role}</span>
                  <div className="font-bold text-black mt-1 text-sm">
                    {lang === 'zh'
                      ? (activeProject.role_zh || activeProject.role || '独立创作者')
                      : (activeProject.role || 'Sole Creator')}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] tracking-wider">{t.timelineCode}</span>
                  <div className="font-bold text-black mt-1 text-sm">{activeProject.date}</div>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] tracking-wider">{t.scopeAreas}</span>
                  <div className="text-black flex flex-wrap gap-1 mt-2">
                    {activeProject.tags.map(tag => (
                      <span key={tag} className="px-1.5 border border-neutral-300 py-0.2 rounded text-[8.5px] font-mono">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Narrative block */}
              <div className="space-y-3 font-serif">
                <h4 className="font-mono text-xs font-black uppercase text-black tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <FileText className="w-3.5 h-3.5 text-neutral-550" />
                  {t.projectBrief}
                </h4>
                <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-line text-justify md:text-[15px]">
                  {lang === 'zh' ? (activeProject.description_zh || activeProject.description) : activeProject.description}
                </p>
              </div>

              {/* Achievements / steps */}
              <div className="space-y-3 font-serif">
                <h4 className="font-mono text-xs font-black uppercase text-black tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-550" />
                  {t.keyMilestones}
                </h4>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {lang === 'zh' && activeProject.details_zh ? (
                    activeProject.details_zh.map((detail, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="font-mono text-xs text-neutral-400 bg-neutral-50 px-1 border mt-0.5">0{idx + 1}.</span>
                        <span className="leading-relaxed font-sans">{detail}</span>
                      </li>
                    ))
                  ) : (
                    activeProject.details.map((detail, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="font-mono text-xs text-neutral-400 bg-neutral-50 px-1 border mt-0.5">0{idx + 1}.</span>
                        <span className="leading-relaxed">{detail}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Multiple Image Gallery for "Design & Creation" or projects with custom galleries */}
              {activeProject.gallery && activeProject.gallery.length > 0 && (
                <div className="space-y-4 font-serif pt-8 border-t border-dashed border-neutral-250">
                  <h4 className="font-mono text-xs font-black uppercase text-black tracking-wider flex items-center gap-1.5">
                    🎨 {lang === 'en' ? 'Project Image Gallery (Click to browse and slide with Arrow keys)' : '创作视觉画卡 (点击画幅启动双向按键/鼠标预览切换)'} ({activeProject.gallery.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {activeProject.gallery.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveGalleryIndex(idx)}
                        className="border border-black bg-white cursor-pointer overflow-hidden aspect-video relative group shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                      >
                        <img
                          src={img}
                          alt="Gallery item preview"
                          className="w-full h-full object-cover transition-all duration-300 pointer-events-none"
                        />
                        <div className="absolute bottom-1 right-1 bg-black text-white text-[8px] font-mono px-1 border border-white">
                          0{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Carousel System overlay with original color preserved */}
      {activeGalleryIndex !== null && activeProject?.gallery && (
        <div className="fixed inset-0 bg-black/95 z-100 flex items-center justify-center p-4 select-none">
          {/* Overlay Click out */}
          <div className="absolute inset-0" onClick={() => setActiveGalleryIndex(null)} />
          
          <button
            onClick={() => setActiveGalleryIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-neutral-450 cursor-pointer font-mono text-[10px] p-2 bg-black border border-white uppercase font-black z-50 tracking-wider hover:bg-neutral-900"
          >
            [CLOSE LIGHTBOX ✕]
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveGalleryIndex(prev => prev! > 0 ? prev! - 1 : activeProject!.gallery!.length - 1);
            }}
            className="absolute left-4 p-3 bg-black/60 border border-white text-white hover:bg-black rounded-full cursor-pointer z-55 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <img
            src={activeProject.gallery[activeGalleryIndex]}
            className="max-w-full max-h-[85vh] object-contain border-2 border-white shadow-2xl relative z-40 transition-all duration-300"
            alt="Gallery high resolution zoom view"
            referrerPolicy="no-referrer"
          />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveGalleryIndex(prev => prev! < activeProject!.gallery!.length - 1 ? prev! + 1 : 0);
            }}
            className="absolute right-4 p-3 bg-black/60 border border-white text-white hover:bg-black rounded-full cursor-pointer z-55 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black px-4 py-1.5 text-white border border-white font-mono text-[10px] tracking-widest uppercase font-bold text-center z-50">
            {lang === 'en' ? 'IMAGE' : '画幅'} {activeGalleryIndex + 1} / {activeProject.gallery.length}
          </div>
        </div>
      )}

      {/* Editor Modal Overlay for Inline additions/edits */}
      {(editingProj || isAddingNew) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white border-2 border-black w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded select-text">
            <div className="flex justify-between items-center border-b border-black pb-2">
              <h2 className="font-serif text-lg font-black uppercase tracking-tight flex items-center gap-1.5">
                <span>🔧</span>
                <span>{isAddingNew ? (lang === 'en' ? 'ADD PORTFOLIO WORK' : '新增作品档案') : (lang === 'en' ? 'EDIT PORTFOLIO WORK' : '编辑作品档案')}</span>
              </h2>
              <button
                onClick={() => { setEditingProj(null); setIsAddingNew(false); }}
                className="font-mono font-bold text-[9px] bg-black text-white border border-black px-2.5 py-1 hover:bg-neutral-800 uppercase tracking-wider cursor-pointer"
              >
                [✕ CLOSE]
              </button>
            </div>

            {/* Bilingual Editing Language Section Selector */}
            <div className="flex border-b border-black text-xs font-mono">
              <button
                type="button"
                className="flex-1 py-2 text-center uppercase font-bold border-r border-black bg-neutral-900 text-white"
                style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)' }}
              >
                🇺🇸 EN & 🇨🇳 ZH Bilingual Fields / 双语管理面板
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 font-mono text-xs">
              {/* Titles block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-black text-[10px] uppercase font-black block mb-1">Project Title (EN)*</label>
                  <input
                    required
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Space Zine Vol.2"
                    className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-500 text-[10px] uppercase font-black block mb-1">作品中文标题 (ZH)</label>
                  <input
                    type="text"
                    value={formTitleZh}
                    onChange={(e) => setFormTitleZh(e.target.value)}
                    placeholder="例如：声音景观志 第二期"
                    className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none font-sans"
                  />
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-black text-[10px] uppercase font-black block mb-1">Category / 所属板块</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full border border-black p-1 bg-neutral-50 focus:bg-white h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="Storytelling">Storytelling (故事叙事)</option>
                    <option value="Campaigns">Campaigns (社会策展)</option>
                    <option value="Design & Creation">Design & Creation (设计与创作)</option>
                    <option value="Growth & Community">Growth & Community (成长与社群)</option>
                  </select>
                </div>
                <div>
                  <label className="text-black text-[10px] uppercase font-black block mb-1">Archive Date (YYYY-MM)*</label>
                  <input
                    required
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="e.g. 2024-06"
                    className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white h-8 text-[11px] outline-none"
                  />
                </div>
              </div>

              {/* Clients / Orgs block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-black text-[10px] uppercase font-black block mb-1">Client/Org (EN)</label>
                  <input
                    type="text"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    placeholder="e.g. Guangzhou Press"
                    className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-500 text-[10px] uppercase font-black block mb-1">委托或者合作单位 (ZH)</label>
                  <input
                    type="text"
                    value={formClientZh}
                    onChange={(e) => setFormClientZh(e.target.value)}
                    placeholder="例如：广州报业集团"
                    className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none"
                  />
                </div>
              </div>

              {/* Role / Title block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-black text-[10px] uppercase font-black block mb-1">Your Role Title (EN)</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Lead Visual Planner"
                    className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-500 text-[10px] uppercase font-black block mb-1">担任角色与职衔 (ZH)</label>
                  <input
                    type="text"
                    value={formRoleZh}
                    onChange={(e) => setFormRoleZh(e.target.value)}
                    placeholder="例如：视觉主策划 / 独立记者"
                    className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Selector and Drag-and-Drop Dropzone with Clip and compress */}
              <div className="space-y-2 border border-black p-3 bg-neutral-50">
                <span className="text-black text-[10px] uppercase font-black block">🖼️ Cover Image Loader (封面图自裁剪压缩)</span>
                
                {/* Drag zone box */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCoverDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-black/80 p-4 rounded text-center cursor-pointer bg-white hover:bg-neutral-50 transition-colors flex flex-col items-center justify-center space-y-1 select-none"
                >
                  <Upload className="w-5 h-5 text-black" />
                  <span className="font-bold text-[10px]">Drag & Drop Cover or Click to Select</span>
                  <span className="text-neutral-500 text-[8px] uppercase">Automated cropping standard 16:9 aspect scale & Compressed to smart size</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCoverFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {isProcessingFile && (
                  <div className="text-[10px] font-bold text-black animate-pulse text-center">
                    ⏳ Processing media file (Adaptive Clipping / Scaling)...
                  </div>
                )}

                {/* Cover Pasting Input */}
                <div>
                  <span className="text-neutral-500 text-[9px] block mb-1">Or paste direct online Image URL:</span>
                  <input
                    type="text"
                    value={formImgUrl}
                    onChange={(e) => setFormImgUrl(e.target.value)}
                    className="w-full border border-black p-1.5 bg-white text-[9.5px] truncate outline-none mb-1"
                  />
                </div>

                {/* Mini Preview rendering */}
                {formImgUrl && (
                  <div className="flex items-center gap-3 bg-white p-2 border border-neutral-200">
                    <img src={formImgUrl} className="w-16 aspect-video object-cover border border-black" alt="Active cover preview" referrerPolicy="no-referrer" />
                    <div className="text-[9px] text-neutral-400 font-mono truncate max-w-[300px]">
                      <span className="font-bold text-black uppercase">Cover Loaded:</span>
                      <div className="truncate">{formImgUrl}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video URL Upload Selector */}
              <div className="space-y-2 border border-black p-3 bg-neutral-50">
                <span className="text-black text-[10px] uppercase font-black block">🎥 Video Attachment Loader (附加播放视频文件)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-500">Paste Stream / direct MP4 YouTube URL:</label>
                    <input
                      type="text"
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                      className="w-full border border-black p-1.5 bg-white text-[9.5px] truncate outline-none h-8"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full border border-black bg-white hover:bg-neutral-100 text-black p-1.5 font-bold uppercase transition-all text-[9.5px] h-8 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Upload Local Mp4 Clip</span>
                    </button>
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={handleVideoFileChange}
                      accept="video/mp4,video/x-m4v,video/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {formVideoUrl && (
                  <div className="flex items-center justify-between bg-white p-2 border border-neutral-200">
                    <div className="flex items-center gap-1.5 text-[9px] text-black font-bold truncate">
                      <Play className="w-3 h-3 text-red-650 shrink-0" />
                      <span className="truncate">{formVideoUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormVideoUrl('')}
                      className="text-red-500 text-[8px] uppercase font-black hover:underline cursor-pointer"
                    >
                      [REMOVE]
                    </button>
                  </div>
                )}
              </div>

              {/* Multi-Image Gallery Manager (Highly required for Design & Creation projects!) */}
              <div className="space-y-2 border border-black p-3 bg-neutral-50">
                <div className="flex justify-between items-center">
                  <span className="text-black text-[10px] uppercase font-black flex items-center gap-1">🎨 Multi-Image Gallery / 视觉作品多图画廊</span>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-2 py-0.5 bg-black text-white hover:bg-neutral-800 text-[8.5px] font-black uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Import Images
                  </button>
                  <input
                    type="file"
                    ref={galleryInputRef}
                    onChange={handleGalleryFileAdd}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>

                <p className="text-neutral-500 text-[8px] uppercase leading-tight italic">
                  Upload multiple screens for Design category. These will expand into interactive slideshow cards inside the drawer.
                </p>

                {formGallery.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 bg-white p-2 border border-neutral-200 max-h-36 overflow-y-auto">
                    {formGallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-video border border-black group overflow-hidden">
                        <img src={img} className="w-full h-full object-cover pointer-events-none" alt={`Gallery item index ${idx}`} />
                        <button
                          type="button"
                          onClick={() => setFormGallery(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                          title="Remove from project gallery list"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                        <div className="absolute top-0.5 left-0.5 bg-black/80 text-white font-mono text-[7px] px-0.5">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-3 border border-dashed border-neutral-300 text-[9px] text-neutral-400 uppercase select-none">
                    No pictures attached to the gallery list yet.
                  </div>
                )}
              </div>

              {/* Descriptions & Narrative */}
              <div>
                <label className="text-black text-[10px] uppercase font-black block mb-1">Creative Narrative Summary (EN)*</label>
                <textarea
                  required
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Provide brief details about materials, target groups, and outcomes..."
                  className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-500 text-[10px] uppercase font-black block mb-1">作品创意叙事描述 (ZH)</label>
                <textarea
                  rows={2}
                  value={formDescZh}
                  onChange={(e) => setFormDescZh(e.target.value)}
                  placeholder="提供关于使用的材料物资、社会环境、工作坊形式或者策展理念的简要概述..."
                  className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none font-sans"
                />
              </div>

              {/* Milestones list block */}
              <div>
                <label className="text-black text-[10px] uppercase font-black block mb-1">Key Milestones (EN) (One statement per line)*</label>
                <textarea
                  required
                  rows={2}
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  placeholder="e.g. Developed custom layout components&#10;Integrated offline databases securely"
                  className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-500 text-[10px] uppercase font-black block mb-1">核心执行成果 / 实拆步骤 (ZH) (一行为一项成果)</label>
                <textarea
                  rows={2}
                  value={formDetailsZh}
                  onChange={(e) => setFormDetailsZh(e.target.value)}
                  placeholder="例如：主持了15场线下街区共创讨论会&#10;手绘了一幅宽度为3米的历史地标叙事画屏"
                  className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white text-[11px] outline-none font-sans"
                />
              </div>

              {/* Tags block */}
              <div>
                <label className="text-black text-[10px] uppercase font-black block mb-1">Hashtag Tags / 风格关键词 (Comma split)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Design, React, Editorial"
                  className="w-full border border-black p-1.5 bg-neutral-50 focus:bg-white h-8 text-[11px] outline-none"
                />
              </div>

              {/* Status and Visibility Settings */}
              <div className="grid grid-cols-2 gap-3 border-t border-black pt-3">
                <div>
                  <label className="text-black text-[10px] uppercase font-black block mb-1">CMS Status / 归档状态</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full border border-black p-1 bg-neutral-50 focus:bg-white h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="Published">Published (公开归档)</option>
                    <option value="Draft">Draft (暂存草稿)</option>
                    <option value="Archived">Archived (非公置档)</option>
                  </select>
                </div>
                <div>
                  <label className="text-black text-[10px] uppercase font-black block mb-1">Access Visibility / 访问权限</label>
                  <select
                    value={formVisibility}
                    onChange={(e: any) => setFormVisibility(e.target.value)}
                    className="w-full border border-black p-1 bg-neutral-50 focus:bg-white h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="Public">🌍 Public (所有人可见)</option>
                    <option value="Private">👀 Private (仅Wendy登录可见)</option>
                  </select>
                </div>
              </div>

              {/* Boolean Toggles */}
              <div className="flex items-center gap-6 py-2 border-y border-black">
                <label className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 h-4 border border-black rounded-none checked:bg-black accent-black"
                  />
                  <span>📌 Pin to Homepage (置顶归档作品至主页)</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-neutral-800 text-xs py-2.5 font-bold uppercase cursor-pointer border border-black transition-all flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 rounded"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'en' ? 'SAVE AND DEPLOY RECORD' : '保存作品归档档案'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECTS CROPPING MODAL */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-black/85 z-55 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white border-2 border-black w-full max-w-xl p-6 space-y-4 shadow-[5px_5px_0px_rgba(0,0,0,1)] rounded-sm">
            <div className="flex justify-between items-center border-b border-black pb-2">
              <h3 className="font-serif text-sm font-black uppercase tracking-tight flex items-center gap-1.5 animate-pulse">
                <span>✂️</span>
                <span>{lang === 'en' ? 'Adjust & Crop Image / 创意画幅裁剪' : '调整与裁剪作品展示图片'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setImageToCrop(null)}
                className="text-[9px] font-mono font-bold bg-neutral-100 hover:bg-neutral-200 border border-black/20 px-2 py-0.5 rounded cursor-pointer"
              >
                [ SKIP CROP / 跳过 ]
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">
              {lang === 'en' 
                ? 'Slide controls to locate your creative focus viewport bounds. Aspect presets adapt to grids.' 
                : '拖动滑块确定裁剪的焦点选区，可以使用以下宽高比预设，使艺术作品更契合展示网格。'}
            </p>

            {/* Real-time high-fidelity bounding box overlay with drag and draw gestures support */}
            <div 
              onPointerDown={handleCropperPointerDown}
              onPointerMove={handleCropperPointerMove}
              onPointerUp={handleCropperPointerUp}
              onPointerCancel={handleCropperPointerUp}
              className="relative border-4 border-black bg-stone-900 max-h-[350px] overflow-hidden flex items-center justify-center select-none aspect-video cursor-crosshair touch-none"
              title={lang === 'en' ? 'Drag inside to move. Drag bounds/draw to crop.' : '按住虚线框内可拖拽移动起终点，或按住边缘拖拽缩放选区，在任意空白处拖动可重新画框。'}
            >
              <img 
                id="cropper-source-image-works-preview"
                src={imageToCrop} 
                alt="Source to Crop" 
                className="max-h-[340px] max-w-full object-contain pointer-events-none"
              />
              {/* Real-time high contrast visual boundary indicators */}
              <div 
                className="absolute border-2 border-[#fbbf24] border-dashed shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none"
                style={{
                  left: `${cropX}%`,
                  top: `${cropY}%`,
                  width: `${cropW}%`,
                  height: `${cropH}%`,
                }}
              >
                <div className="absolute top-1 left-1.5 bg-[#fbbf24] text-black text-[7px] font-mono font-bold leading-none px-1 py-0.5 rounded-sm">
                  CROP FOCUS VIEWPORT
                </div>
                {/* Drag resize visual corner cues */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#fbbf24]" />
                <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-[#fbbf24]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-[#fbbf24]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#fbbf24]" />
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-col gap-1 pr-1">
              <span className="text-[9px] text-neutral-400 font-bold block uppercase tracking-wider">// Crop Aspect Presets / 画幅展示比例</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'free', label: lang === 'en' ? 'Free Form (自由)' : '自由比例' },
                  { id: '16:9', label: lang === 'en' ? '16:9 Landscape (经典宽屏)' : '16:9 经典宽屏' },
                  { id: '4:3', label: lang === 'en' ? '4:3 Grid (传统对齐)' : '4:3 艺术网格' },
                  { id: '1:1', label: lang === 'en' ? '1:1 Square (正方画幅)' : '1:1 正方画幅' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCropAspect(preset.id as any);
                      adjustCropBox(cropX, cropY, cropW, cropH, preset.id);
                    }}
                    className={`px-3 py-1 text-[9.5px] font-bold border transition cursor-pointer ${
                      cropAspect === preset.id 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-zinc-200 hover:bg-neutral-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinate Adjustment Sliders */}
            <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-2.5 border border-[#1e1b4b]/10 rounded font-mono text-[9px] text-black">
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-500 font-bold block">⬅ HORIZONTAL OFFSET / 水平偏移 (X)</span>
                <input 
                  type="range" 
                  min="0" 
                  max={Math.max(0, 100 - cropW)} 
                  value={cropX} 
                  onChange={(e) => adjustCropBox(Number(e.target.value), cropY, cropW, cropH, cropAspect)}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-500 font-bold block">⬆ VERTICAL OFFSET / 垂直偏移 (Y)</span>
                <input 
                  type="range" 
                  min="0" 
                  max={Math.max(0, 100 - cropH)} 
                  value={cropY} 
                  onChange={(e) => adjustCropBox(cropX, Number(e.target.value), cropW, cropH, cropAspect)}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-500 font-bold block">↔ VIEWPORT WIDTH / 选区宽度 (W)</span>
                <input 
                  type="range" 
                  min="10" 
                  max={100 - cropX} 
                  value={cropW} 
                  onChange={(e) => adjustCropBox(cropX, cropY, Number(e.target.value), cropH, cropAspect)}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-500 font-bold block">↕ VIEWPORT HEIGHT / 选区高度 (H)</span>
                <input 
                  type="range" 
                  min="10" 
                  max={100 - cropY} 
                  value={cropH} 
                  disabled={cropAspect !== 'free'}
                  onChange={(e) => adjustCropBox(cropX, cropY, cropW, Number(e.target.value), cropAspect)}
                  className="w-full accent-black cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={executeCrop}
                className="flex-1 bg-black text-white hover:bg-neutral-800 text-[11px] py-1.5 font-bold uppercase cursor-pointer border border-black shadow transition-all flex items-center justify-center gap-1.5"
              >
                <span>Apply & Crop / 确认并裁剪</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onCropComplete) {
                    onCropComplete(imageToCrop);
                  }
                  setImageToCrop(null);
                }}
                className="bg-white text-black hover:bg-neutral-100 text-[11px] py-1.5 px-4 font-bold uppercase cursor-pointer border border-black transition-all"
              >
                {lang === 'en' ? 'Use Original / 使用原图' : '直接使用原图'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
