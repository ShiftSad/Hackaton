let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser", e);
      return null;
    }
  }
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume().catch(console.error);
  }
  return audioContext;
}

export function getFrequency(noteLetter: string, octave: number): number | null {
  let baseFrequency: number;
  switch (noteLetter.toUpperCase()) {
    case "A":
      baseFrequency = 440.0; 
      break; 
    case "C":
      baseFrequency = 261.6;
      break;
    case "D":
      baseFrequency = 293.6;
      break;
    case "E":
      baseFrequency = 329.6;
      break;
    case "G":
      baseFrequency = 391.9;
      break;  
    default:
      console.error("Unknown note letter:", noteLetter);
      return null;
  }

  return baseFrequency;
}

export function playNoteSound(fullNoteName: string, duration: number = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const noteMatch = fullNoteName.match(/([A-G]#?)([0-9]+)?/i);
  if (!noteMatch) {
    console.error("Invalid note format for sound playback:", fullNoteName);
    return;
  }

  const noteLetter = noteMatch[1];
  const octave = noteMatch[2] ? parseInt(noteMatch[2], 10) : 4;

  const freq = getFrequency(noteLetter, octave);
  if (freq === null) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "triangle"; // Changed from "sine" to "triangle" for less acute sound
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02); // Reduced from 0.3 to 0.15
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}