const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('sheetCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const downloadJpgBtn = document.getElementById('downloadJpgBtn');
const clearBtn = document.getElementById('clearBtn');
const gridSelect = document.getElementById('gridSelect');
const resolutionSelect = document.getElementById('resolutionSelect');
const themeSelect = document.getElementById('themeSelect');
const customColorLabel = document.getElementById('customColorLabel');
const customColor = document.getElementById('customColor');
const watermarkInput = document.getElementById('watermarkInput');
const showResolution = document.getElementById('showResolution');
const showBorders = document.getElementById('showBorders');
const fileList = document.getElementById('file-list');

let loadedImages = {};
let textureSetName = "Material";

// Theme colors
const THEMES = {
    dark: { bg: '#1a1a1a', text: '#ffffff', subtext: '#aaaaaa', border: '#444444' },
    light: { bg: '#f5f5f5', text: '#1a1a1a', subtext: '#666666', border: '#cccccc' },
    midnight: { bg: '#0a1628', text: '#e0e7ff', subtext: '#8892b0', border: '#233554' },
    forest: { bg: '#0d1f0d', text: '#a8e6cf', subtext: '#56ab91', border: '#2d5a3d' }
};

// Map filenames to standard slots
const SLOT_KEYWORDS = {
    "Base Color": ["basecolor", "albedo", "diffuse", "color", "_bc", "_d"],
    "Normal": ["normal", "nrm", "_n"],
    "Roughness": ["roughness", "rough", "_r"],
    "Metallic": ["metallic", "metalness", "metal", "_m"],
    "Height": ["height", "displacement", "disp", "_h"],
    "Ambient Occlusion": ["ao", "ambient", "occlusion", "_ao"],
    "Emissive": ["emissive", "emit", "_e"],
    "Opacity": ["opacity", "alpha", "mask", "_o"],
    "Specular": ["specular", "spec", "_s"]
};

// Event Listeners
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e);
});

gridSelect.addEventListener('change', generateSheet);
resolutionSelect.addEventListener('change', generateSheet);
themeSelect.addEventListener('change', () => {
    customColorLabel.style.display = themeSelect.value === 'custom' ? 'flex' : 'none';
    generateSheet();
});
customColor.addEventListener('change', generateSheet);
watermarkInput.addEventListener('input', generateSheet);
showResolution.addEventListener('change', generateSheet);
showBorders.addEventListener('change', generateSheet);

downloadBtn.addEventListener('click', () => downloadSheet('png'));
downloadJpgBtn.addEventListener('click', () => downloadSheet('jpg'));
clearBtn.addEventListener('click', clearAll);

function clearAll() {
    loadedImages = {};
    textureSetName = "Material";
    fileList.innerHTML = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    downloadBtn.disabled = true;
    downloadJpgBtn.disabled = true;
}

