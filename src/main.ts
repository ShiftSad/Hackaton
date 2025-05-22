import { loadWords } from "./words";

const ALPHABET_UPPER_HALF = "ABCDEFGHIJKLM";
const ALPHABET_LOWER_HALF = "NOPQRSTUVWXYZ";
const SPACE_CHAR_DISPLAY = "ESPAÇO";
const SPACE_CHAR_ACTUAL = " ";
const THRESHOLD_FOR_SPACE = 97;

let SUGGESTION_WORDS: string[] = [];

loadWords().then(words => {
  SUGGESTION_WORDS = words;
  console.log(SUGGESTION_WORDS);
}).catch(error => {
  console.error("Erro ao carregar palavras:", error);
});

let pressureSlider: HTMLInputElement;
let sliderValueDisplay: HTMLElement;
let modeButton: HTMLButtonElement;
let deleteButton: HTMLButtonElement;
let currentLetterDisplay: HTMLElement;
let outputText: HTMLTextAreaElement;
let suggestionDisplayElement: HTMLElement;
let useSuggestionButton: HTMLButtonElement;

type AlphabetMode = "upper" | "lower";
let currentMode: AlphabetMode = "upper";
let activeAlphabet: string = ALPHABET_UPPER_HALF;
let currentSuggestion: string | null = null;

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

function updateSuggestion(): void {
  const text = outputText.value;
  const words = text.split(SPACE_CHAR_ACTUAL);
  const currentWordFragment = words[words.length - 1];

  currentSuggestion = null;

  if (currentWordFragment.length > 0) {
    // Find suggestion ignoring case, but preserve original suggestion case
    const foundSuggestion = SUGGESTION_WORDS.find(word =>
      word.toUpperCase().startsWith(currentWordFragment.toUpperCase()) &&
      word.toUpperCase() !== currentWordFragment.toUpperCase()
    );
    if (foundSuggestion) {
      currentSuggestion = foundSuggestion;
    }
  }

  if (currentSuggestion) {
    suggestionDisplayElement.textContent = currentSuggestion;
    useSuggestionButton.disabled = false;
  } else {
    suggestionDisplayElement.textContent = "-";
    useSuggestionButton.disabled = true;
  }
}

function applySuggestion(): void {
  if (currentSuggestion && outputText.value.length > 0) {
    const text = outputText.value;
    const words = text.split(SPACE_CHAR_ACTUAL);
    words[words.length - 1] = currentSuggestion.toUpperCase();
    outputText.value = words.join(SPACE_CHAR_ACTUAL) + SPACE_CHAR_ACTUAL;

    currentSuggestion = null;
    suggestionDisplayElement.textContent = "-";
    useSuggestionButton.disabled = true;
    updateSuggestion();
  }
}

function deleteButtonClick(): void {
  const currentText = outputText.value;
  if (currentText.length > 0) {
    if (currentText.endsWith(SPACE_CHAR_ACTUAL) && currentText.length > 1) {
      const textWithoutLastSpace = currentText.slice(0, -1);
      const words = textWithoutLastSpace.split(SPACE_CHAR_ACTUAL);
      words.pop();
      outputText.value = words.length > 0
        ? words.join(SPACE_CHAR_ACTUAL) + SPACE_CHAR_ACTUAL
        : "";
        } else {
      outputText.value = currentText.slice(0, -1);
    }
  }
  updateLetterDisplay();
  updateSuggestion();
}

function handleSliderRelease(): void {
  const charToType = currentLetterDisplay.textContent;
  if (!charToType) return;

  if (charToType === SPACE_CHAR_DISPLAY) {
    if (outputText.value.endsWith(SPACE_CHAR_ACTUAL) || outputText.value.length === 0) return;
    outputText.value += SPACE_CHAR_ACTUAL;
  } else {
    outputText.value += charToType;
  }

  pressureSlider.value = "0";
  updateLetterDisplay();
  updateSuggestion();
}

document.addEventListener("DOMContentLoaded", () => {
  pressureSlider = document.getElementById("pressureSlider") as HTMLInputElement;
  sliderValueDisplay = document.getElementById(
    "sliderValueDisplay",
  ) as HTMLElement;
  modeButton = document.getElementById("modeButton") as HTMLButtonElement;
  deleteButton = document.getElementById("deleteButton") as HTMLButtonElement;
  currentLetterDisplay = document.getElementById(
    "currentLetterDisplay",
  ) as HTMLElement;
  outputText = document.getElementById("outputText") as HTMLTextAreaElement;
  suggestionDisplayElement = document.getElementById(
    "suggestionDisplay",
  ) as HTMLElement;
  useSuggestionButton = document.getElementById(
    "useSuggestionButton",
  ) as HTMLButtonElement;

  if (
    !pressureSlider || !sliderValueDisplay || !modeButton || !deleteButton ||
    !currentLetterDisplay || !outputText || !suggestionDisplayElement || !useSuggestionButton
  ) {
    console.error("Um ou mais elementos do DOM não foram encontrados!");
    return;
  }

  pressureSlider.addEventListener("input", updateLetterDisplay);
  pressureSlider.addEventListener("mouseup", handleSliderRelease);
  pressureSlider.addEventListener("touchend", handleSliderRelease);

  modeButton.addEventListener("click", toggleMode);
  deleteButton.addEventListener("click", deleteButtonClick);
  useSuggestionButton.addEventListener("click", applySuggestion);

  outputText.addEventListener("input", updateSuggestion);

  modeButton.textContent = `Modo: Superior (${ALPHABET_UPPER_HALF[0]}-${
    ALPHABET_UPPER_HALF[ALPHABET_UPPER_HALF.length - 1]
  })`;
  updateLetterDisplay();
  updateSuggestion();
});
