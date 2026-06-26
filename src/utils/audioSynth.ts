/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { audioDB } from './audioStorage';

// Web Audio API Ambient Synthesizer to generate procedural music
class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private sequenceInterval: any = null;
  private bpm: number = 88;
  private currentStep: number = 0;
  private noteSequence: number[] = [];
  private trackId: string = '';
  private audioEl: HTMLAudioElement | null = null;
  private analyser: AnalyserNode | null = null;

  constructor() {
    // Lazy initialized on play to conform to browser auto-play policies
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async play(trackId: string, customUrl?: string) {
    this.stop();
    this.initCtx();
    this.trackId = trackId;
    this.currentStep = 0;

    let urlToPlay = customUrl;
    if (!urlToPlay && trackId.startsWith('track-custom-')) {
      urlToPlay = await audioDB.getTrackData(trackId) || undefined;
    }

    if (urlToPlay) {
      this.isPlaying = true;
      try {
        this.audioEl = new Audio(urlToPlay);
        this.audioEl.crossOrigin = "anonymous";
        this.audioEl.loop = false;
        
        this.audioEl.addEventListener('ended', () => {
          window.dispatchEvent(new CustomEvent('synth-audio-ended'));
        });

        this.audioEl.play().catch(err => {
          console.warn('Audio playback is blocked by browser gesture lock. Waiting on user gesture...', err);
        });

        // Pipe to analyser
        if (this.ctx && this.analyser) {
          try {
            const source = this.ctx.createMediaElementSource(this.audioEl);
            source.connect(this.analyser);
          } catch (audioPipeError) {
            console.warn('Fail to route AudioElement to Web Audio Analyser (possibly already routed or CORS restricted):', audioPipeError);
          }
        }
      } catch (err) {
        console.error('Failed to initialize or play custom uploaded track:', err);
      }
      return;
    }

    if (!this.ctx) return;

    this.isPlaying = true;

    // Define different compositions for different tracks
    if (trackId === 'track-1') {
      // Ditto: Warm soft synth, minor chords (A minor to F major to C major to G major)
      this.noteSequence = [57, 60, 64, 67, 53, 57, 60, 64, 48, 52, 55, 60, 55, 59, 62, 67];
      this.bpm = 82;
      this.startSequencer('ditto');
    } else if (trackId === 'track-2') {
      // Hype Boy: Retro square leads, energetic progression
      this.noteSequence = [60, 64, 67, 72, 62, 66, 69, 74, 64, 67, 71, 76, 60, 64, 67, 72];
      this.bpm = 110;
      this.startSequencer('hypeboy');
    } else if (trackId === 'track-3') {
      // Attention: Ocean breeze lofi chill pads with sub-basses
      this.noteSequence = [50, 57, 62, 66, 52, 59, 64, 67, 48, 55, 60, 64, 50, 57, 62, 66];
      this.bpm = 95;
      this.startSequencer('attention');
    } else if (trackId === 'track-4') {
      // Kiiikiii Retro Dream Beat: Bitpop triangle waves and sweet digital blips
      this.noteSequence = [72, 76, 79, 84, 74, 78, 81, 86, 76, 79, 83, 88, 72, 76, 79, 84];
      this.bpm = 120;
      this.startSequencer('kiikii-1');
    } else {
      // Silent Pixels: Pure sine bells with high intervals
      this.noteSequence = [60, 72, 67, 79, 64, 76, 55, 67, 62, 74, 57, 69, 60, 72, 62, 74];
      this.bpm = 70;
      this.startSequencer('kiikii-2');
    }
  }

  private startSequencer(style: string) {
    if (!this.ctx) return;

    const stepDuration = 60 / this.bpm / 2; // Eighth notes
    let nextNoteTime = this.ctx.currentTime;

    const playStep = () => {
      if (!this.ctx || !this.isPlaying) return;

      const currentTime = this.ctx.currentTime;
      while (nextNoteTime < currentTime + 0.1) {
        const noteIndex = this.currentStep % this.noteSequence.length;
        const midiNote = this.noteSequence[noteIndex];
        
        // Root tone
        this.triggerSynthNote(midiNote, nextNoteTime, style, false);

        // Ambient chord / padding notes occasionally
        if (this.currentStep % 4 === 0) {
          const rootNote = this.noteSequence[Math.floor(noteIndex / 4) * 4];
          this.triggerSynthNote(rootNote - 12, nextNoteTime, style, true); // Octave below
          this.triggerSynthNote(rootNote + 4, nextNoteTime, style, true);  // Third inside
        }

        // Add interesting sub rhythm
        if (style === 'kiikii-1' && this.currentStep % 3 === 0) {
          this.triggerSynthNote(midiNote + 12, nextNoteTime + stepDuration / 2, 'blip', false);
        }

        nextNoteTime += stepDuration;
        this.currentStep++;
      }
    };

    // Low latency scheduler interval
    this.sequenceInterval = setInterval(playStep, 50);
  }

  private triggerSynthNote(midiNote: number, time: number, style: string, isPad: boolean) {
    if (!this.ctx) return;
    
    // Frequency calculation
    const freq = Math.pow(2, (midiNote - 69) / 12) * 440;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.analyser || this.ctx.destination);

    // Style-specific waveforms and settings
    if (style === 'ditto') {
      osc.type = isPad ? 'triangle' : 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isPad ? 400 : 800, time);
      filter.frequency.exponentialRampToValueAtTime(100, time + (isPad ? 1.5 : 0.4));
    } else if (style === 'hypeboy') {
      osc.type = isPad ? 'sine' : 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isPad ? 300 : 1200, time);
      filter.frequency.exponentialRampToValueAtTime(150, time + 0.3);
    } else if (style === 'attention') {
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, time);
    } else if (style === 'kiikii-1' || style === 'blip') {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(style === 'blip' ? 2000 : 1000, time);
    } else {
      // Pure sine bells
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, time);
    }

    osc.frequency.setValueAtTime(freq, time);

    // Gain envelope setup
    if (isPad) {
      // Nice long breathing ambient drone
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.08, time + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
    } else {
      // Sharp distinct keyboard / sequencer hit
      gainNode.gain.setValueAtTime(style === 'blip' ? 0.02 : 0.05, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + (style === 'blip' ? 0.1 : 0.5));
    }

    osc.start(time);
    osc.stop(time + (isPad ? 2.0 : 0.6));

    const item = { osc, gain: gainNode };
    this.activeOscillators.push(item);

    // Clean up reference
    setTimeout(() => {
      this.activeOscillators = this.activeOscillators.filter(x => x !== item);
    }, (isPad ? 2500 : 800));
  }

  public stop() {
    this.isPlaying = false;
    if (this.sequenceInterval) {
      clearInterval(this.sequenceInterval);
      this.sequenceInterval = null;
    }
    this.activeOscillators.forEach(oscItem => {
      try {
        oscItem.osc.stop();
      } catch (e) {}
    });
    this.activeOscillators = [];
    if (this.audioEl) {
      try {
        this.audioEl.pause();
      } catch (e) {}
      this.audioEl = null;
    }
  }

  public setVolume(volume: number) {
    // Volume handler if needed
  }

  public getWaveform(length: number = 10): number[] {
    if (!this.isPlaying) {
      return Array(length).fill(2);
    }
    if (!this.ctx || !this.analyser) {
      return Array(length).fill(5);
    }
    
    try {
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteTimeDomainData(dataArray);
      
      const result: number[] = [];
      const step = Math.max(1, Math.floor(bufferLength / length));
      for (let i = 0; i < length; i++) {
        const idx = Math.min(bufferLength - 1, i * step);
        const val = dataArray[idx]; 
        const centered = Math.abs(val - 128); 
        const height = Math.max(2, Math.min(20, 2 + centered * 0.25));
        result.push(height);
      }
      return result;
    } catch (e) {
      return Array(length).fill(4);
    }
  }
}

export const synthManager = new AudioSynthManager();
