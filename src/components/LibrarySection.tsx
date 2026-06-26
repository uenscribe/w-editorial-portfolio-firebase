/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LibraryItem, CMSStatus, CMSVisibility } from '../types';
import { Book, Film, Music, Star, Search, Plus, Check, Edit, Trash2, EyeOff, Pin, ShieldAlert } from 'lucide-react';
import { UI_TRANSLATIONS } from '../utils/translations';

interface LibrarySectionProps {
  items: LibraryItem[];
  lang?: 'en' | 'zh';
  isAdminLoggedIn?: boolean;
  onSaveItems?: (items: LibraryItem[]) => void;
}

export default function LibrarySection({ items, lang = 'en', isAdminLoggedIn = false, onSaveItems }: LibrarySectionProps) {
  const [filterType, setFilterType] = useState<'all' | 'book' | 'movie' | 'music'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Editor states
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Details view state
  const [detailedItem, setDetailedItem] = useState<LibraryItem | null>(null);

  // Custom Canvas Cropper states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropX, setCropX] = useState<number>(10);
  const [cropY, setCropY] = useState<number>(10);
  const [cropW, setCropW] = useState<number>(80);
  const [cropH, setCropH] = useState<number>(80);
  const [cropAspect, setCropAspect] = useState<'free' | '3:4' | '16:9' | '1:1'>('free');
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

  // Form states
  const [formType, setFormType] = useState<'book' | 'movie' | 'music'>('book');
  const [formTitle, setFormTitle] = useState('');
  const [formCreator, setFormCreator] = useState('');
  const [formStatus, setFormStatus] = useState<'In Progress' | 'Completed' | 'Wishlist'>('Completed');
  const [formRating, setFormRating] = useState<number>(5);
  const [formDate, setFormDate] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formCoverColor, setFormCoverColor] = useState('#262626');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formCmsStatus, setFormCmsStatus] = useState<CMSStatus>('Published');
  const [formVisibility, setFormVisibility] = useState<CMSVisibility>('Public');
  const [formPinned, setFormPinned] = useState(false);

  // Drag-and-drop state on cards
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Helper crop calculator keeping locked ratios live
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

  // Canvas processing crop execution
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

      canvas.width = 600;
      canvas.height = (sH / sW) * 600;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL('image/jpeg', 0.90);
      if (onCropComplete) {
        onCropComplete(base64);
      }
      setImageToCrop(null);
    };
    img.src = imageToCrop;
  };

  // Directly handle drag and drop uploading for library items
  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItemId(itemId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverItemId(null);
  };

  const handleDrop = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    setDragOverItemId(null);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setImageToCrop(base64);
          setCropX(10);
          setCropY(10);
          setCropW(80);
          setCropH(80);
          setCropAspect('free');
          setOnCropComplete(() => (croppedBase64: string) => {
            const updated = items.map(item => {
              if (item.id === itemId) {
                return { ...item, coverImage: croppedBase64 };
              }
              return item;
            });
            onSaveItems?.(updated);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardImageChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setImageToCrop(base64);
          setCropX(10);
          setCropY(10);
          setCropW(80);
          setCropH(80);
          setCropAspect('free');
          setOnCropComplete(() => (croppedBase64: string) => {
            const updated = items.map(item => {
              if (item.id === itemId) {
                return { ...item, coverImage: croppedBase64 };
              }
              return item;
            });
            onSaveItems?.(updated);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter based on roles, types, search terms
  const filteredItems = items.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesFilter || !matchesSearch) return false;

    if (isAdminLoggedIn) {
      return true;
    } else {
      const isDraftStatus = item.status_cms === 'Draft' || item.status_cms === 'Archived';
      const isPrivateStatus = item.visibility === 'Private';
      return !isDraftStatus && !isPrivateStatus;
    }
  });

  // Sort library items so pinned items always float to the top
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
    return bPinned - aPinned;
  });

  const t = UI_TRANSLATIONS[lang];

  const typeLabels: Record<string, string> = {
    'all': lang === 'en' ? 'All Mediums' : '所有媒介记录',
    'book': lang === 'en' ? 'Books' : '精选书籍',
    'movie': lang === 'en' ? 'Movies' : '经典电影',
    'music': lang === 'en' ? 'Music' : '独立音乐'
  };

  const singleTypeLabels: Record<string, string> = {
    'book': lang === 'en' ? 'Book' : '文献书籍',
    'movie': lang === 'en' ? 'Movie' : '电影感悟',
    'music': lang === 'en' ? 'Music' : '独立声频'
  };

  const statusLabels: Record<string, string> = {
    'Completed': lang === 'en' ? 'Completed' : '已研读完',
    'In Progress': lang === 'en' ? 'In Progress' : '正在研读',
    'To Read': lang === 'en' ? 'To Read' : '存架计划',
    'Wishlist': lang === 'en' ? 'Wishlist' : '研究计划'
  };

  // Open editor helpers
  const handleOpenEdit = (e: React.MouseEvent, item: LibraryItem) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsAddingNew(false);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormCreator(item.creator);
    setFormStatus(item.status);
    setFormRating(item.rating);
    setFormDate(item.date);
    setFormNote(item.note || '');
    setFormCoverColor(item.coverColor || '#262626');
    setFormCoverImage(item.coverImage || '');
    setFormCmsStatus(item.status_cms || 'Published');
    setFormVisibility(item.visibility || 'Public');
    setFormPinned(item.pinned || false);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsAddingNew(true);
    setFormType('book');
    setFormTitle('');
    setFormCreator('');
    setFormStatus('Completed');
    setFormRating(5);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNote('');
    setFormCoverColor('#171717');
    setFormCoverImage('');
    setFormCmsStatus('Published');
    setFormVisibility('Public');
    setFormPinned(false);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t.confirmDelete)) return;
    if (onSaveItems) {
      const updated = items.filter(item => item.id !== id);
      onSaveItems(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCreator.trim()) return;

    if (isAddingNew) {
      const newItem: LibraryItem = {
        id: `lib-${Date.now()}`,
        type: formType,
        title: formTitle,
        creator: formCreator,
        status: formStatus,
        rating: formRating,
        date: formDate,
        note: formNote || undefined,
        coverColor: formCoverColor,
        coverImage: formCoverImage || undefined,
        status_cms: formCmsStatus,
        visibility: formVisibility,
        pinned: formPinned
      };
      if (onSaveItems) {
        onSaveItems([newItem, ...items]);
      }
    } else if (editingItem) {
      const updated = items.map(item => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            type: formType,
            title: formTitle,
            creator: formCreator,
            status: formStatus,
            rating: formRating,
            date: formDate,
            note: formNote || undefined,
            coverColor: formCoverColor,
            coverImage: formCoverImage || undefined,
            status_cms: formCmsStatus,
            visibility: formVisibility,
            pinned: formPinned
          };
        }
        return item;
      });
      if (onSaveItems) {
        onSaveItems(updated);
      }
    }

    setEditingItem(null);
    setIsAddingNew(false);
  };

  return (
    <>
      <div id="library-logs-wrapper" className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-4 gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-black mb-1">
            {lang === 'en' ? 'Media Logs //' : '学术与感官阅览记录 //'}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 uppercase font-black">
            {t.libraryTitle}
          </h1>
        </div>
        
        {/* Genre Selector */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs items-center">
          {(['all', 'book', 'movie', 'music'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 border border-black font-semibold uppercase relative cursor-pointer ${
                filterType === type
                  ? 'bg-black text-white translate-x-[1px] translate-y-[1px]'
                  : 'bg-white text-black hover:bg-neutral-50 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {typeLabels[type]}
            </button>
          ))}

          {isAdminLoggedIn && (
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1 border border-dashed border-black bg-neutral-50 hover:bg-black hover:text-white text-black font-semibold uppercase flex items-center gap-1 cursor-pointer transition-all rounded shadow-xs"
              title="Add Library review"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'ADD REVIEW' : '新增评阅'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Searching controls */}
      <div className="flex items-center gap-3 border border-black bg-white px-3 py-2 shadow-sm rounded">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder={t.filteringLogs}
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

      {/* Index card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map(item => {
          const isBook = item.type === 'book';
          const isMovie = item.type === 'movie';
          const Icon = isBook ? Book : isMovie ? Film : Music;
          
          return (
            <div
              key={item.id}
              id={`library-item-${item.id}`}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item.id)}
              onClick={() => setDetailedItem(item)}
              className="group border border-black bg-white flex flex-col justify-between p-5 relative shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer select-none"
            >
              {/* Cover image at 20% opacity */}
              {item.coverImage && (
                <div 
                  className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  style={{
                    backgroundImage: `url(${item.coverImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.20
                  }}
                />
              )}

              {/* Drag over overlay visual indicator */}
              {dragOverItemId === item.id && (
                <div className="absolute inset-0 bg-stone-100/80 backdrop-blur-xs flex flex-col items-center justify-center border-2 border-dashed border-black z-30 pointer-events-none select-none">
                  <span className="font-mono text-[10px] font-black text-black uppercase tracking-widest bg-white p-2 border border-black shadow">
                    📥 {lang === 'en' ? 'DROP IMAGE COVER' : '释放鼠标应用封面图'}
                  </span>
                </div>
              )}

              {/* Decorative cover band simulation badge on the right side */}
              <div
                className="absolute top-0 right-0 w-3 h-full border-l border-black z-10"
                style={{ backgroundColor: item.coverColor || '#171717' }}
              />

              <div className="space-y-4 pr-4 relative z-10">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[9px] text-neutral-500 font-extrabold uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5 text-black" />
                    {singleTypeLabels[item.type] || item.type}
                  </span>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1 select-none">
                    {isAdminLoggedIn ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = items.map(it => {
                            if (it.id === item.id) {
                              return { ...it, pinned: !it.pinned };
                            }
                            return it;
                          });
                          onSaveItems?.(updated);
                        }}
                        className={`p-0.5 border cursor-pointer transition-colors ${
                          item.pinned ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200 hover:text-black hover:border-black'
                        }`}
                        title={item.pinned ? (lang === 'en' ? 'Unpin from Top / 取消置顶' : '取消置顶') : (lang === 'en' ? 'Pin to Top / 置顶模块' : '置顶模块')}
                      >
                        <Pin className="w-3.5 h-3.5 p-[1px]" />
                      </button>
                    ) : (
                      item.pinned && (
                        <span className="p-0.5 bg-black text-white border border-black" title="Pinned to Homepage">
                          <Pin className="w-2.5 h-2.5" />
                        </span>
                      )
                    )}
                    {item.status_cms === 'Draft' && (
                      <span className="px-1 text-[7px] bg-neutral-800 text-white font-mono uppercase font-bold border border-black">
                        Draft
                      </span>
                    )}
                    {item.visibility === 'Private' && (
                      <span className="p-0.5 bg-neutral-800 text-white border border-neutral-700" title="Private">
                        <EyeOff className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className={`px-2 py-0.5 border border-black font-mono text-[8.5px] font-bold uppercase rounded-xs ${
                      item.status === 'Completed' ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-600'
                    }`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                </div>

                {/* Information */}
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-extrabold text-[#000000] tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-mono text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                    {lang === 'en' ? `by ${item.creator}` : `主创者: ${item.creator}`}
                  </p>
                </div>

                {/* Rating system */}
                <div className="flex gap-0.5 text-neutral-300">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-3.5 h-3.5 ${
                        index < item.rating ? 'text-black fill-black' : 'text-neutral-200'
                      }`}
                    />
                  ))}
                  <span className="font-mono text-[9px] text-neutral-500 font-bold ml-2 self-center">
                    ({item.rating}.0)
                  </span>
                </div>

                {/* Review note in typography style */}
                {item.note && (
                  <p className="font-serif text-xs text-neutral-700 leading-relaxed pt-2 border-t border-dashed border-neutral-200 italic">
                    “ {item.note} ”
                  </p>
                )}
              </div>

              {/* Footer Date log and Admin Inline Editing on hover/view */}
              <div className="pt-3 flex justify-between items-center font-mono text-[9px] text-neutral-400 mt-4 border-t border-dashed border-neutral-200 pr-4 relative z-10">
                <span className="flex flex-col gap-0.5">
                  <span>{lang === 'en' ? 'LOG_DATE' : '归档日期'} : {item.date}</span>
                  {!item.coverImage && isAdminLoggedIn && (
                    <span className="text-[7.5px] text-stone-400 tracking-tighter uppercase">{lang === 'en' ? 'Drag cover image here' : '可直接拖拽图片到此卡片'}</span>
                  )}
                </span>
                
                {isAdminLoggedIn ? (
                  <div className="flex gap-1 items-center">
                    {/* Add local upload input trigger */}
                    <label
                      htmlFor={`upload-cover-${item.id}`}
                      className="p-1 bg-white border border-black hover:bg-neutral-100 rounded text-black transition-all cursor-pointer flex items-center justify-center h-5.5 w-6"
                      title={lang === 'en' ? 'Upload local image as cover' : '本地上传封面图片'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px]">📷</span>
                      <input
                        type="file"
                        id={`upload-cover-${item.id}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCardImageChange(e, item.id)}
                      />
                    </label>

                    <button
                      onClick={(e) => handleOpenEdit(e, item)}
                      className="p-1 bg-white border border-black hover:bg-neutral-50 rounded text-black transition-all cursor-pointer"
                      title="Edit Log"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="p-1 bg-black border border-black hover:bg-neutral-800 rounded text-white transition-all cursor-pointer"
                      title="Delete Log"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[8px] bg-neutral-100 text-neutral-400 px-1 border border-neutral-250 font-mono select-none">
                    {item.id}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full p-12 border border-dashed border-neutral-400 text-center rounded">
            <span className="font-mono text-xs text-neutral-500">
              {t.noLibraryItems}
            </span>
          </div>
        )}
      </div>

      {/* Library Editor Modal Overlay */}
      {(editingItem || isAddingNew) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded">
            <div className="flex justify-between items-center border-b border-black pb-2">
              <h2 className="font-serif text-lg font-black uppercase">
                {isAddingNew ? (lang === 'en' ? 'ADD LIBRARY ENTRY / REVIEW' : '新增书籍影音评阅') : (lang === 'en' ? 'EDIT LIBRARY ENTRY' : '编辑书籍影音评阅')}
              </h2>
              <button
                onClick={() => { setEditingItem(null); setIsAddingNew(false); }}
                className="font-mono font-bold text-[10px] bg-black text-white border border-black px-2 py-1 hover:bg-neutral-800"
              >
                [CANCEL / CLOSE]
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Medium Type</label>
                  <select
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full border border-black p-1 focus:bg-neutral-50 h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="book">Book (文献书籍)</option>
                    <option value="movie">Movie (电影院线)</option>
                    <option value="music">Music (独立声频)</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Log / Review Date</label>
                  <input
                    required
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="e.g. 2024-05-20"
                    className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[11px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Item Title</label>
                <input
                  required
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Chungking Express"
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[11px] outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Creator / Author / Producer</label>
                <input
                  required
                  type="text"
                  value={formCreator}
                  onChange={(e) => setFormCreator(e.target.value)}
                  placeholder="e.g. Wong Kar-wai"
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[11px] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full border border-black p-1 focus:bg-neutral-50 h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="Completed">Completed (已阅读完)</option>
                    <option value="In Progress">In Progress (正研读中)</option>
                    <option value="Wishlist">Wishlist (存架计划)</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Rating Rating</label>
                  <select
                    value={formRating}
                    onChange={(e: any) => setFormRating(Number(e.target.value))}
                    className="w-full border border-black p-1 focus:bg-neutral-50 h-8 text-[11px] font-mono outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0)</option>
                    <option value={3}>⭐⭐⭐ (3.0)</option>
                    <option value={2}>⭐⭐ (2.0)</option>
                    <option value={1}>⭐ (1.0)</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Sidebar Hex Color</label>
                  <input
                    type="text"
                    value={formCoverColor}
                    onChange={(e) => setFormCoverColor(e.target.value)}
                    placeholder="e.g. #000000"
                    className="w-full border border-black p-1.5 h-8 text-[11px] font-mono focus:bg-neutral-50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">
                  Cover Image (封面图 - 拖拽或本地上传, 透明度40%)
                </label>
                <div className="border border-black p-2 flex items-center gap-3 bg-neutral-50 min-h-12 relative">
                  {formCoverImage ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <img 
                          src={formCoverImage} 
                          alt="preview" 
                          className="w-10 h-10 object-cover border border-black" 
                        />
                        <span className="text-[10px] text-green-700 font-bold uppercase">Image Loaded (✓ 已载入图片)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormCoverImage('')}
                        className="px-1.5 py-0.5 border border-red-500 hover:bg-red-50 text-red-500 font-extrabold font-mono text-[9px] uppercase tracking-wide cursor-pointer"
                      >
                        [Delete / 移除]
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 w-full text-center py-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="form-cover-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              if (base64) setFormCoverImage(base64);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="form-cover-upload"
                        className="inline-block mx-auto px-3 py-1 cursor-pointer bg-white border border-black hover:bg-neutral-100 font-bold text-[10px] uppercase font-mono shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                      >
                        Choose Image Cover (选取封面图 File)
                      </label>
                      <span className="text-[8px] text-neutral-400">Supports .jpg, .png or .webp base64 conversions</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Review Statement / Memo Note</label>
                <textarea
                  rows={3}
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Provide structured reviews about grids, narration, sound, aesthetics..."
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 text-[11px] outline-none"
                />
              </div>

              {/* CMS Status and Visibility */}
              <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">CMS Status</label>
                  <select
                    value={formCmsStatus}
                    onChange={(e: any) => setFormCmsStatus(e.target.value)}
                    className="w-full border border-black p-1 focus:bg-neutral-50 h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="Published">Published (公开网文)</option>
                    <option value="Draft">Draft (草稿设计)</option>
                    <option value="Archived">Archived (非公置档)</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Access Visibility</label>
                  <select
                    value={formVisibility}
                    onChange={(e: any) => setFormVisibility(e.target.value)}
                    className="w-full border border-black p-1 focus:bg-neutral-50 h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="Public">🌍 Public (所有人可见)</option>
                    <option value="Private">👀 Private (仅自己登录可见)</option>
                  </select>
                </div>
              </div>

              {/* Boolean Toggles */}
              <div className="flex items-center gap-6 py-2 border-y border-neutral-100">
                <label className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 h-4 border border-black rounded-none checked:bg-black accent-black"
                  />
                  <span>📌 Pin to Homepage (置顶至首页)</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-neutral-800 text-xs py-2 font-bold uppercase cursor-pointer border border-black transition-all flex items-center justify-center gap-1 shadow"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'en' ? 'SAVE LIBRARY LOG' : '保存书籍影音归档记录'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    {/* 1. INTERACTIVE DESIGNER CROPPING MODAL */}
    {imageToCrop && (
      <div className="fixed inset-0 bg-black/85 z-55 flex items-center justify-center p-4 backdrop-blur-md">
        <div className="bg-white border-2 border-black w-full max-w-xl p-6 space-y-4 shadow-[5px_5px_0px_rgba(0,0,0,1)] rounded-sm">
          <div className="flex justify-between items-center border-b border-black pb-2">
            <h3 className="font-serif text-sm font-black uppercase tracking-tight flex items-center gap-1.5">
              <span>✂️</span>
              <span>{lang === 'en' ? 'Adjust & Crop Cover Image / 封面微调裁剪' : '调整与裁剪书籍影音封面图'}</span>
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
              ? 'Locate focus viewport by sliding control handles. The selected cover aspect-ratio locks down seamlessly.' 
              : '拖动滑块确定裁剪的焦点选区，可以使用以下宽高比预设，使文献封面更契合网格。'}
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
              id="cropper-source-image-preview"
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
            <span className="text-[9px] text-neutral-400 font-bold block uppercase tracking-wider">// Crop Aspect Presets / 封面比例预设</span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'free', label: lang === 'en' ? 'Free Form (自由)' : '自由比例' },
                { id: '3:4', label: lang === 'en' ? '3:4 Book (经典书影)' : '3:4 经典书封' },
                { id: '16:9', label: lang === 'en' ? '16:9 Cinema (电影荧幕)' : '16:9 院线宽屏' },
                { id: '1:1', label: lang === 'en' ? '1:1 Square (唱片盘面)' : '1:1 独立唱片' }
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
          <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-2.5 border border-black/10 rounded">
            <div className="space-y-0.5">
              <span className="text-[9px] text-zinc-500 font-bold block">⬅ HORIZONTAL OFFSET / 水平偏量 (X)</span>
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
              <span className="text-[9px] text-zinc-500 font-bold block">⬆ VERTICAL OFFSET / 垂直偏量 (Y)</span>
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
              <span className="text-[9px] text-zinc-500 font-bold block">↔ VIEWPORT WIDTH / 选取宽度 (W)</span>
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
              <span className="text-[9px] text-zinc-500 font-bold block">↕ VIEWPORT HEIGHT / 选取高度 (H)</span>
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
              <span>Apply & Crop / 裁剪并保存封面</span>
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

    {/* 2. RICH DETAIL VIEW MODAL - FOR READERS/GUESTS TO ENGAGE WITH MEMO REVIEWS */}
    {detailedItem && (
      <div 
        className="fixed inset-0 bg-black/75 z-45 flex items-center justify-center p-4 backdrop-blur-xs" 
        onClick={() => setDetailedItem(null)}
      >
        <div 
          className="bg-[#fafaf6] border-2 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded-sm flex flex-col md:flex-row text-neutral-800" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left cover strip */}
          <div className="md:w-2/5 bg-neutral-900 min-h-[250px] relative flex items-center justify-center border-b-2 md:border-b-0 md:border-r-2 border-black overflow-hidden select-none">
            {detailedItem.coverImage ? (
              <img 
                src={detailedItem.coverImage} 
                alt={detailedItem.title} 
                className="w-full h-full object-cover max-h-[380px]"
              />
            ) : (
              <div className="text-center p-6 text-stone-500 font-mono text-[10px] space-y-2">
                {detailedItem.type === 'book' ? <Book className="w-10 h-10 text-stone-600 mx-auto" /> : detailedItem.type === 'movie' ? <Film className="w-10 h-10 text-stone-600 mx-auto" /> : <Music className="w-10 h-10 text-stone-600 mx-auto" />}
                <p className="uppercase font-bold tracking-widest leading-relaxed">No Graphic Cover</p>
              </div>
            )}
            
            {/* Side edge spine band simulation */}
            <div 
              className="absolute top-0 right-0 w-3.5 h-full border-l border-black"
              style={{ backgroundColor: detailedItem.coverColor || '#171717' }}
            />
          </div>

          {/* Right contents journal ledger */}
          <div className="md:w-3/5 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-black/10 pb-2">
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-neutral-500 font-extrabold uppercase tracking-wider">
                  {detailedItem.type === 'book' ? <Book className="w-3.5 h-3.5" /> : detailedItem.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
                  {singleTypeLabels[detailedItem.type] || detailedItem.type}
                </span>
                
                <span className={`px-2 py-0.5 border border-black font-mono text-[8px] font-bold uppercase rounded-xs ${
                  detailedItem.status === 'Completed' ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-600'
                }`}>
                  {statusLabels[detailedItem.status] || detailedItem.status}
                </span>
              </div>

              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-black text-black leading-tight tracking-tight">
                  {detailedItem.title}
                </h2>
                <p className="font-mono text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest">
                  {lang === 'en' ? `WRITTEN / AUTHORED BY : ${detailedItem.creator}` : `主创 / 著者署名 : ${detailedItem.creator}`}
                </p>
              </div>

              {/* Rating stars display status */}
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 text-black">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-3.5 h-3.5 ${
                        index < detailedItem.rating ? 'fill-black text-black' : 'text-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-neutral-400 font-bold">({detailedItem.rating}.0 / 5.0)</span>
              </div>

              {/* Study memo review note text block */}
              <div className="pt-4 border-t border-dashed border-neutral-300">
                <span className="text-[8px] font-mono text-neutral-400 font-bold uppercase block mb-1.5">// INSIGHT MEMO STATEMENT</span>
                <p className="font-serif text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap italic bg-white p-4 border border-black/10 shadow-xs relative">
                  <span className="text-3xl text-zinc-300 font-serif absolute -top-1.5 -left-1 font-bold leading-none select-none">“</span>
                  <span className="relative z-10">{detailedItem.note ? detailedItem.note : (lang === 'en' ? 'No insight statement logged for this catalog review.' : '暂无对此文献的具体研读感悟记录。')}</span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-black/10 font-mono text-[9px] text-neutral-400">
              <span>{lang === 'en' ? 'LOG_DATE' : '建档日期'} : {detailedItem.date}</span>
              <button
                type="button"
                onClick={() => setDetailedItem(null)}
                className="px-3.5 py-1 bg-black text-white hover:bg-neutral-800 border border-black font-semibold uppercase text-[10px] tracking-widest cursor-pointer shadow-sm active:translate-y-px active:shadow-none"
              >
                {lang === 'en' ? 'CLOSE / CANCEL' : '关闭详情'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
}
