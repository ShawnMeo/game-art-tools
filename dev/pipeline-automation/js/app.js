/**
 * Main Application - Pipeline Dashboard Controller
 * Ties together all components and handles UI interactions
 */

class PipelineApp {
    constructor() {
        this.engine = new PipelineEngine();
        this.graph = null;
        this.flow = null;
        this.selectedAsset = null;
    }

    async init() {
        // Initialize engine
        await this.engine.init();

        // Initialize visualizations
        this.graph = new DependencyGraph('dependency-graph', this.engine);
        this.flow = new FlowDiagram('flow-diagram', this.engine);

        // Setup UI handlers
        this.setupEventListeners();
        this.updateSidebar();
        this.updateHistoryLog();

        console.log('🚀 Pipeline Dashboard initialized');
    }

    setupEventListeners() {
        // Import Folder button
        document.getElementById('btn-import-folder').addEventListener('click', () => {
            this.importFromFolder();
        });

        // Add Asset button
        document.getElementById('btn-add-asset').addEventListener('click', () => {
            this.showAddAssetModal();
        });

        // Demo button
        document.getElementById('btn-demo').addEventListener('click', () => {
            this.addDemoAssets();
        });

        // Clear All button
        document.getElementById('btn-clear-all').addEventListener('click', () => {
            this.showConfirm('Clear All Assets', 'This will delete all assets. This cannot be undone.', 'Clear All')
                .then(() => {
                    this.engine.clearStorage();
                    this.updateSidebar();
                    this.updateHistoryLog();
                    this.showToast('All assets cleared');
                });
        });

        // Fit View button
        document.getElementById('btn-fit-view').addEventListener('click', () => {
            this.graph.fitToView();
        });

        // Center View button
        document.getElementById('btn-center-view').addEventListener('click', () => {
            this.graph.centerView();
        });

        // Toast event from graph
        window.addEventListener('showToast', (e) => {
            this.showToast(e.detail);
        });

        // Link clicked event - for removing dependencies
        window.addEventListener('linkClicked', (e) => {
            const { sourceId, targetId, sourceName, targetName } = e.detail;
            this.showConfirm(
                'Remove Link',
                `Remove dependency: "${sourceName}" → "${targetName}"?`,
                'Remove'
            ).then(() => {
                this.engine.removeDependency(targetId, sourceId);
                this.showToast('Link removed');
            });
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.hideModal();
            }
        });

