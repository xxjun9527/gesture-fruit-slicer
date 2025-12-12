// Simple synthesizer for game SFX
let audioContext: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let bgmGain: GainNode | null = null;
let bgmInterval: number | null = null;
let bgmPlaying = false;

export const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

const createNoiseBuffer = () => {
    if (!audioContext) return null;
    // Create a 2-second buffer of white noise
    const bufferSize = audioContext.sampleRate * 2; 
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
};

export const playSwipe = () => {
  if (!audioContext) initAudio();
  if (!audioContext) return;
  
  if (!noiseBuffer) noiseBuffer = createNoiseBuffer();
  if (!noiseBuffer) return;

  const source = audioContext.createBufferSource();
  source.buffer = noiseBuffer;
  
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  // Bandpass filter sweep for "swish" sound
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, audioContext.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
  filter.Q.value = 1;

  gain.gain.setValueAtTime(0.05, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

  source.start();
  source.stop(audioContext.currentTime + 0.2);
};

export const playSlice = () => {
  if (!audioContext) initAudio();
  if (!audioContext) return;

  // 1. Oscillator for the "zing"
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);

  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

  osc.start();
  osc.stop(audioContext.currentTime + 0.1);
  
  // 2. Noise for the "splat" texture
  if (!noiseBuffer) noiseBuffer = createNoiseBuffer();
  if (noiseBuffer) {
      const nSource = audioContext.createBufferSource();
      nSource.buffer = noiseBuffer;
      const nGain = audioContext.createGain();
      const nFilter = audioContext.createBiquadFilter();
      
      nSource.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(audioContext.destination);
      
      nFilter.type = 'highpass';
      nFilter.frequency.value = 4000;
      
      nGain.gain.setValueAtTime(0.1, audioContext.currentTime);
      nGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      nSource.start();
      nSource.stop(audioContext.currentTime + 0.1);
  }
};

export const playExplosion = () => {
    if (!audioContext) initAudio();
    if (!audioContext) return;
    
    if (!noiseBuffer) noiseBuffer = createNoiseBuffer();
    if (!noiseBuffer) return;

    const source = audioContext.createBufferSource();
    source.buffer = noiseBuffer;
    
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);

    gain.gain.setValueAtTime(0.5, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

    source.start();
    source.stop(audioContext.currentTime + 1);
};

const ensureBgmChain = () => {
  if (!audioContext) initAudio();
  if (!audioContext) return null;
  if (!bgmGain) {
    bgmGain = audioContext.createGain();
    bgmGain.gain.value = 0.12;
    bgmGain.connect(audioContext.destination);
  }
  return bgmGain;
};

const playTone = (freq: number, duration: number, type: OscillatorType, gainLevel: number) => {
  if (!audioContext) initAudio();
  if (!audioContext) return;
  const master = ensureBgmChain();
  if (!master) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  gain.gain.setValueAtTime(gainLevel, audioContext.currentTime);
  osc.connect(gain);
  gain.connect(master);
  const now = audioContext.currentTime;
  osc.start(now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.stop(now + duration + 0.01);
};

const playHat = () => {
  if (!audioContext) initAudio();
  if (!audioContext) return;
  const master = ensureBgmChain();
  if (!master) return;
  if (!noiseBuffer) noiseBuffer = createNoiseBuffer();
  if (!noiseBuffer) return;
  const src = audioContext.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  filter.type = 'highpass';
  filter.frequency.value = 6000;
  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  const now = audioContext.currentTime;
  src.start(now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  src.stop(now + 0.06);
};

export const startBGM = () => {
  if (bgmPlaying) return;
  if (!audioContext) initAudio();
  if (!audioContext) return;
  ensureBgmChain();
  let step = 0;
  const bass = [65.41, 49.00, 55.00, 49.00];
  const melody = [261.63, 329.63, 392.00, 523.25, 587.33, 659.25, 523.25, 392.00];
  bgmInterval = window.setInterval(() => {
    const b = bass[step % bass.length];
    const m = melody[step % melody.length];
    playTone(b, 0.28, 'square', 0.22);
    playTone(m, 0.22, 'sawtooth', 0.25);
    playHat();
    if (step % 4 === 0) {
      playTone(261.63, 0.25, 'sawtooth', 0.18);
      playTone(329.63, 0.25, 'sawtooth', 0.18);
      playTone(392.00, 0.25, 'sawtooth', 0.18);
    }
    step++;
  }, 360);
  bgmPlaying = true;
};

export const stopBGM = () => {
  if (!audioContext) return;
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  if (bgmGain) {
    bgmGain.gain.cancelScheduledValues(audioContext.currentTime);
    bgmGain.gain.setValueAtTime(bgmGain.gain.value, audioContext.currentTime);
    bgmGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    setTimeout(() => {
      bgmGain && bgmGain.disconnect();
      bgmGain = null;
    }, 250);
  }
  bgmPlaying = false;
};
