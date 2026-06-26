/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LogoProps {
  onClick?: () => void;
}

export default function Logo({ onClick }: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(() => localStorage.getItem('logo_avatar_b64') || '');
  const [hoverLeft, setHoverLeft] = useState(() => localStorage.getItem('logo_avatar_hover_left') || 'W. LU AVATAR');
  const [hoverRight, setHoverRight] = useState(() => localStorage.getItem('logo_avatar_hover_right') || 'COORD // GZ');
  const [bName, setBName] = useState(() => localStorage.getItem('brand_name') || 'WENDY LU');

  useEffect(() => {
    const handleUpdate = () => {
      setCustomAvatar(localStorage.getItem('logo_avatar_b64') || '');
      setHoverLeft(localStorage.getItem('logo_avatar_hover_left') || 'W. LU AVATAR');
      setHoverRight(localStorage.getItem('logo_avatar_hover_right') || 'COORD // GZ');
      setBName(localStorage.getItem('brand_name') || 'WENDY LU');
    };
    window.addEventListener('avatar-updated', handleUpdate);
    return () => window.removeEventListener('avatar-updated', handleUpdate);
  }, []);

  return (
    <div
      id="brand-logo-w-container"
      className="flex flex-row md:flex-col items-center md:justify-center gap-2.5 md:gap-3 cursor-pointer select-none relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Editorial geometric frame centering 'W' or Custom Avatar with original color preserved */}
      <div className="relative w-10 h-10 md:w-16 md:h-16 border-2 border-black bg-black text-white flex items-center justify-center font-serif text-xl md:text-3xl font-bold transition-all duration-300 transform hover:rotate-3 overflow-visible shrink-0">
        {customAvatar ? (
          <img
            src={customAvatar}
            alt="W"
            className="w-full h-full object-cover transition-all duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black relative">
            {/* Helper geometric ticks mimicking blueprint grids */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-r border-b border-neutral-600" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-l border-b border-neutral-600" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-r border-t border-neutral-600" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-l border-t border-neutral-600" />

            <span className={`transition-all duration-300 font-mono tracking-tighter ${isHovered ? 'scale-110 text-neutral-300' : 'text-white'}`}>
              W
            </span>
          </div>
        )}

        {/* Dynamic pixel indicator overlay in corner */}
        <div className={`absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full transition-all duration-300 ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}`} />

        {/* 3D rotating popup floating preview card on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -8, x: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, x: 75 }}
              exit={{ opacity: 0, scale: 0.8, rotate: -8, x: 20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              style={{ transformOrigin: 'left center' }}
              className="absolute left-10 top-0 w-56 h-56 bg-white border-2 border-black p-1.5 shadow-[6px_6px_0px_rgba(0,0,0,1)] z-100 flex flex-col justify-between cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-[180px] bg-neutral-100 border border-black overflow-hidden relative">
                {customAvatar ? (
                  <img src={customAvatar} className="w-full h-full object-cover" alt="Large Avatar View" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black text-white font-serif text-4xl font-black">
                    LU
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center font-mono text-[9px] text-black pt-1.5 leading-none">
                <span className="font-bold">{hoverLeft}</span>
                <span className="text-zinc-500 font-bold">{hoverRight}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="leading-tight md:text-center shrink-0">
        <div className="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center justify-center gap-1">
          <span>{bName}</span>
        </div>
      </div>
    </div>
  );
}
