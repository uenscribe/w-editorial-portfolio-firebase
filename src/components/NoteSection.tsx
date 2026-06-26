/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Note, CMSStatus, CMSVisibility } from '../types';
import { Search, Compass, BookOpen, Clock, ShieldAlert, ArrowUpRight, HelpCircle, Edit, Trash2, Plus, Check, EyeOff, Pin } from 'lucide-react';
import { UI_TRANSLATIONS } from '../utils/translations';

interface NoteSectionProps {
  notes: Note[];
  lang?: 'en' | 'zh';
  isAdminLoggedIn?: boolean;
  onSaveNotes?: (notes: Note[]) => void;
  noteTopSubtitleEn?: string;
  noteTopSubtitleZh?: string;
  noteTopTitleEn?: string;
  noteTopTitleZh?: string;
  noteBtnReadEn?: string;
  noteBtnReadZh?: string;
  noteTitleInsightsEn?: string;
  noteTitleInsightsZh?: string;
  noteBtnLaunchEn?: string;
  noteBtnLaunchZh?: string;
  noteBtnPublishEn?: string;
  noteBtnPublishZh?: string;
}

export default function NoteSection({
  notes,
  lang = 'en',
  isAdminLoggedIn = false,
  onSaveNotes,
  noteTopSubtitleEn = 'Reflections / Articles //',
  noteTopSubtitleZh = '视窗文章与社群反思 //',
  noteTopTitleEn = 'EDITORIAL ARCHIVE',
  noteTopTitleZh = '学者专栏与纪实档案',
  noteBtnReadEn = 'READ INSIGHTS',
  noteBtnReadZh = '研读解密',
  noteTitleInsightsEn = 'EDITORIAL INSIGHT MAP',
  noteTitleInsightsZh = '研读主干与内容洞察',
  noteBtnLaunchEn = 'LAUNCH ORIGINAL INTERFACE',
  noteBtnLaunchZh = '进入模拟/原文链道',
  noteBtnPublishEn = 'PUBLISH NEW ARTICLE',
  noteBtnPublishZh = '发表新专栏文章'
}: NoteSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [useIframeSimulator, setUseIframeSimulator] = useState(false);

  // Editor states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formPublishDate, setFormPublishDate] = useState('');
  const [formReadTime, setFormReadTime] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formInsights, setFormInsights] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<CMSStatus>('Published');
  const [formVisibility, setFormVisibility] = useState<CMSVisibility>('Public');
  const [formPinned, setFormPinned] = useState(false);

  const t = UI_TRANSLATIONS[lang];

  // Filters based on search term and admin draft toggles
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (isAdminLoggedIn) {
      return matchesSearch;
    } else {
      const isDraftStatus = note.status === 'Draft' || note.status === 'Archived';
      const isPrivateStatus = note.visibility === 'Private';
      return matchesSearch && !isDraftStatus && !isPrivateStatus;
    }
  });

  // Sort notes so that those pinned (pinned === true) always float to the top
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    const aPinned = a.pinned ? 1 : 0;
    const bPinned = b.pinned ? 1 : 0;
    return bPinned - aPinned;
  });

  // Open editor helpers
  const handleOpenEdit = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingNote(note);
    setIsAddingNew(false);
    setFormTitle(note.title);
    setFormSummary(note.summary);
    setFormPublishDate(note.publishDate);
    setFormReadTime(note.readTime);
    setFormUrl(note.url);
    setFormInsights(note.insights.join('\n'));
    setFormTags(note.tags.join(', '));
    setFormStatus(note.status || 'Published');
    setFormVisibility(note.visibility || 'Public');
    setFormPinned(note.pinned || false);
  };

  const handleOpenAdd = () => {
    setEditingNote(null);
    setIsAddingNew(true);
    setFormTitle('');
    setFormSummary('');
    setFormPublishDate(new Date().toISOString().split('T')[0]);
    setFormReadTime('5 min read');
    setFormUrl('https://mp.weixin.qq.com/');
    setFormInsights(lang === 'en' ? 'Core statement insights.\nAction guides.' : '核心洞察纪实。\n行动导向体系。');
    setFormTags('Media, Writing');
    setFormStatus('Published');
    setFormVisibility('Public');
    setFormPinned(false);
  };

  const handleDeleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t.confirmDelete)) return;
    if (onSaveNotes) {
      const updated = notes.filter(n => n.id !== id);
      onSaveNotes(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const insightsArr = formInsights.split('\n').map(l => l.trim()).filter(Boolean);
    const tagsArr = formTags.split(',').map(tag => tag.trim()).filter(Boolean);

    if (isAddingNew) {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: formTitle,
        summary: formSummary,
        publishDate: formPublishDate,
        readTime: formReadTime,
        url: formUrl,
        insights: insightsArr,
        tags: tagsArr,
        status: formStatus,
        visibility: formVisibility,
        pinned: formPinned
      };
      if (onSaveNotes) {
        onSaveNotes([newNote, ...notes]);
      }
    } else if (editingNote) {
      const updated = notes.map(item => {
        if (item.id === editingNote.id) {
          return {
            ...item,
            title: formTitle,
            summary: formSummary,
            publishDate: formPublishDate,
            readTime: formReadTime,
            url: formUrl,
            insights: insightsArr,
            tags: tagsArr,
            status: formStatus,
            visibility: formVisibility,
            pinned: formPinned
          };
        }
        return item;
      });
      if (onSaveNotes) {
        onSaveNotes(updated);
      }
    }

    setEditingNote(null);
    setIsAddingNew(false);
  };

  return (
    <div id="notes-editorial-block-wrapper" className="space-y-8">
      {/* Editorial Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-4 gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-black mb-1">
            {lang === 'en' ? noteTopSubtitleEn : noteTopSubtitleZh}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 uppercase font-black">
            {lang === 'en' ? noteTopTitleEn : noteTopTitleZh}
          </h1>
        </div>

        {/* Dynamic add button in Admin scope */}
        {isAdminLoggedIn && (
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 border border-dashed border-black bg-neutral-50 hover:bg-black hover:text-white text-black font-mono font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer rounded shadow-xs"
            title="Publish New Note"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? noteBtnPublishEn : noteBtnPublishZh}</span>
          </button>
        )}
      </div>

      {/* Searching column */}
      <div className="flex items-center gap-3 border border-black bg-white px-3 py-2 shadow-sm rounded">
        <Search className="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder={t.filteringArticles}
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

      {/* Clean Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            id={`note-card-${note.id}`}
            onClick={() => {
              setActiveNote(note);
              setUseIframeSimulator(false);
            }}
            className="group border border-black bg-white flex flex-col justify-between p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <div className="space-y-4">
              {/* Header dates/tags */}
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 font-mono text-[9px] text-neutral-500 uppercase tracking-widest font-black">
                  <Clock className="w-3.5 h-3.5 text-black" />
                  {note.publishDate} // {note.readTime}
                </span>

                <div className="flex items-center gap-1 select-none">
                  {note.pinned && (
                    <div className="bg-black text-white p-1 rounded-xs border border-black" title="Pinned to Homepage">
                      <Pin className="w-3 h-3" />
                    </div>
                  )}
                  {note.status === 'Draft' && (
                    <span className="px-1 py-0.2 bg-neutral-800 text-white font-mono text-[8.5px] uppercase font-bold text-[8px] border border-black rounded-xs">
                      Draft
                    </span>
                  )}
                  {note.visibility === 'Private' && (
                    <div className="bg-neutral-800 text-white p-1 border border-neutral-700 rounded-xs" title="Private to Admin">
                      <EyeOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* Text context */}
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-black text-black group-hover:underline leading-snug">
                  {note.title}
                </h3>
                <p className="font-serif text-xs text-neutral-600 leading-relaxed line-clamp-3">
                  {note.summary}
                </p>
              </div>
            </div>

            {/* Tags and callbacks */}
            <div className="flex justify-between items-center pt-4 border-t border-dashed border-neutral-200 mt-4 h-8">
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 border border-dashed border-neutral-300 text-neutral-400 font-mono text-[8.5px] uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Inline Action block */}
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleOpenEdit(e, note)}
                    className="p-1.5 bg-white text-black border border-black hover:bg-neutral-100 rounded transition-all cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="p-1.5 bg-black border border-black text-white hover:bg-neutral-800 rounded transition-all cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-neutral-900 group-hover:underline flex items-center gap-1">
                  {lang === 'en' ? noteBtnReadEn : noteBtnReadZh} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full p-12 border border-dashed border-neutral-400 text-center rounded">
            <ShieldAlert className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
            <p className="font-mono text-xs text-neutral-500">
              {t.noLibraryItems}
            </p>
          </div>
        )}
      </div>

      {/* Immersive Reader Panel Overlay */}
      {activeNote && !editingNote && !isAddingNew && (
        <div className="fixed inset-0 bg-black/65 z-55 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          {/* Overlay dismissal */}
          <div className="absolute inset-0 -z-10" onClick={() => setActiveNote(null)} />

          <div className="bg-white border-2 border-black w-full max-w-2xl h-[85vh] flex flex-col shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded">
            {/* Editorial Frame Indicator Header */}
            <div className="border-b-2 border-black p-4 flex justify-between items-center bg-neutral-50 shrink-0 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
                <span className="font-black text-black">{t.readerFrame} // DECRYPT_ACTIVE</span>
              </div>
              <button
                onClick={() => setActiveNote(null)}
                className="font-bold underline text-black hover:text-neutral-500 cursor-pointer"
              >
                {t.exitReader}
              </button>
            </div>

            {/* Scrollable Document Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {useIframeSimulator ? (
                /* Simulated framing guard portal */
                <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4 font-mono max-w-md mx-auto">
                  <Compass className="w-10 h-10 text-neutral-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="font-bold text-xs uppercase bg-black text-white px-2 py-0.5">{t.frameSafeguard}</span>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    {t.frameSafeguardDesc}
                  </p>
                  <div className="flex flex-col gap-2 w-full">
                    <a
                      href={activeNote.url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-black text-white border border-black hover:bg-neutral-800 text-[10px] py-2 font-bold uppercase transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    >
                      {t.openOriginal}
                    </a>
                    <button
                      onClick={() => setUseIframeSimulator(false)}
                      className="text-neutral-400 hover:text-black text-[9px] uppercase hover:underline cursor-pointer"
                    >
                      {lang === 'en' ? '← RETURN To Summarized Insight Deck' : '← 返回文章精炼大纲视图'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Abstract content view */
                <div className="space-y-6">
                  {/* Title Block */}
                  <div className="space-y-3 pb-4 border-b border-neutral-200">
                    <span className="font-mono text-[9px] text-[#000000] font-bold uppercase block tracking-wider">
                      {activeNote.publishDate} // {activeNote.readTime}
                    </span>
                    <h2 className="font-serif text-xl md:text-2xl font-black text-neutral-950 leading-tight uppercase">
                      {activeNote.title}
                    </h2>
                    <p className="font-serif text-sm text-neutral-600 leading-relaxed italic border-l-2 border-black pl-3 py-1 bg-neutral-50">
                      “ {activeNote.summary} ”
                    </p>
                  </div>

                  {/* Summary / Insight bulletin points */}
                  <div className="space-y-4">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-black font-black flex items-center gap-1.5 select-none">
                      <BookOpen className="w-4 h-4 text-black" />
                      {lang === 'en' ? noteTitleInsightsEn : noteTitleInsightsZh}
                    </h4>
                    <ul className="space-y-3 font-serif text-sm text-neutral-800">
                      {activeNote.insights.map((insight, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <span className="font-mono text-xs text-neutral-400 bg-neutral-100 px-1 border border-neutral-200 py-0.5 mt-0.5">
                            KEY_0{idx + 1}
                          </span>
                          <span className="leading-relaxed pt-0.5">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer links */}
                  <div className="pt-6 border-t border-dashed border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-1">
                      {activeNote.tags.map(t => (
                        <span key={t} className="font-mono text-[9px] bg-neutral-50 border border-neutral-200 text-neutral-500 px-1.5 py-0.5">#{t}</span>
                      ))}
                    </div>

                    <button
                      onClick={() => setUseIframeSimulator(true)}
                      className="bg-black text-white border border-black hover:bg-neutral-800 font-mono text-[10px] font-bold uppercase py-2 px-3 flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <span>{lang === 'en' ? noteBtnLaunchEn : noteBtnLaunchZh}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Note Editor Modal Overlay for Inline Additions / Edits */}
      {(editingNote || isAddingNew) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded">
            <div className="flex justify-between items-center border-b border-black pb-2">
              <h2 className="font-serif text-lg font-black uppercase">
                {isAddingNew ? (lang === 'en' ? 'PUBLISH STUDY ARTICLE' : '发表新专栏文章') : (lang === 'en' ? 'EDIT STUDY ARTICLE' : '编辑专栏文章')}
              </h2>
              <button
                onClick={() => { setEditingNote(null); setIsAddingNew(false); }}
                className="font-mono font-bold text-[10px] bg-black text-white border border-black px-2 py-1 hover:bg-neutral-800"
              >
                [CANCEL / CLOSE]
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Article Title</label>
                <input
                  required
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 城市缝隙里的光：青年微更新实践"
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[11px] outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Paragraph Subtitle / Statement</label>
                <textarea
                  required
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Give a deep summarizing overview that captures the reader..."
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 text-[11px] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Publish Date</label>
                  <input
                    required
                    type="text"
                    value={formPublishDate}
                    onChange={(e) => setFormPublishDate(e.target.value)}
                    placeholder="e.g. 2024-05-20"
                    className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[11px] outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Est Read Time</label>
                  <input
                    required
                    type="text"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    placeholder="e.g. 7 min read"
                    className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[11px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Origin Public WeChat (or other source link)</label>
                <input
                  required
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://mp.weixin.qq.com/..."
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[10px] truncate outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Key Insights Summary (One statement per line)</label>
                <textarea
                  rows={4}
                  value={formInsights}
                  onChange={(e) => setFormInsights(e.target.value)}
                  placeholder="Insight A&#10;Insight B&#10;Insight C"
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 text-[11px] outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Hashtag tags (Comma divided)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. 空间活化, 地方叙事, 共创活动"
                  className="w-full border border-black p-1.5 focus:bg-neutral-50 h-8 text-[11px] outline-none"
                />
              </div>

              {/* Status and Visibility Settings */}
              <div className="grid grid-cols-2 gap-2 border-t border-neutral-100 pt-3">
                <div>
                  <label className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">CMS Status</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full border border-black p-1 focus:bg-neutral-50 h-8 text-[11px] font-mono outline-none"
                  >
                    <option value="Published">Published (公开发布)</option>
                    <option value="Draft">Draft (暂存草稿)</option>
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
                    <option value="Private">👀 Private (仅主理人可见)</option>
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
                  <span>{lang === 'en' ? 'SAVE AND PUBLISH NOTE' : '发布专栏档案文章'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
