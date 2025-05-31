import { getAudioContext, playNoteSound } from './music.ts';

const currentlyPlaying = new Set<string>();
const keys = document.querySelectorAll<HTMLElement>('.key');

let bpm = 100;
let currentKeyIndex = 0;
let currentRow = 0;
let bpmInterval: number | null = null;

const bpmAudio = new Audio('abpm.mp3');
bpmAudio.preload = 'auto';

function playBPMSound() {
  bpmAudio.currentTime = 0;
  bpmAudio.play().catch(console.error);
}

function moveToNextKey() {
  keys.forEach(key => key.classList.remove('selected'));

  if (currentKeyIndex++ >= 9) {
    currentKeyIndex = 0;
  }

  keys[currentKeyIndex + (currentRow * 10)]?.classList.add('selected');
}

function addOrRemoveNote() {
  const selectedKey = keys[currentKeyIndex + (currentRow * 10)];
  if (!selectedKey) return;
  
  const note = selectedKey.textContent || '';
  if (!note) return;

  console.log(`Toggled note: ${note}`);

  if (currentlyPlaying.has(note)) {
    currentlyPlaying.delete(note);
    selectedKey.classList.remove('active');
  } else {
    currentlyPlaying.add(note);
    selectedKey.classList.add('active');
  }
}

function changeRow() {
  keys.forEach(key => key.classList.remove('selected'));
  currentRow = (currentRow + 1) % 5;
  keys[currentKeyIndex + (currentRow * 10)]?.classList.add('selected');
}

function startBPM() {
  if (bpmInterval) return;

  const performBeatAction = () => {
    playBPMSound(); 

    for (let row = 0; row < 5; row++) {
      const keyElement = keys[currentKeyIndex + row * 10];
      if (keyElement) {
        const noteToPlay = keyElement.textContent || "";
        
        if (keyElement.classList.contains('active')) {
          const intervalTimeSeconds = 60000 / bpm / 1000;
          playNoteSound(noteToPlay, intervalTimeSeconds * 0.8); 
        }
      }
    }
    
    moveToNextKey();
  };

  const intervalTime = 60000 / bpm;

  performBeatAction();
  bpmInterval = setInterval(performBeatAction, intervalTime);
}

let spacePressed = false;
let spacePressStartTime = 0;

document.addEventListener('mousedown', (event) => {
    spacePressed = true;
    spacePressStartTime = Date.now();
    
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch((e) => console.error("Error resuming AudioContext:", e));
    }
});

document.addEventListener('mouseup', (event) => {
    spacePressed = false;
    const pressDuration = Date.now() - spacePressStartTime;
    
    if (pressDuration >= 500) { // Long press (500ms or more)
      changeRow();
    } else { // Short press
      addOrRemoveNote();
    }
});

startBPM();