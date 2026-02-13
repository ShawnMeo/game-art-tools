const canvas = document.getElementById('trim-canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download-btn');
const resolutionSelect = document.getElementById('resolution-select');
const showUvsCheckbox = document.getElementById('show-uvs');
const opacitySlider = document.getElementById('opacity-slider');
const uvTooltip = document.getElementById('uv-tooltip');
const snapSelect = document.getElementById('snap-select');
const splitHBtn = document.getElementById('split-h-btn');
const splitVBtn = document.getElementById('split-v-btn');
const deleteBtn = document.getElementById('delete-btn');

// STATE
let state = {
    resolution: 2048,
    activeTemplateId: 'h_4_equal',
    showUvs: true,
    opacity: 1.0,
    snap: 16, // pixels

    // Edit State
    cells: [], // The active editable layout
    selectedCell: null,
    hoveredCell: null,
    dragState: null // { type: 'h'|'v', lineIndex: int, startVal: float }
};

// HELPER: Generate UUID
const uuid = () => Math.random().toString(36).substr(2, 9);

// TEMPLATE DEFINITIONS
// coords: [x, y, w, h] in 0-1 UV space
const TEMPLATES = {
    // Horizontal
    'h_4_equal': {
        name: '4 Strips (Equal)',
        category: 'h-templates',
        type: 'strips',
        cells: [
            { u: 0, v: 0, w: 1, h: 0.25 },
            { u: 0, v: 0.25, w: 1, h: 0.25 },
            { u: 0, v: 0.5, w: 1, h: 0.25 },
            { u: 0, v: 0.75, w: 1, h: 0.25 }
        ]
    },
    'h_8_equal': {
        name: '8 Strips (Equal)',
        category: 'h-templates',
        type: 'strips',
        cells: Array(8).fill(0).map((_, i) => ({
            u: 0, v: i * 0.125, w: 1, h: 0.125
        }))
    },
    'h_trim_mix': {
        name: 'Standard Mix',
        category: 'h-templates',
        type: 'strips',
        cells: [
            { u: 0, v: 0, w: 1, h: 0.25 },
            { u: 0, v: 0.25, w: 1, h: 0.125 },
            { u: 0, v: 0.375, w: 1, h: 0.125 },
            { u: 0, v: 0.5, w: 1, h: 0.125 },
            { u: 0, v: 0.625, w: 1, h: 0.0625 },
            { u: 0, v: 0.6875, w: 1, h: 0.0625 },
            { u: 0, v: 0.75, w: 1, h: 0.25 },
        ]
    },

    // Vertical
    'v_4_equal': {
        name: '4 Columns',
        category: 'v-templates',
        type: 'strips',
        cells: [
            { u: 0, v: 0, w: 0.25, h: 1 },
            { u: 0.25, v: 0, w: 0.25, h: 1 },
            { u: 0.5, v: 0, w: 0.25, h: 1 },
            { u: 0.75, v: 0, w: 0.25, h: 1 }
        ]
    },

    // Grids
    'grid_2x2': {
        name: '2x2 Grid',
        category: 'grid-templates',
        type: 'grid',
        cells: [
            { u: 0, v: 0, w: 0.5, h: 0.5 }, { u: 0.5, v: 0, w: 0.5, h: 0.5 },
            { u: 0, v: 0.5, w: 0.5, h: 0.5 }, { u: 0.5, v: 0.5, w: 0.5, h: 0.5 }
        ]
    },
    'grid_4x4': {
        name: '4x4 Grid',
        category: 'grid-templates',
        type: 'grid',
        cells: Array(16).fill(0).map((_, i) => ({
            u: (i % 4) * 0.25,
            v: Math.floor(i / 4) * 0.25,
            w: 0.25,
            h: 0.25
        }))
    },

    // Modular
    'mod_floor_wall': {
        name: 'Floor & Wall',
        category: 'modular-templates',
        type: 'complex',
        cells: [
            { u: 0, v: 0, w: 1, h: 0.5 },
            { u: 0, v: 0.5, w: 1, h: 0.25 },
            { u: 0, v: 0.75, w: 0.5, h: 0.25 },
            { u: 0.5, v: 0.75, w: 0.5, h: 0.25 }
        ]
    }
};

