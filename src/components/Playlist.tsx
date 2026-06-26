/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Disc } from 'lucide-react';
import { TRACKS } from '../data/defaultData';
import { synthManager } from '../utils/audioSynth';

export default function Playlist() {
  const [tracksList, setTracksList] = useState<any[]>(() => {
    const saved = localStorage.getItem('playlist_tracks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {}
    }
    return TRACKS;
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeState, setTimeState] = useState('00:00');
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const cachedElapsedRef = useRef<number>(0);
  const [waveform, setWaveform] = useState<number[]>(() => Array(16).fill(2));

  const currentTrack = tracksList[currentTrackIndex] || { id: 'unknown', title: 'No Track', duration: '00:00' };

  // Listen to custom track ended event for auto next track support
  useEffect(() => {
    const handleAudioEnded = () => {
      // Trigger Next song
      if (tracksList.length === 0) return;
      const nextIdx = (currentTrackIndex + 1) % tracksList.length;
      setCurrentTrackIndex(nextIdx);
      cachedElapsedRef.current = 0;
      setTimeState('00:00');
      setIsPlaying(true);
      synthManager.play(tracksList[nextIdx].id, tracksList[nextIdx].fileUrl);
    };

    window.addEventListener('synth-audio-ended', handleAudioEnded);
    return () => window.removeEventListener('synth-audio-ended', handleAudioEnded);
  }, [tracksList, currentTrackIndex]);

  // Handle active real waveform requestAnimationFrame polling
  useEffect(() => {
    let animFrame: number;
    const update = () => {
      if (isPlaying) {
        setWaveform(synthManager.getWaveform(20)); // Sample 20 points
        animFrame = requestAnimationFrame(update);
      } else {
        setWaveform(Array(20).fill(2));
      }
    };

    if (isPlaying) {
      animFrame = requestAnimationFrame(update);
    } else {
      setWaveform(Array(20).fill(2));
    }

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isPlaying]);

  // Listen to playlist-updated event
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('playlist_tracks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTracksList(parsed);
          // if current index exceeds, reset to 0
          if (currentTrackIndex >= parsed.length) {
            setCurrentTrackIndex(0);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('playlist-updated', handleUpdate);
    return () => window.removeEventListener('playlist-updated', handleUpdate);
  }, [currentTrackIndex]);

  // Listen to remote play-track-command triggers
  useEffect(() => {
    const handleRemotePlay = (e: Event) => {
      const customEvt = e as CustomEvent;
      const { id } = customEvt.detail || {};
      if (!id) return;

      const idx = tracksList.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
        cachedElapsedRef.current = 0;
        setTimeState('00:00');
        synthManager.play(tracksList[idx].id, tracksList[idx].fileUrl);
        setIsPlaying(true);
      }
    };
    window.addEventListener('play-track-command', handleRemotePlay);
    return () => window.removeEventListener('play-track-command', handleRemotePlay);
  }, [tracksList]);

  // Autoplay handler upon mounting the website
  useEffect(() => {
    let autoplayed = false;

    const startAutoplay = () => {
      if (autoplayed) return;
      if (tracksList.length === 0) return;
      try {
        const first = tracksList[0];
        synthManager.play(first.id, first.fileUrl);
        setIsPlaying(true);
        autoplayed = true;
      } catch (err) {
        console.warn('Playback blocked temporarily, waiting for document gesture...', err);
      }
    };

    // Attempt immediately (browsers might block, but we try)
    startAutoplay();

    // Set up a window/document level interaction gesture fallback
    const handleGestureFallback = () => {
      if (!autoplayed) {
        startAutoplay();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', handleGestureFallback);
      window.removeEventListener('touchstart', handleGestureFallback);
      window.removeEventListener('keydown', handleGestureFallback);
    };

    window.addEventListener('click', handleGestureFallback);
    window.addEventListener('touchstart', handleGestureFallback);
    window.addEventListener('keydown', handleGestureFallback);

    return () => {
      cleanup();
    };
  }, [tracksList]);

  // Handle timer for simulation
  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now() - cachedElapsedRef.current;
      timerRef.current = setInterval(() => {
        const elapsedMs = Date.now() - startTimeRef.current;
        const totalSecs = Math.floor(elapsedMs / 1000);
        const mins = String(Math.floor(totalSecs / 60)).padStart(2, '0');
        const secs = String(totalSecs % 60).padStart(2, '0');
        setTimeState(`${mins}:${secs}`);
      }, 250);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (startTimeRef.current > 0) {
        cachedElapsedRef.current = Date.now() - startTimeRef.current;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTrackIndex]);

  const handlePlayPause = () => {
    if (isPlaying) {
      synthManager.stop();
      setIsPlaying(false);
    } else {
      synthManager.play(currentTrack.id, currentTrack.fileUrl);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (tracksList.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % tracksList.length;
    setCurrentTrackIndex(nextIdx);
    cachedElapsedRef.current = 0;
    setTimeState('00:00');
    setIsPlaying(true);
    synthManager.play(tracksList[nextIdx].id, tracksList[nextIdx].fileUrl);
  };

  const handlePrev = () => {
    if (tracksList.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracksList.length) % tracksList.length;
    setCurrentTrackIndex(prevIdx);
    cachedElapsedRef.current = 0;
    setTimeState('00:00');
    setIsPlaying(true);
    synthManager.play(tracksList[prevIdx].id, tracksList[prevIdx].fileUrl);
  };

  const selectTrack = (index: number) => {
    if (index < 0 || index >= tracksList.length) return;
    setCurrentTrackIndex(index);
    cachedElapsedRef.current = 0;
    setTimeState('00:00');
    synthManager.play(tracksList[index].id, tracksList[index].fileUrl);
    setIsPlaying(true);
  };

  return (
    <div
      id="top-fixed-playlist-bar"
      className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-black z-50 flex items-center justify-between px-4 select-none font-mono text-xs text-neutral-900 shadow-sm"
    >
      {/* Left: Vintage Status & Album Art */}
      <div className="flex items-center gap-3 w-1/3 min-w-0 pr-4">
        <div className="relative flex items-center justify-center">
          <Disc
            className={`w-5 h-5 text-black ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
          />
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full border border-black" />
        </div>
        <div className="truncate">
          <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-black rounded-full animate-ping" />
            Live Procedural Streaming
          </div>
          <div className="truncate font-sans font-bold tracking-tight text-[11px] text-black uppercase">
            {currentTrack.title}
          </div>
        </div>
      </div>

      {/* Middle: Controls */}
      <div className="flex items-center gap-4 justify-center w-1/3">
        <button
          onClick={handlePrev}
          id="btn-playlist-prev"
          className="p-1 hover:bg-neutral-100 border border-transparent active:border-black rounded transition-all cursor-pointer"
          title="Previous Track"
        >
          <SkipBack className="w-4 h-4 text-black" />
        </button>

        <button
          onClick={handlePlayPause}
          id="btn-playlist-toggle"
          className="px-3 py-1 bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 rounded font-mono font-medium shadow-sm transition-all focus:ring-1 focus:ring-offset-1 focus:ring-black cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-white stroke-none" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white stroke-none" />
              <span>PLAY TRACK</span>
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          id="btn-playlist-next"
          className="p-1 hover:bg-neutral-100 border border-transparent active:border-black rounded transition-all cursor-pointer"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Right: Audio Visualizer & Static/Dynamic Timer */}
      <div className="flex items-center gap-4 justify-end w-1/3">
        {/* Dynamic Waveform Visualizer */}
        <div className="hidden sm:flex items-end gap-1 h-5 w-auto px-2" title="Audio Waveform">
          {waveform.map((h, i) => (
            <div
              key={i}
              className="w-1 bg-black transition-all duration-75"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        <div className="tabular-nums font-mono border-l border-neutral-300 pl-4 flex items-center gap-2">
          <span>{timeState}</span>
          <span className="text-neutral-400">/</span>
          <span className="text-neutral-400">{currentTrack.duration}</span>
        </div>
      </div>
    </div>
  );
}