function handleFiles(e) {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) return;

    loadedImages = {};
    fileList.innerHTML = '';

    // Try to guess texture set name from first file
    const firstFile = files[0].name;
    const parts = firstFile.split('_');
    if (parts.length > 1) {
        textureSetName = parts[0];
    }

    let loadedCount = 0;
    const totalFiles = files.length;

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let type = identifyTextureType(file.name);

                // If this type already exists, make it unique
                let uniqueType = type;
                let counter = 1;
                while (loadedImages[uniqueType]) {
                    counter++;
                    uniqueType = `${type} ${counter}`;
                }
                loadedImages[uniqueType] = img;

                // Add tag to UI
                const tag = document.createElement('div');
                tag.className = 'file-tag';
                tag.textContent = `${uniqueType}: ${file.name}`;
                fileList.appendChild(tag);

                loadedCount++;
                if (loadedCount === totalFiles) {
                    generateSheet();
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function identifyTextureType(filename) {
    const lower = filename.toLowerCase();
    for (const [type, keywords] of Object.entries(SLOT_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) {
            return type;
        }
    }
    return "Unknown";
}

function getThemeColors() {
    const themeName = themeSelect.value;
    if (themeName === 'custom') {
        const bgColor = customColor.value;
        // Determine if custom is light or dark for text colors
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return {
            bg: bgColor,
            text: brightness > 128 ? '#1a1a1a' : '#ffffff',
            subtext: brightness > 128 ? '#666666' : '#aaaaaa',
            border: brightness > 128 ? '#cccccc' : '#444444'
        };
    }
    return THEMES[themeName];
}

function generateSheet() {
    if (Object.keys(loadedImages).length === 0) return;

    const layout = gridSelect.value;
    const cols = parseInt(layout.split('x')[0]);
    const rows = parseInt(layout.split('x')[1]);
    const theme = getThemeColors();

    // Determine base size from first image
    const firstImg = Object.values(loadedImages)[0];
    const originalCellWidth = firstImg.width;
    const originalCellHeight = firstImg.height;

    const headerHeight = 150;
    const gap = 20;
    const footerHeight = watermarkInput.value ? 60 : 0;

    let sheetWidth, sheetHeight, cellWidth, cellHeight;
    let startX = 0;
    let startY = 0;

    const resolution = resolutionSelect.value;

    if (resolution === 'native') {
        cellWidth = originalCellWidth;
        cellHeight = originalCellHeight;
        sheetWidth = (cols * cellWidth) + ((cols + 1) * gap);
        sheetHeight = headerHeight + (rows * cellHeight) + ((rows + 1) * gap) + footerHeight;
    } else {
        const [resW, resH] = resolution.split('x').map(Number);
        sheetWidth = resW;
        sheetHeight = resH;

        const availableWidth = sheetWidth - ((cols + 1) * gap);
        const availableHeight = sheetHeight - headerHeight - ((rows + 1) * gap) - footerHeight;

        const maxCellWidth = availableWidth / cols;
        const maxCellHeight = availableHeight / rows;

        const aspectRatio = originalCellWidth / originalCellHeight;

        if (maxCellWidth / aspectRatio <= maxCellHeight) {
            cellWidth = maxCellWidth;
            cellHeight = cellWidth / aspectRatio;
        } else {
            cellHeight = maxCellHeight;
            cellWidth = cellHeight * aspectRatio;
        }

        const totalGridWidth = (cols * cellWidth) + ((cols + 1) * gap);
        startX = (sheetWidth - totalGridWidth) / 2;
        if (startX < 0) startX = 0;
    }

    canvas.width = sheetWidth;
    canvas.height = sheetHeight;

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, sheetWidth, sheetHeight);

    // Header
    ctx.fillStyle = theme.text;
    ctx.font = "bold 60px 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Material: ${textureSetName}`, sheetWidth / 2, 80);

    if (showResolution.checked) {
        ctx.font = "30px 'Segoe UI', Arial";
        ctx.fillStyle = theme.subtext;
        ctx.fillText(`${originalCellWidth}×${originalCellHeight}`, sheetWidth / 2, 130);
    }

    // Draw Grid
    const order = [
        "Base Color", "Normal", "Roughness",
        "Metallic", "Height", "Ambient Occlusion",
        "Emissive", "Opacity", "Specular", "Unknown"
    ];

    let currentIdx = 0;

    // Draw known types first
    order.forEach(type => {
        if (loadedImages[type]) {
            drawCell(loadedImages[type], type, currentIdx, cols, cellWidth, cellHeight, headerHeight, gap, startX, startY, theme);
            currentIdx++;
        }
    });

    // Draw remaining unknown images
    for (const [type, img] of Object.entries(loadedImages)) {
        if (!order.includes(type)) {
            drawCell(img, type, currentIdx, cols, cellWidth, cellHeight, headerHeight, gap, startX, startY, theme);
            currentIdx++;
        }
    }

    // Watermark
    if (watermarkInput.value) {
        ctx.fillStyle = theme.subtext;
        ctx.font = "24px 'Segoe UI', Arial";
        ctx.textAlign = "center";
        ctx.fillText(watermarkInput.value, sheetWidth / 2, sheetHeight - 20);
    }

    downloadBtn.disabled = false;
    downloadJpgBtn.disabled = false;
}

function drawCell(img, label, index, cols, cellWidth, cellHeight, headerHeight, gap, startX, startY, theme) {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = startX + gap + (col * (cellWidth + gap));
    const y = startY + headerHeight + gap + (row * (cellHeight + gap));

    // Draw Image
    ctx.drawImage(img, x, y, cellWidth, cellHeight);

    // Draw Label Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(x, y, cellWidth, 60);

    // Draw Label Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Segoe UI', Arial";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 20, y + 40);

    // Draw Border
    if (showBorders.checked) {
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
    }
}

function downloadSheet(format) {
    const safeName = textureSetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `MaterialSheet_${safeName}.${format}`;
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.95 : undefined;

    canvas.toBlob(function (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(function () {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    }, mimeType, quality);
}