// INIT
function init() {
    renderSidebar();
    loadTemplate(state.activeTemplateId);
    setupEvents();
    resizeCanvas();
    draw();
}

function loadTemplate(id) {
    if (!TEMPLATES[id]) return;
    state.activeTemplateId = id;
    // Deep copy and add IDs
    state.cells = JSON.parse(JSON.stringify(TEMPLATES[id].cells)).map(c => ({ ...c, id: uuid() }));
    state.selectedCell = null;

    // Highlight sidebar
    document.querySelectorAll('.template-item').forEach(e => e.classList.remove('active'));
    document.querySelector(`.template-item[data-id="${id}"]`)?.classList.add('active');

    draw();
}

function renderSidebar() {
    for (const [id, t] of Object.entries(TEMPLATES)) {
        const container = document.getElementById(t.category);
        if (!container) continue;

        const el = document.createElement('div');
        el.className = `template-item ${id === state.activeTemplateId ? 'active' : ''}`;
        el.dataset.id = id;
        el.innerHTML = `
            <svg class="template-preview" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect x="0" y="0" width="100" height="100" fill="none" stroke="#555" stroke-width="2"/>
                ${t.cells.map(c => `
                    <rect x="${c.u * 100}" y="${c.v * 100}" width="${c.w * 100}" height="${c.h * 100}" 
                          fill="none" stroke="#888" stroke-width="1"/>
                `).join('')}
            </svg>
            <div class="template-label">${t.name}</div>
        `;
        el.addEventListener('click', () => loadTemplate(id));
        container.appendChild(el);
    }
}

function resizeCanvas() {
    canvas.width = state.resolution;
    canvas.height = state.resolution;
}

function getSnappedValue(val) {
    if (state.snap === 0) return val;
    const px = val * state.resolution;
    const snappedPx = Math.round(px / state.snap) * state.snap;
    return snappedPx / state.resolution;
}

// LOGIC: Modifiers
function splitCellHorizontal() {
    if (!state.selectedCell) return;
    const c = state.selectedCell;
    const newH = c.h / 2;

    c.h = newH;
    const newCell = {
        id: uuid(),
        u: c.u,
        v: c.v + newH,
        w: c.w,
        h: newH
    };
    state.cells.push(newCell);
    state.selectedCell = newCell;
    draw();
}

function splitCellVertical() {
    if (!state.selectedCell) return;
    const c = state.selectedCell;
    const newW = c.w / 2;

    c.w = newW;
    const newCell = {
        id: uuid(),
        u: c.u + newW,
        v: c.v,
        w: newW,
        h: c.h
    };
    state.cells.push(newCell);
    state.selectedCell = newCell;
    draw();
}

function mergeSelected() {
    if (!state.selectedCell) return;
    const c = state.selectedCell;

    // Find neighbor
    const neighbor = state.cells.find(other =>
        other.id !== c.id && (
            // Top/Bottom match
            (Math.abs(other.u - c.u) < 0.001 && Math.abs(other.w - c.w) < 0.001 &&
                (Math.abs(other.v + other.h - c.v) < 0.001 || Math.abs(c.v + c.h - other.v) < 0.001)) ||
            // Left/Right match
            (Math.abs(other.v - c.v) < 0.001 && Math.abs(other.h - c.h) < 0.001 &&
                (Math.abs(other.u + other.w - c.u) < 0.001 || Math.abs(c.u + c.w - other.u) < 0.001))
        )
    );

    if (neighbor) {
        // Merge logic
        const minU = Math.min(c.u, neighbor.u);
        const minV = Math.min(c.v, neighbor.v);
        const maxU = Math.max(c.u + c.w, neighbor.u + neighbor.w);
        const maxV = Math.max(c.v + c.h, neighbor.v + neighbor.h);

        neighbor.u = minU;
        neighbor.v = minV;
        neighbor.w = maxU - minU;
        neighbor.h = maxV - minV;

        // Remove current
        state.cells = state.cells.filter(x => x.id !== c.id);
        state.selectedCell = neighbor;
        draw();
    } else {
        alert("Can only merge with an adjacent cell of equal edge length.");
    }
}


