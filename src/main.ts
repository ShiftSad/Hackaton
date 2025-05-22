const ALPHABET_UPPER_HALF = "ABCDEFGHIJKLM";
const ALPHABET_LOWER_HALF = "NOPQRSTUVWXYZ";
const SPACE_CHAR_DISPLAY = "ESPAÇO";
const SPACE_CHAR_ACTUAL = " ";
const THRESHOLD_FOR_SPACE = 97;

let pressureSlider: HTMLInputElement;
let sliderValueDisplay: HTMLElement;
let modeButton: HTMLButtonElement;
let currentLetterDisplay: HTMLElement;
let outputText: HTMLTextAreaElement;

type AlphabetMode = "upper" | "lower";
let currentMode: AlphabetMode = "upper";
let activeAlphabet: string = ALPHABET_UPPER_HALF;

function updateLetterDisplay(): void {
  if (!pressureSlider || !currentLetterDisplay || !activeAlphabet) return;

  const sliderValue = parseInt(pressureSlider.value);
  sliderValueDisplay.textContent = sliderValue.toString();

  if (sliderValue >= THRESHOLD_FOR_SPACE) {
    currentLetterDisplay.textContent = SPACE_CHAR_DISPLAY;
  } else {
    const maxSliderValueForLetters = THRESHOLD_FOR_SPACE - 1;
    const maxIndex = activeAlphabet.length - 1;

    let index = 0;
    if (maxSliderValueForLetters > 0 && sliderValue <= maxSliderValueForLetters) {
      index = Math.round(
        (sliderValue / maxSliderValueForLetters) * maxIndex,
      );
    } else if (sliderValue > maxSliderValueForLetters) {
        index = maxIndex;
    }

    index = Math.max(0, Math.min(index, maxIndex));
    currentLetterDisplay.textContent = activeAlphabet[index] || "";
  }
}

function toggleMode(): void {
  if (currentMode === "upper") {
    currentMode = "lower";
    activeAlphabet = ALPHABET_LOWER_HALF;
    modeButton.textContent = `Modo: Inferior (${ALPHABET_LOWER_HALF[0]}-${
      ALPHABET_LOWER_HALF[ALPHABET_LOWER_HALF.length - 1]
    })`;
  } else {
    currentMode = "upper";
    activeAlphabet = ALPHABET_UPPER_HALF;
    modeButton.textContent = `Modo: Superior (${ALPHABET_UPPER_HALF[0]}-${
      ALPHABET_UPPER_HALF[ALPHABET_UPPER_HALF.length - 1]
    })`;
  }
  updateLetterDisplay();
}

function handleSliderRelease(): void {
  const charToType = currentLetterDisplay.textContent;
  if (charToType) {
    if (charToType === SPACE_CHAR_DISPLAY) {
      outputText.value += SPACE_CHAR_ACTUAL;
    } else {
      outputText.value += charToType;
    }
  }

  pressureSlider.value = "0";
  updateLetterDisplay();
}

document.addEventListener("DOMContentLoaded", () => {
  pressureSlider = document.getElementById("pressureSlider") as HTMLInputElement;
  sliderValueDisplay = document.getElementById(
    "sliderValueDisplay",
  ) as HTMLElement;
  modeButton = document.getElementById("modeButton") as HTMLButtonElement;
  currentLetterDisplay = document.getElementById(
    "currentLetterDisplay",
  ) as HTMLElement;
  outputText = document.getElementById("outputText") as HTMLTextAreaElement;

  if (!pressureSlider || !sliderValueDisplay || !modeButton || !currentLetterDisplay || !outputText) {
    console.error("Um ou mais elementos do DOM não foram encontrados!");
    return;
  }

  pressureSlider.addEventListener("input", updateLetterDisplay);
  pressureSlider.addEventListener("mouseup", handleSliderRelease);
  pressureSlider.addEventListener("touchend", handleSliderRelease);

  modeButton.addEventListener("click", toggleMode);

  modeButton.textContent = `Modo: Superior (${ALPHABET_UPPER_HALF[0]}-${
    ALPHABET_UPPER_HALF[ALPHABET_UPPER_HALF.length - 1]
  })`;
  updateLetterDisplay();
});
