interface MenuItem {
  label: string;
  action?: string;
  subItems?: MenuItem[];
  isBack?: boolean;
  customAction?: () => void;
}

const userMenuConfig: Record<string, (string | { label: string, type: 'custom' })[]> = {
  "Ajuda": ["Preciso ir no banheiro", "Estou com fome", "Estou com sede", "Sinto dor"],
  "Afirmações": ["Sim", "Não", "Talvez", "Obrigado(a)"],
  "Sentimentos": ["Estou feliz", "Estou triste", "Estou confortável", "Estou com frio/calor"],
  "Ações": ["Ligar TV", "Música", "Ler um livro", "Abrir/Fechar janela"],
  "Editar Texto": [
    { label: "Apagar Última Palavra", type: "custom" },
    { label: "Apagar Última Frase", type: "custom" },
    { label: "Limpar Tudo", type: "custom" },
  ],
};

function transformConfigToMenuItems(
  config: Record<string, (string | { label: string, type: 'custom' })[]>
): MenuItem[] {
  return Object.entries(config).map(([categoryName, options]) => ({
    label: categoryName,
    subItems: options.map(option => {
      if (typeof option === 'string') {
        return { label: option, action: option };
      } else {
        return { label: option.label, customAction: () => handleCustomAction(option.label) };
      }
    }),
  }));
}

const mainMenuData: MenuItem[] = transformConfigToMenuItems(userMenuConfig);

let menuDisplay: HTMLElement;
let controlButton: HTMLButtonElement;
let outputText: HTMLTextAreaElement;

let currentMenuItems: MenuItem[] = [...mainMenuData];
let menuHistory: MenuItem[][] = [];
let progressValue: number = 0;
let isButtonPressed: boolean = false;
let animationFrameId: number | null = null;
const TARGET_DURATION_MS = 2500;
let pressStartTime: number = 0;

function init(): void {
  menuDisplay = document.getElementById("menuDisplay") as HTMLElement;
  controlButton = document.getElementById("controlButton") as HTMLButtonElement;
  outputText = document.getElementById("outputText") as HTMLTextAreaElement;

  if (!menuDisplay || !controlButton || !outputText) {
    console.error("Elementos essenciais do DOM não encontrados!");
    return;
  }

  controlButton.addEventListener("mousedown", handleButtonPress);
  controlButton.addEventListener("mouseup", handleButtonRelease);
  controlButton.addEventListener("mouseleave", handleButtonRelease);
  controlButton.addEventListener("touchstart", (e) => { e.preventDefault(); handleButtonPress(); }, { passive: false });
  controlButton.addEventListener("touchend", (e) => { e.preventDefault(); handleButtonRelease(); });

  renderMenu();
  updateButtonGradient();
}

function renderMenu(): void {
  menuDisplay.innerHTML = "";
  if (currentMenuItems.length === 0) {
    menuDisplay.innerHTML = "<p>Nenhum item no menu.</p>";
    return;
  }

  const numItems = currentMenuItems.length;
  let highlightedIndex = -1;
  if (numItems > 0) {
    highlightedIndex = Math.floor((progressValue / 100.0001) * numItems);
    highlightedIndex = Math.min(highlightedIndex, numItems - 1);
  }


  currentMenuItems.forEach((item, index) => {
    const menuItemDiv = document.createElement("div");
    menuItemDiv.classList.add("menu-item");
    menuItemDiv.textContent = item.label;
    if (index === highlightedIndex && isButtonPressed) {
      menuItemDiv.classList.add("highlighted");
    }
    menuDisplay.appendChild(menuItemDiv);
  });
}

function updateButtonGradient(): void {
  const r = Math.round(0 + (255 * (progressValue / 100)));
  const g = 0;
  const b = Math.round(255 - (255 * (progressValue / 100)));
  controlButton.style.backgroundColor = `rgb(${r},${g},${b})`;
}

function updateProgressLoop(): void {
  if (!isButtonPressed) {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    return;
  }

  const elapsedTime = Date.now() - pressStartTime;
  progressValue = Math.min(100, (elapsedTime / TARGET_DURATION_MS) * 100);

  updateButtonGradient();
  renderMenu();

  animationFrameId = requestAnimationFrame(updateProgressLoop);
}

function handleButtonPress(): void {
  if (isButtonPressed) return;
  isButtonPressed = true;
  pressStartTime = Date.now();
  progressValue = 0;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(updateProgressLoop);
}

function handleButtonRelease(): void {
  if (!isButtonPressed) return;
  isButtonPressed = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  processSelection();

  progressValue = 0;
  updateButtonGradient();
  renderMenu();
}

function processSelection(): void {
  if (currentMenuItems.length === 0) return;

  const numItems = currentMenuItems.length;
  let selectedIndex = Math.floor((progressValue / 100.0001) * numItems);
  selectedIndex = Math.min(selectedIndex, numItems - 1);

  const selectedItem = currentMenuItems[selectedIndex];

  if (selectedItem) {
    if (selectedItem.isBack) {
      goBack();
    } else if (selectedItem.action) {
      outputText.value += selectedItem.action + "\n";
      navigateToRootMenu();
    } else if (selectedItem.customAction) {
        selectedItem.customAction();
    } else if (selectedItem.subItems) {
      menuHistory.push([...currentMenuItems]);
      currentMenuItems = [
        { label: "↩ Voltar", isBack: true },
        ...selectedItem.subItems,
      ];
    }
  }
  renderMenu();
}

function handleCustomAction(actionLabel: string): void {
    let text = outputText.value;
    if (actionLabel === "Apagar Última Palavra") {
        const words = text.trim().split(/\s+/);
        if (words.length > 0 && !(words.length === 1 && words[0] === "")) {
            words.pop();
            outputText.value = words.join(" ") + (words.length > 0 ? " " : "");
        } else {
            outputText.value = "";
        }
    } else if (actionLabel === "Apagar Última Frase") {
        const sentences = text.trimEnd().split("\n");
        if (sentences.length > 0 && !(sentences.length === 1 && sentences[0] === "")) {
            sentences.pop();
            outputText.value = sentences.join("\n") + (sentences.length > 0 ? "\n" : "");
        } else {
            outputText.value = "";
        }
    } else if (actionLabel === "Limpar Tudo") {
        outputText.value = "";
    }
}


function goBack(): void {
  if (menuHistory.length > 0) {
    currentMenuItems = menuHistory.pop() as MenuItem[];
  } else {
    currentMenuItems = [...mainMenuData];
  }
}

function navigateToRootMenu(): void {
  currentMenuItems = [...mainMenuData];
  menuHistory = [];
}

document.addEventListener("DOMContentLoaded", init);
