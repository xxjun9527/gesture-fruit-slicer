// Simple synthesizer for game SFX
let audioContext: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

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
