export async function loadWords() {
    const response = await fetch('https://raw.githubusercontent.com/fserb/pt-br/refs/heads/master/palavras');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const words = text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
    return words;
}