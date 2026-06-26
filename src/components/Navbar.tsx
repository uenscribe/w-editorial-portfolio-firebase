/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Clock, FolderOpen, Newspaper, Library, User, Send, Settings } from 'lucide-react';

const IconMap: Record<string, any> = {
  Home,
  Clock,
  FolderOpen,
  Newspaper,
  Library,
  User,
  Send,
  Settings
};

interface NavItem {
  id: string;
  label_en: string;
  label_zh: string;
  iconName: string;
  fontStyle?: string;
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'zh';
  setLang: (lang: 'en' | 'zh') => void;
  customNavItems: NavItem[];
}

export default function Navbar({ activeTab, setActiveTab, lang, setLang, customNavItems }: NavbarProps) {
  return (
    <>
      {/* Desktop Right Fixed Vertical Navigation Bar */}
      <nav
        id="right-fixed-navbar"
        className="hidden md:flex fixed right-0 top-0 bottom-0 w-28 bg-black text-white border-l-2 border-black z-50 flex-col items-center justify-between py-6 select-none"
      >
        <div className="flex flex-col items-center justify-center border-b border-white/10 w-full pb-4 gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className="w-8 h-8 border border-white flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer text-white rounded-xs"
            title="Return to Homepage"
          >
            <span className="font-serif text-sm font-black tracking-tighter">W</span>
          </button>
          
          {/* Top-aligned language switch module - Enlarged slightly */}
          <div className="flex flex-row gap-0.5 justify-center items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded text-[10.5px] font-mono select-none w-22">
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer font-extrabold ${
                lang === 'en' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white font-medium'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer font-extrabold ${
                lang === 'zh' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white font-medium'
              }`}
            >
              简中
            </button>
          </div>

        </div>

        {/* Horizontal text layout listings for right navigation labels as requested */}
        <div className="flex-1 flex flex-col justify-start items-center gap-9 py-8 w-full overflow-y-auto">
          {customNavItems.map(item => {
            const IconComponent = IconMap[item.iconName] || Home;
            const isActive = activeTab === item.id;
            const label = lang === 'en' ? item.label_en : item.label_zh;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`nav-item-${item.id}`}
                className={`w-full flex flex-col items-center justify-center py-2.5 transition-all duration-300 gap-1.5 cursor-pointer border-r-3 ${
                  isActive
                    ? 'text-white border-white bg-white/10 font-bold'
                    : 'text-neutral-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
                title={label}
              >
                <IconComponent className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-70'}`} />
                <span
                  className={`text-[10.5px] uppercase font-bold tracking-tight text-center leading-none px-1 mt-0.5 whitespace-nowrap overflow-none ${item.fontStyle || 'font-sans'}`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="h-10 flex flex-col items-center justify-center border-t border-white/10 w-full gap-1">
          <span className="text-[6.5px] text-neutral-100 animate-ping">●</span>
        </div>
      </nav>

      {/* Mobile/Tablet Bottom Horizontal Navigation Bar with dynamic float top-bar language block */}
      <div className="md:hidden fixed top-12 left-0 right-0 h-9 bg-zinc-950 font-mono text-[9px] z-40 flex items-center justify-between px-3 border-b border-black text-white select-none shadow-sm gap-2">
        <span className="text-zinc-400 font-bold tracking-widest uppercase text-[7.5px] truncate">W. LU ARCHIVE</span>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 p-[1px] rounded text-[8px]">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer font-black ${
                lang === 'en' ? 'bg-white text-black' : 'text-zinc-400'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer font-black ${
                lang === 'zh' ? 'bg-white text-black' : 'text-zinc-400'
              }`}
            >
              简中
            </button>
          </div>
        </div>
      </div>

      <nav
        id="mobile-bottom-navbar"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-black border-t-2 border-black z-40 flex items-center justify-around px-2 font-mono"
      >
        {customNavItems.map(item => {
          const IconComponent = IconMap[item.iconName] || Home;
          const isActive = activeTab === item.id;
          const label = lang === 'en' ? item.label_en : item.label_zh;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              id={`nav-item-mobile-${item.id}`}
              className={`flex flex-col items-center justify-center p-2 min-w-[36px] transition-all cursor-pointer ${
                isActive ? 'text-white font-bold scale-110' : 'text-neutral-550'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span className="text-[7.5px] tracking-tighter mt-0.5 max-w-[40px] truncate leading-none">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