        // Add Asset form
        document.getElementById('add-asset-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddAsset();
        });

        // Node selection from graph
        window.addEventListener('nodeSelected', (e) => {
            this.selectAsset(e.detail.id);
        });

        // Stage selection from flow
        window.addEventListener('stageSelected', (e) => {
            this.showStageAssets(e.detail.stage, e.detail.assets);
        });

        // Engine events
        this.engine.on('assetCreated', () => {
            this.updateSidebar();
            this.updateHistoryLog();
        });

        this.engine.on('assetDeleted', () => {
            this.updateSidebar();
            this.updateHistoryLog();
            this.selectedAsset = null;
        });

        this.engine.on('stageChanged', () => {
            this.updateSidebar();
            this.updateHistoryLog();
        });

        this.engine.on('cleared', () => {
            this.updateSidebar();
            this.updateHistoryLog();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.graph.deselectAll();
                this.selectedAsset = null;
            }
            if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.showAddAssetModal();
            }
        });
    }

    showAddAssetModal() {
        const modal = document.getElementById('modal-overlay');
        const form = document.getElementById('add-asset-form');

        // Populate stage select
        const stageSelect = document.getElementById('asset-stage');
        stageSelect.innerHTML = this.engine.config.stages.map(s =>
            `<option value="${s.id}">${s.icon} ${s.name}</option>`
        ).join('');

        // Populate type select
        const typeSelect = document.getElementById('asset-type');
        typeSelect.innerHTML = this.engine.config.assetTypes.map(t =>
            `<option value="${t.id}">${t.icon} ${t.name}</option>`
        ).join('');

        // Populate dependencies
        const depsSelect = document.getElementById('asset-dependencies');
        const assets = this.engine.getAllAssets();
        depsSelect.innerHTML = assets.length === 0
            ? '<option value="" disabled>No assets yet</option>'
            : assets.map(a => `<option value="${a.id}">${a.name}</option>`).join('');

        // Reset form
        form.reset();
        modal.classList.add('active');
        document.getElementById('asset-name').focus();
    }

    hideModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }

    handleAddAsset() {
        const name = document.getElementById('asset-name').value.trim();
        const type = document.getElementById('asset-type').value;
        const stage = document.getElementById('asset-stage').value;
        const depsSelect = document.getElementById('asset-dependencies');
        const dependencies = Array.from(depsSelect.selectedOptions).map(o => o.value);
        const notes = document.getElementById('asset-notes').value.trim();

        if (!name) return;

        this.engine.createAsset({
            name,
            type,
            stage,
            dependencies,
            notes
        });

        this.hideModal();
    }

    selectAsset(assetId) {
        this.selectedAsset = this.engine.getAsset(assetId);
        this.updateAssetDetails();
    }

    updateSidebar() {
        const outliner = document.getElementById('asset-outliner');
        const countBadge = document.getElementById('asset-count');
        const assets = this.engine.getAllAssets();

        // Update count badge
        countBadge.textContent = assets.length;

        if (assets.length === 0) {
            outliner.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <div class="empty-text">No assets yet</div>
                    <div class="empty-hint">Import a folder or add assets manually</div>
                </div>
            `;
            return;
        }

        // Group assets by stage
        const stages = this.engine.config.stages;
        const groupedAssets = {};

        stages.forEach(stage => {
            groupedAssets[stage.id] = assets.filter(a => a.stage === stage.id);
        });

        // Build outliner HTML
        outliner.innerHTML = stages.map(stage => {
            const stageAssets = groupedAssets[stage.id];
            if (stageAssets.length === 0) return ''; // Skip empty stages

            return `
                <div class="outliner-group" data-stage="${stage.id}">
                    <div class="outliner-header">
                        <span class="outliner-toggle">▼</span>
                        <span class="outliner-icon">${stage.icon}</span>
                        <span class="outliner-label" style="color: ${stage.color}">${stage.name}</span>
                        <span class="outliner-count">${stageAssets.length}</span>
                    </div>
                    <div class="outliner-items">
                        ${stageAssets.map(asset => {
                const type = this.engine.config.assetTypes.find(t => t.id === asset.type);
                const isSelected = this.selectedAsset?.id === asset.id;
                return `
                                <div class="outliner-item ${isSelected ? 'selected' : ''}" data-id="${asset.id}">
                                    <span class="outliner-item-icon">${type?.icon || '📦'}</span>
                                    <span class="outliner-item-name">${asset.name}</span>
                                    <div class="outliner-item-actions">
                                        <button class="outliner-btn promote" title="Advance Stage">⏫</button>
                                        <button class="outliner-btn delete" title="Delete">×</button>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for group headers (collapse/expand)
        outliner.querySelectorAll('.outliner-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('collapsed');
            });
        });

        // Add event listeners for items
        outliner.querySelectorAll('.outliner-item').forEach(item => {
            const id = item.dataset.id;

            item.addEventListener('click', (e) => {
                if (!e.target.closest('.outliner-btn')) {
                    this.selectAsset(id);
                    this.updateSidebar();
                }
            });

            item.querySelector('.outliner-btn.promote')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.engine.advanceStage(id);
            });

            item.querySelector('.outliner-btn.delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const asset = this.engine.getAsset(id);
                this.showConfirm('Delete Asset', `Delete "${asset?.name}"?`, 'Delete')
                    .then(() => {
                        this.engine.deleteAsset(id);
                        this.showToast('Asset deleted');
                    });
            });
        });
    }

    updateAssetDetails() {
        const detailsPanel = document.getElementById('asset-details');

        if (!this.selectedAsset) {
            detailsPanel.innerHTML = `
                <div class="empty-state">
                    <div class="empty-text">Select an asset to see details</div>
                </div>
            `;
            return;
        }

        const asset = this.selectedAsset;
        const stage = this.engine.getStage(asset.stage);
        const type = this.engine.config.assetTypes.find(t => t.id === asset.type);

        detailsPanel.innerHTML = `
            <div class="details-header">
                <span class="details-icon">${type?.icon || '📦'}</span>
                <h3>${asset.name}</h3>
            </div>
            <div class="details-stage" style="background: ${stage?.color}20; border-color: ${stage?.color}">
                ${stage?.icon} ${stage?.name}
            </div>
            <div class="details-meta">
                <div class="meta-item">
                    <span class="meta-label">Type:</span>
                    <span class="meta-value">${type?.name || asset.type}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Created:</span>
                    <span class="meta-value">${new Date(asset.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Updated:</span>
                    <span class="meta-value">${new Date(asset.updatedAt).toLocaleString()}</span>
                </div>
            </div>
            ${asset.notes ? `<div class="details-notes">${asset.notes}</div>` : ''}
            <div class="details-dependencies">
                <h4>Dependencies</h4>
                <div class="dep-list" id="dep-list">
                    ${this.renderDependencies(asset)}
                </div>
                <div class="dep-add">
                    <select id="add-dep-select">
                        <option value="">+ Add dependency...</option>
                        ${this.getAvailableDependencies(asset).map(a =>
            `<option value="${a.id}">${a.name}</option>`
        ).join('')}
                    </select>
                </div>
            </div>
            <div class="details-history">
                <h4>History</h4>
                <div class="history-entries">
                    ${asset.history.slice().reverse().map(h => `
                        <div class="history-entry">
                            <span class="history-action">${h.action}</span>
                            <span class="history-stage">${this.engine.getStage(h.stage)?.name || h.stage}</span>
                            <span class="history-time">${new Date(h.timestamp).toLocaleTimeString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="details-actions">
                <button id="btn-advance-selected" class="btn-primary">⏭️ Advance Stage</button>
                <button id="btn-delete-selected" class="btn-danger">🗑️ Delete</button>
            </div>
        `;

        // Add action handlers
        document.getElementById('btn-advance-selected').addEventListener('click', () => {
            this.engine.advanceStage(asset.id);
            this.selectedAsset = this.engine.getAsset(asset.id);
            this.updateAssetDetails();
        });

        document.getElementById('btn-delete-selected').addEventListener('click', () => {
            this.showConfirm('Delete Asset', `Delete "${asset.name}"?`, 'Delete')
                .then(() => {
                    this.engine.deleteAsset(asset.id);
                    this.selectedAsset = null;
                    this.updateAssetDetails();
                    this.showToast('Asset deleted');
                });
        });

        // Remove dependency buttons
        document.querySelectorAll('.dep-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const depId = e.target.dataset.depId;
                const depAsset = this.engine.getAsset(depId);
                this.engine.removeDependency(asset.id, depId);
                this.showToast(`Removed dependency on "${depAsset?.name || 'asset'}"`);
                this.updateAssetDetails();
            });
        });

        // Add dependency select
        document.getElementById('add-dep-select').addEventListener('change', (e) => {
            const depId = e.target.value;
            if (depId) {
                const depAsset = this.engine.getAsset(depId);
                this.engine.addDependency(asset.id, depId);
                this.showToast(`Added dependency on "${depAsset?.name || 'asset'}"`);
                this.updateAssetDetails();
            }
        });
    }

    renderDependencies(asset) {
        if (asset.dependencies.length === 0) {
            return '<div class="dep-empty">No dependencies</div>';
        }

        return asset.dependencies.map(depId => {
            const dep = this.engine.getAsset(depId);
            if (!dep) return '';
            const stage = this.engine.getStage(dep.stage);
            return `
                <div class="dep-item">
                    <span class="dep-name" style="color: ${stage?.color || '#888'}">
                        ${dep.name}
                    </span>
                    <button class="dep-remove" data-dep-id="${depId}" title="Remove dependency">×</button>
                </div>
            `;
        }).join('');
    }

    getAvailableDependencies(asset) {
        // Get assets that could be added as dependencies
        // Exclude: self, already dependencies, and assets that would create a cycle
        const available = this.engine.getAllAssets().filter(a => {
            if (a.id === asset.id) return false;
            if (asset.dependencies.includes(a.id)) return false;
            if (this.engine.wouldCreateCycle(asset.id, a.id)) return false;
            return true;
        });
        return available;
    }

    showStageAssets(stage, assets) {
        const assetList = document.getElementById('asset-list');

        if (assets.length === 0) {
            // Show toast notification
            this.showToast(`No assets in ${stage.name}`);
            return;
        }

        // Highlight assets in this stage
        assetList.querySelectorAll('.asset-card').forEach(card => {
            const asset = this.engine.getAsset(card.dataset.id);
            if (asset && asset.stage === stage.id) {
                card.classList.add('highlighted');
            } else {
                card.classList.remove('highlighted');
            }
        });

        // Clear highlight after 2 seconds
        setTimeout(() => {
            assetList.querySelectorAll('.asset-card').forEach(card => {
                card.classList.remove('highlighted');
            });
        }, 2000);
    }

    updateHistoryLog() {
        const logContainer = document.getElementById('history-log');
        const history = this.engine.getHistory(20);

        if (history.length === 0) {
            logContainer.innerHTML = '<div class="log-empty">No history yet</div>';
            return;
        }

        logContainer.innerHTML = history.map(entry => {
            const actionIcons = {
                create: '➕',
                transition: '➡️',
                delete: '🗑️'
            };

            return `
                <div class="log-entry">
                    <span class="log-icon">${actionIcons[entry.action] || '📝'}</span>
                    <span class="log-content">
                        <strong>${entry.assetName}</strong>
                        ${entry.action === 'transition'
                    ? `moved to ${this.engine.getStage(entry.to)?.name || entry.to}`
                    : entry.action}
                    </span>
                    <span class="log-time">${new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
            `;
        }).join('');
    }

    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Demo: Add sample assets
    addDemoAssets() {
        // Guard: ensure engine is initialized
        if (!this.engine.config) {
            console.warn('Engine not initialized yet');
            return;
        }

        const demoAssets = [
            { name: 'Sci-Fi Crate', type: 'prop', stage: 'texture' },
            { name: 'Character Base', type: 'character', stage: 'highpoly' },
            { name: 'Laser Rifle', type: 'weapon', stage: 'uv', dependencies: [] },
            { name: 'Hover Vehicle', type: 'vehicle', stage: 'blockout' },
            { name: 'Wall Panel', type: 'environment', stage: 'bake' }
        ];

        demoAssets.forEach(data => {
            this.engine.createAsset(data);
        });

        // Add some dependencies
        const assets = this.engine.getAllAssets();
        if (assets.length >= 3) {
            this.engine.addDependency(assets[2].id, assets[0].id);
        }
    }

    // Custom confirm modal (replaces native confirm())
    showConfirm(title, message, confirmText = 'Confirm') {
        return new Promise((resolve, reject) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');

            titleEl.textContent = title;
            messageEl.textContent = message;
            okBtn.textContent = confirmText;

            const cleanup = () => {
                modal.classList.remove('active');
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            const handleOk = () => {
                cleanup();
                resolve();
            };

            const handleCancel = () => {
                cleanup();
                reject();
            };

            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);

            modal.classList.add('active');
        });
    }

    // Import assets from a folder using File System Access API
    async importFromFolder() {
        // Check if API is supported
        if (!('showDirectoryPicker' in window)) {
            this.showToast('Folder import not supported in this browser. Use Chrome or Edge.');
            return;
        }

        try {
            // Open folder picker
            const dirHandle = await window.showDirectoryPicker({
                mode: 'read'
            });

            const files = [];
            const validExtensions = ['.fbx', '.obj', '.blend', '.max', '.ma', '.mb', '.ztl', '.abc', '.gltf', '.glb', '.usd', '.usda', '.usdc', '.usdz', '.psd', '.png', '.jpg', '.jpeg', '.tga', '.exr', '.tif', '.tiff'];

            // Recursively get all files
            await this.scanDirectory(dirHandle, '', files, validExtensions);

            if (files.length === 0) {
                this.showToast('No 3D/texture files found in folder');
                return;
            }

            // Infer asset type from file extension
            const getAssetType = (ext) => {
                if (['.psd', '.png', '.jpg', '.jpeg', '.tga', '.exr', '.tif', '.tiff'].includes(ext)) {
                    return 'prop'; // Textures
                }
                return 'prop'; // Default to prop for 3D files
            };

            // Infer stage from filename or folder structure
            const getStage = (path, name) => {
                const lower = (path + name).toLowerCase();
                if (lower.includes('concept') || lower.includes('ref')) return 'concept';
                if (lower.includes('blockout') || lower.includes('proxy')) return 'blockout';
                if (lower.includes('highpoly') || lower.includes('high_poly') || lower.includes('hp') || lower.includes('sculpt')) return 'highpoly';
                if (lower.includes('lowpoly') || lower.includes('low_poly') || lower.includes('lp') || lower.includes('game')) return 'lowpoly';
                if (lower.includes('uv')) return 'uv';
                if (lower.includes('bake') || lower.includes('normal') || lower.includes('ao')) return 'bake';
                if (lower.includes('texture') || lower.includes('material') || lower.includes('tex')) return 'texture';
                if (lower.includes('export') || lower.includes('final')) return 'export';
                return 'concept'; // Default to first stage
            };

            // Create assets from files
            let imported = 0;
            files.forEach(file => {
                const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                const baseName = file.name.substring(0, file.name.lastIndexOf('.'));

                this.engine.createAsset({
                    name: baseName,
                    type: getAssetType(ext),
                    stage: getStage(file.path, file.name),
                    notes: `Imported from: ${file.path}${file.name}`
                });
                imported++;
            });

            this.showToast(`Imported ${imported} assets from folder`);

        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Folder import error:', err);
                this.showToast('Error importing folder');
            }
        }
    }

    async scanDirectory(dirHandle, path, files, validExtensions) {
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file') {
                const ext = entry.name.substring(entry.name.lastIndexOf('.')).toLowerCase();
                if (validExtensions.includes(ext)) {
                    files.push({ name: entry.name, path: path });
                }
            } else if (entry.kind === 'directory') {
                await this.scanDirectory(entry, path + entry.name + '/', files, validExtensions);
            }
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PipelineApp();
    window.app.init();
});