function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // BG
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = state.opacity;

    // Draw Cells
    state.cells.forEach(cell => {
        const x = cell.u * canvas.width;
        const y = cell.v * canvas.height;
        const w = cell.w * canvas.width;
        const h = cell.h * canvas.height;

        // Fill
        const isSelected = state.selectedCell && state.selectedCell.id === cell.id;
        ctx.fillStyle = isSelected ? '#2a2a35' : '#111';
        ctx.fillRect(x, y, w, h);

        // Stroke
        ctx.lineWidth = Math.max(2, canvas.width / 500);
        ctx.strokeStyle = isSelected ? '#88AAFF' : '#646cff';
        ctx.strokeRect(x, y, w, h);

        // Text
        if (state.showUvs) {
            ctx.fillStyle = '#fff';
            const fontSize = Math.max(12, canvas.width / 50);
            ctx.font = `${fontSize}px monospace`;

            // Format UVs
            const hPx = Math.round(cell.h * state.resolution);
            const wPx = Math.round(cell.w * state.resolution);

            const textX = x + w / 2;
            const textY = y + h / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (h > canvas.height * 0.05) {
                // Determine if we show vertical or horizontal info based on aspect
                if (hPx >= 32) {
                    ctx.fillStyle = '#888';
                    ctx.fillText(`${hPx}px`, textX, textY);
                }
            }
        }
    });

    ctx.globalAlpha = 1.0;
}

