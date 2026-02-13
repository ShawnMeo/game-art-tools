const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('sheetCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const gridSelect = document.getElementById('gridSelect');
const resolutionSelect = document.getElementById('resolutionSelect');
const fileList = document.getElementById('file-list');

let loadedImages = {};
let textureSetName = "Material";

// Map filenames to standard slots
const SLOT_KEYWORDS = {
    "Base Color": ["basecolor", "albedo", "diffuse", "color"],
    "Normal": ["normal", "nrm"],
    "Roughness": ["roughness", "rough"],
    "Metallic": ["metallic", "metalness", "metal"],
    "Height": ["height", "displacement", "disp"],
    "Ambient Occlusion": ["ao", "ambient", "occlusion"],
    "Emissive": ["emissive", "emit"]
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
downloadBtn.addEventListener('click', downloadSheet);

function handleFiles(e) {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) return;

    loadedImages = {};
    fileList.innerHTML = '';

    // Try to guess texture set name from first file
    const firstFile = files[0].name;
    const parts = firstFile.split('_');
    if (parts.length > 1) {
        // Assume format like TextureSet_BaseColor.png
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

function generateSheet() {
    if (Object.keys(loadedImages).length === 0) return;

    const layout = gridSelect.value; // "3x2", "3x3"
    const cols = parseInt(layout.split('x')[0]);
    const rows = parseInt(layout.split('x')[1]);

    // Determine base size from first image
    const firstImg = Object.values(loadedImages)[0];
    const originalCellWidth = firstImg.width;
    const originalCellHeight = firstImg.height;

    const headerHeight = 150;
    const gap = 20;

    let sheetWidth, sheetHeight, cellWidth, cellHeight;
    let startX = 0;
    let startY = 0;

    const resolution = resolutionSelect.value;

    if (resolution === 'native') {
        cellWidth = originalCellWidth;
        cellHeight = originalCellHeight;
        sheetWidth = (cols * cellWidth) + ((cols + 1) * gap);
        sheetHeight = headerHeight + (rows * cellHeight) + ((rows + 1) * gap);
    } else {
        const [resW, resH] = resolution.split('x').map(Number);
        sheetWidth = resW;
        sheetHeight = resH;

        // Calculate available space for grid
        const availableWidth = sheetWidth - ((cols + 1) * gap);
        const availableHeight = sheetHeight - headerHeight - ((rows + 1) * gap);

        // Calculate max cell dimensions to fit
        const maxCellWidth = availableWidth / cols;
        const maxCellHeight = availableHeight / rows;

        // Maintain aspect ratio
        const aspectRatio = originalCellWidth / originalCellHeight;

        if (maxCellWidth / aspectRatio <= maxCellHeight) {
            cellWidth = maxCellWidth;
            cellHeight = cellWidth / aspectRatio;
        } else {
            cellHeight = maxCellHeight;
            cellWidth = cellHeight * aspectRatio;
        }

        // Center the content
        const totalGridWidth = (cols * cellWidth) + ((cols + 1) * gap);

        startX = (sheetWidth - totalGridWidth) / 2;
        if (startX < 0) startX = 0;
    }

    canvas.width = sheetWidth;
    canvas.height = sheetHeight;

    // Background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, sheetWidth, sheetHeight);

    // Header
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Material: ${textureSetName}`, sheetWidth / 2, 80);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(`${originalCellWidth}x${originalCellHeight} - Generated by Material Sheet`, sheetWidth / 2, 130);

    // Draw Grid
    const order = [
        "Base Color", "Normal", "Roughness",
        "Metallic", "Height", "Ambient Occlusion",
        "Emissive", "Unknown"
    ];

    let currentIdx = 0;

    // Draw known types first
    order.forEach(type => {
        if (loadedImages[type]) {
            drawCell(loadedImages[type], type, currentIdx, cols, cellWidth, cellHeight, headerHeight, gap, startX, startY);
            currentIdx++;
        }
    });

    // Draw remaining unknown images
    for (const [type, img] of Object.entries(loadedImages)) {
        if (!order.includes(type)) {
            drawCell(img, type, currentIdx, cols, cellWidth, cellHeight, headerHeight, gap, startX, startY);
            currentIdx++;
        }
    }

    downloadBtn.disabled = false;
}

function drawCell(img, label, index, cols, cellWidth, cellHeight, headerHeight, gap, startX, startY) {
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
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "left";
    ctx.fillText(label, x + 20, y + 40);

    // Draw Border
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cellWidth, cellHeight);
}

function downloadSheet() {
    // Sanitize filename
    const safeName = textureSetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `MaterialSheet_${safeName}.png`;

    // Convert canvas to blob and download
    canvas.toBlob(function (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(function () {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    }, 'image/png');
}
