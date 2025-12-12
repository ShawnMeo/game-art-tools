/**
 * Pipeline Engine - State Machine for 3D Asset Tracking
 * Manages asset states, transitions, and dependencies
 */

// Embedded configuration (avoids CORS issues with file:// protocol)
const PIPELINE_CONFIG = {
    name: "3D Game Asset Pipeline",
    version: "1.0.0",
    stages: [
        { id: "concept", name: "Concept Art", icon: "🎨", color: "#9b59b6", description: "Initial concept sketches and reference gathering" },
        { id: "blockout", name: "Blockout", icon: "📦", color: "#3498db", description: "Basic shapes and proportions" },
        { id: "highpoly", name: "High-Poly", icon: "💎", color: "#e74c3c", description: "Detailed sculpt with all surface detail" },
        { id: "lowpoly", name: "Low-Poly", icon: "🔷", color: "#f39c12", description: "Game-ready topology" },
        { id: "uv", name: "UV Layout", icon: "🗺️", color: "#1abc9c", description: "UV unwrapping and layout optimization" },
        { id: "bake", name: "Baking", icon: "🔥", color: "#e67e22", description: "Normal, AO, and other map baking" },
        { id: "texture", name: "Texturing", icon: "🖌️", color: "#2ecc71", description: "Material and texture painting" },
        { id: "export", name: "Engine Export", icon: "🚀", color: "#00d4ff", description: "Final export to game engine" }
    ],
    transitions: [
        { from: "concept", to: "blockout" },
        { from: "blockout", to: "highpoly" },
        { from: "highpoly", to: "lowpoly" },
        { from: "lowpoly", to: "uv" },
        { from: "uv", to: "bake" },
        { from: "bake", to: "texture" },
        { from: "texture", to: "export" }
    ],
    assetTypes: [
        { id: "prop", name: "Prop", icon: "🪑" },
        { id: "character", name: "Character", icon: "🧑" },
        { id: "weapon", name: "Weapon", icon: "⚔️" },
        { id: "vehicle", name: "Vehicle", icon: "🚗" },
        { id: "environment", name: "Environment", icon: "🏔️" }
    ]
};

class PipelineEngine {
    constructor() {
        this.assets = new Map();
        this.config = null;
        this.listeners = new Set();
        this.history = [];
    }

    /**
     * Initialize with pipeline configuration
     */
    async init() {
        try {
            // Use embedded config (no fetch needed)
            this.config = PIPELINE_CONFIG;
            this.loadFromStorage();
            this.emit('initialized', { config: this.config });
            console.log('✅ Pipeline Engine initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize pipeline:', error);
            return false;
        }
    }

    /**
     * Register a new asset in the pipeline
     */
    createAsset(data) {
        const asset = {
            id: data.id || this.generateId(),
            name: data.name,
            type: data.type || 'prop',
            stage: data.stage || this.config.stages[0].id,
            dependencies: data.dependencies || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            history: [{
                stage: data.stage || this.config.stages[0].id,
                timestamp: new Date().toISOString(),
                action: 'created'
            }],
            notes: data.notes || '',
            metadata: data.metadata || {}
        };

        this.assets.set(asset.id, asset);
        this.saveToStorage();
        this.emit('assetCreated', asset);
        this.logHistory('create', asset);
        return asset;
    }

    /**
     * Get asset by ID
     */
    getAsset(id) {
        return this.assets.get(id);
    }

    /**
     * Get all assets
     */
    getAllAssets() {
        return Array.from(this.assets.values());
    }

    /**
     * Get assets by stage
     */
    getAssetsByStage(stageId) {
        return this.getAllAssets().filter(a => a.stage === stageId);
    }

    /**
     * Get stage info by ID
     */
    getStage(stageId) {
        return this.config.stages.find(s => s.id === stageId);
    }

    /**
     * Check if transition is valid
     */
    canTransition(assetId, toStage) {
        const asset = this.getAsset(assetId);
        if (!asset) return false;

        // Check if transition exists in config
        const validTransition = this.config.transitions.some(
            t => t.from === asset.stage && t.to === toStage
        );

        // Also allow moving backwards (for revisions)
        const stageIndex = this.config.stages.findIndex(s => s.id === asset.stage);
        const toIndex = this.config.stages.findIndex(s => s.id === toStage);
        const isBackward = toIndex < stageIndex;

        return validTransition || isBackward;
    }

    /**
     * Advance asset to next stage
     */
    advanceStage(assetId) {
        const asset = this.getAsset(assetId);
        if (!asset) return null;

        const currentIndex = this.config.stages.findIndex(s => s.id === asset.stage);
        if (currentIndex >= this.config.stages.length - 1) {
            return null; // Already at final stage
        }

        const nextStage = this.config.stages[currentIndex + 1];
        return this.transitionTo(assetId, nextStage.id);
    }

    /**
     * Move asset to specific stage
     */
    transitionTo(assetId, toStage) {
        const asset = this.getAsset(assetId);
        if (!asset) return null;

        const fromStage = asset.stage;
        asset.stage = toStage;
        asset.updatedAt = new Date().toISOString();
        asset.history.push({
            stage: toStage,
            from: fromStage,
            timestamp: new Date().toISOString(),
            action: 'transition'
        });

        this.saveToStorage();
        this.emit('stageChanged', { asset, from: fromStage, to: toStage });
        this.logHistory('transition', asset, { from: fromStage, to: toStage });
        return asset;
    }

