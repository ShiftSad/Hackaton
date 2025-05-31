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
  let semitoneOffset: number;
  switch (noteLetter.toUpperCase()) {
    case "C":
      semitoneOffset = 0;
      break; 
    case "C#":
    case "DB":
      semitoneOffset = 1;
      break;
    case "D":
      semitoneOffset = 2;
      break;
    case "D#":
    case "EB":
      semitoneOffset = 3;
      break;
    case "E":
      semitoneOffset = 4;
      break;
    case "F":
      semitoneOffset = 5;
      break;
    case "F#":
    case "GB":
      semitoneOffset = 6;
      break;
    case "G":
      semitoneOffset = 7;
      break;
    case "G#":
    case "AB":
      semitoneOffset = 8;
      break;
    case "A":
      semitoneOffset = 9;
      break;
    case "A#":
    case "BB":
      semitoneOffset = 10;
      break;
    case "B":
      semitoneOffset = 11;
      break;
    default:
      console.error("Unknown note letter:", noteLetter);
      return null;
  }

  // C4 = 261.63 Hz, calculate frequency using 12th root of 2
  const c4Frequency = 261.63;
  const totalSemitones = (octave - 4) * 12 + semitoneOffset;
  return c4Frequency * Math.pow(2, totalSemitones / 12);
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