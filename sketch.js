let img;
let emojiString = "";
const fileInput = document.getElementById('file-input');
const resSlider = document.getElementById('resolution-slider');
const resVal = document.getElementById('res-val');
const output = document.getElementById('emoji-output');
const copyBtn = document.getElementById('copy-btn');

// Emoji color palette for RGB mapping
const emojiPalette = [
    { r: 0, g: 0, b: 0, emoji: "⬛" },       // Black
    { r: 255, g: 255, b: 255, emoji: "⬜" }, // White
    { r: 255, g: 0, b: 0, emoji: "🟥" },     // Red
    { r: 0, g: 0, b: 255, emoji: "🟦" },    // Blue
    { r: 0, g: 255, b: 0, emoji: "🟩" },    // Green
    { r: 255, g: 255, b: 0, emoji: "🟨" },   // Yellow
    { r: 255, g: 165, b: 0, emoji: "🟧" },   // Orange
    { r: 128, g: 0, b: 128, emoji: "🟪" },   // Purple
    { r: 165, g: 42, b: 42, emoji: "🟫" }    // Brown
];

function setup() {
    // p5.js requires setup, but we don't need a visible canvas
    noCanvas();
    
    fileInput.addEventListener('change', handleFile);
    resSlider.addEventListener('input', () => {
        resVal.innerText = resSlider.value;
        if (img) convertImage();
    });

    copyBtn.addEventListener('click', copyToClipboard);
}

function handleFile(e) {
    const file = e.target.files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            img = loadImage(event.target.result, convertImage);
        }
        reader.readAsDataURL(file);
    }
}

function convertImage() {
    if (!img) return;

    emojiString = "";
    let targetWidth = parseInt(resSlider.value);
    // Calculate proportional height to avoid image distortion
    let targetHeight = Math.round((img.height / img.width) * targetWidth);
    
    // Create a temporary small image version to sample pixels
    let tempImg = img.get();
    tempImg.resize(targetWidth, targetHeight);
    tempImg.loadPixels();

    for (let y = 0; y < tempImg.height; y++) {
        for (let x = 0; x < tempImg.width; x++) {
            let index = (x + y * tempImg.width) * 4;
            let r = tempImg.pixels[index];
            let g = tempImg.pixels[index + 1];
            let b = tempImg.pixels[index + 2];
            let a = tempImg.pixels[index + 3];

            // If pixel is mostly transparent, use a black square
            if (a < 128) {
                emojiString += "⬛";
            } else {
                emojiString += findClosestEmoji(r, g, b);
            }
        }
        emojiString += "\n";
    }

    output.innerText = emojiString;
    copyBtn.disabled = false;
}

// Euclidean distance algorithm to map the closest matching emoji color
function findClosestEmoji(r, g, b) {
    let closest = emojiPalette;
    let minDist = Infinity;

    for (let item of emojiPalette) {
        let d = dist(r, g, b, item.r, item.g, item.b);
        if (d < minDist) {
            minDist = d;
            closest = item;
        }
    }
    return closest.emoji;
}

function copyToClipboard() {
    navigator.clipboard.writeText(emojiString).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Copied! ✓";
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    });
          }