    /**
     * Add dependency between assets
     */
    addDependency(assetId, dependsOnId) {
        const asset = this.getAsset(assetId);
        const dependency = this.getAsset(dependsOnId);

        if (!asset || !dependency) return false;
        if (asset.dependencies.includes(dependsOnId)) return false;
        if (this.wouldCreateCycle(assetId, dependsOnId)) return false;

        asset.dependencies.push(dependsOnId);
        asset.updatedAt = new Date().toISOString();

        this.saveToStorage();
        this.emit('dependencyAdded', { asset, dependency });
        return true;
    }

    /**
     * Remove dependency
     */
    removeDependency(assetId, dependsOnId) {
        const asset = this.getAsset(assetId);
        if (!asset) return false;

        const index = asset.dependencies.indexOf(dependsOnId);
        if (index === -1) return false;

        asset.dependencies.splice(index, 1);
        asset.updatedAt = new Date().toISOString();

        this.saveToStorage();
        this.emit('dependencyRemoved', { assetId, dependsOnId });
        return true;
    }

    /**
     * Check if adding dependency would create a cycle
     */
    wouldCreateCycle(assetId, dependsOnId) {
        const visited = new Set();
        const stack = [dependsOnId];

        while (stack.length > 0) {
            const current = stack.pop();
            if (current === assetId) return true;
            if (visited.has(current)) continue;
            visited.add(current);

            const asset = this.getAsset(current);
            if (asset) {
                stack.push(...asset.dependencies);
            }
        }
        return false;
    }

    /**
     * Get dependency graph data for D3.js
     */
    getDependencyGraph() {
        const nodes = this.getAllAssets().map(asset => ({
            id: asset.id,
            name: asset.name,
            type: asset.type,
            stage: asset.stage,
            stageInfo: this.getStage(asset.stage)
        }));

        const links = [];
        this.getAllAssets().forEach(asset => {
            asset.dependencies.forEach(depId => {
                links.push({
                    source: depId,
                    target: asset.id
                });
            });
        });

        return { nodes, links };
    }

    /**
     * Delete an asset
     */
    deleteAsset(assetId) {
        const asset = this.getAsset(assetId);
        if (!asset) return false;

        // Remove from other assets' dependencies
        this.getAllAssets().forEach(a => {
            const index = a.dependencies.indexOf(assetId);
            if (index !== -1) {
                a.dependencies.splice(index, 1);
            }
        });

        this.assets.delete(assetId);
        this.saveToStorage();
        this.emit('assetDeleted', { id: assetId, asset });
        this.logHistory('delete', asset);
        return true;
    }

    /**
     * Update asset properties
     */
    updateAsset(assetId, updates) {
        const asset = this.getAsset(assetId);
        if (!asset) return null;

        Object.assign(asset, updates, { updatedAt: new Date().toISOString() });
        this.saveToStorage();
        this.emit('assetUpdated', asset);
        return asset;
    }

    /**
     * Get pipeline statistics
     */
    getStats() {
        const assets = this.getAllAssets();
        const byStage = {};
        const byType = {};

        this.config.stages.forEach(s => byStage[s.id] = 0);
        this.config.assetTypes.forEach(t => byType[t.id] = 0);

        assets.forEach(a => {
            byStage[a.stage] = (byStage[a.stage] || 0) + 1;
            byType[a.type] = (byType[a.type] || 0) + 1;
        });

        return {
            total: assets.length,
            byStage,
            byType,
            completed: byStage['export'] || 0
        };
    }

    // Event system
    on(event, callback) {
        this.listeners.add({ event, callback });
    }

    off(event, callback) {
        this.listeners.forEach(l => {
            if (l.event === event && l.callback === callback) {
                this.listeners.delete(l);
            }
        });
    }

    emit(event, data) {
        this.listeners.forEach(l => {
            if (l.event === event) {
                l.callback(data);
            }
        });
    }

    // Persistence
    saveToStorage() {
        const data = {
            assets: Array.from(this.assets.entries()),
            history: this.history.slice(-100) // Keep last 100 entries
        };
        localStorage.setItem('pipeline_data', JSON.stringify(data));
    }

    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('pipeline_data'));
            if (data) {
                this.assets = new Map(data.assets);
                this.history = data.history || [];
            }
        } catch (e) {
            console.warn('No existing pipeline data found');
        }
    }

    clearStorage() {
        localStorage.removeItem('pipeline_data');
        this.assets.clear();
        this.history = [];
        this.emit('cleared', {});
    }

    // History logging
    logHistory(action, asset, extra = {}) {
        this.history.push({
            action,
            assetId: asset.id,
            assetName: asset.name,
            timestamp: new Date().toISOString(),
            ...extra
        });
    }

    getHistory(limit = 50) {
        return this.history.slice(-limit).reverse();
    }

    // Utility
    generateId() {
        return 'asset_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}

// Export for use
window.PipelineEngine = PipelineEngine;