function setupEvents() {
    resolutionSelect.addEventListener('change', (e) => {
        state.resolution = parseInt(e.target.value);
        resizeCanvas();
        draw();
    });

    showUvsCheckbox.addEventListener('change', (e) => {
        state.showUvs = e.target.checked;
        draw();
    });

    opacitySlider.addEventListener('input', (e) => {
        state.opacity = parseFloat(e.target.value);
        draw();
    });

    snapSelect.addEventListener('change', (e) => {
        state.snap = parseInt(e.target.value);
    });

    splitHBtn.addEventListener('click', splitCellHorizontal);
    splitVBtn.addEventListener('click', splitCellVertical);
    deleteBtn.addEventListener('click', mergeSelected);

    // MOUSE LOGIC for Dragging
    const getUV = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            u: (e.clientX - rect.left) / rect.width,
            v: (e.clientY - rect.top) / rect.height
        };
    };

    let dragTarget = null; // { cells: [], type: 'edge_v' | 'edge_h', initialVal: float }

    canvas.addEventListener('mousedown', (e) => {
        const { u, v } = getUV(e);
        const threshold = 10 / canvas.getBoundingClientRect().width; // ~10px threshold

        // Check for Edge Click (for resizing)
        // Find edges close to cursor
        // This is complex because edges are shared.
        // Simplified: Loop all cells, see if we are near any edge.

        let foundEdge = null;

        for (let cell of state.cells) {
            // Right Edge
            if (Math.abs((cell.u + cell.w) - u) < threshold && v >= cell.v && v <= cell.v + cell.h) {
                foundEdge = { type: 'right', cell: cell };
                break;
            }
            // Bottom Edge
            if (Math.abs((cell.v + cell.h) - v) < threshold && u >= cell.u && u <= cell.u + cell.w) {
                foundEdge = { type: 'bottom', cell: cell };
                break;
            }
        }

        if (foundEdge) {
            // Find all cells that share this edge line to resize them together
            // e.g. if we drag a horiz line, we need to find all cells that end at this V, AND all cells that START at this V?
            // Actually, "Dragging grid lines" usually means moving a divider.
            // If we move a divider, the cell ABOVE gets bigger, the cell BELOW gets smaller.

            let affectedAbove = [];
            let affectedBelow = [];

            if (foundEdge.type === 'bottom') {
                const lineV = foundEdge.cell.v + foundEdge.cell.h;
                // Find all cells ending at lineV
                affectedAbove = state.cells.filter(c => Math.abs((c.v + c.h) - lineV) < 0.001);
                // Find all cells starting at lineV
                affectedBelow = state.cells.filter(c => Math.abs(c.v - lineV) < 0.001);

                if (affectedAbove.length > 0) {
                    dragTarget = { type: 'h', above: affectedAbove, below: affectedBelow, startVal: lineV };
                }
            } else if (foundEdge.type === 'right') {
                const lineU = foundEdge.cell.u + foundEdge.cell.w;
                affectedAbove = state.cells.filter(c => Math.abs((c.u + c.w) - lineU) < 0.001);
                affectedBelow = state.cells.filter(c => Math.abs(c.u - lineU) < 0.001);

                if (affectedAbove.length > 0) {
                    dragTarget = { type: 'v', left: affectedAbove, right: affectedBelow, startVal: lineU };
                }
            }
        }

        if (!dragTarget) {
            // Select Cell logic
            const clicked = state.cells.find(c => u >= c.u && u <= c.u + c.w && v >= c.v && v <= c.v + c.h);
            state.selectedCell = clicked || null;
            draw();

            if (clicked) {
                // Update Tooltip
                uvTooltip.classList.remove('hidden');
                updateTooltip(clicked, e);
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const { u, v } = getUV(e);

        if (dragTarget) {
            // Dragging behavior
            if (dragTarget.type === 'h') {
                let newV = Math.max(0, Math.min(1, v));
                newV = getSnappedValue(newV);

                // Limit by adjacent cell sizes (don't invert)
                // Min is max of above starts
                // Max is min of below ends
                // Simplified: Just update

                dragTarget.above.forEach(c => { c.h = newV - c.v; });
                dragTarget.below.forEach(c => {
                    const oldEnd = c.v + c.h;
                    c.v = newV;
                    c.h = oldEnd - newV;
                });

            } else if (dragTarget.type === 'v') {
                let newU = Math.max(0, Math.min(1, u));
                newU = getSnappedValue(newU);

                dragTarget.left.forEach(c => { c.w = newU - c.u; });
                dragTarget.right.forEach(c => {
                    const oldEnd = c.u + c.w;
                    c.u = newU;
                    c.w = oldEnd - newU;
                });
            }
            draw();
            return;
        }

        // Hover / Cursor Logic
        const threshold = 10 / canvas.getBoundingClientRect().width;
        let setCursor = 'default';

        for (let cell of state.cells) {
            if (Math.abs((cell.v + cell.h) - v) < threshold && u >= cell.u && u <= cell.u + cell.w) {
                setCursor = 'ns-resize'; break;
            }
            if (Math.abs((cell.u + cell.w) - u) < threshold && v >= cell.v && v <= cell.v + cell.h) {
                setCursor = 'ew-resize'; break;
            }
        }
        canvas.style.cursor = setCursor;

        // Tooltip updates if not dragging
        const hovered = state.cells.find(c => u >= c.u && u <= c.u + c.w && v >= c.v && v <= c.v + c.h);
        if (hovered) {
            uvTooltip.classList.remove('hidden');
            uvTooltip.style.left = `${e.clientX + 15}px`;
            uvTooltip.style.top = `${e.clientY + 15}px`;
            updateTooltip(hovered);
        } else {
            uvTooltip.classList.add('hidden');
        }
    });

    canvas.addEventListener('mouseup', () => {
        dragTarget = null;
    });

    canvas.addEventListener('mouseleave', () => {
        dragTarget = null;
        uvTooltip.classList.add('hidden');
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `trim-sheet-layout.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    document.getElementById('export-json-btn').addEventListener('click', () => {
        const data = {
            resolution: state.resolution,
            layout_id: state.activeTemplateId,
            cells: state.cells.map(c => ({
                id: c.id,
                u: c.u,
                v: c.v,
                w: c.w,
                h: c.h,
                pixel_x: Math.round(c.u * state.resolution),
                pixel_y: Math.round(c.v * state.resolution),
                pixel_w: Math.round(c.w * state.resolution),
                pixel_h: Math.round(c.h * state.resolution)
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'trim-sheet-data.json';
        link.href = URL.createObjectURL(blob);
        link.click();
    });
}

function updateTooltip(cell) {
    document.getElementById('u-val').textContent = `${cell.u.toFixed(3)} - ${(cell.u + cell.w).toFixed(3)}`;
    document.getElementById('v-val').textContent = `${cell.v.toFixed(3)} - ${(cell.v + cell.h).toFixed(3)}`;
    document.getElementById('h-px').textContent = `${Math.round(cell.h * state.resolution)}px H`;
}

init();
