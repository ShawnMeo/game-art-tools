/**
 * Flow Diagram - Linear Pipeline Stage Visualization
 * Shows progression of assets through pipeline stages
 */

class FlowDiagram {
    constructor(containerId, engine) {
        this.container = document.getElementById(containerId);
        this.engine = engine;
        this.svg = null;
        this.stageElements = new Map();

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.render();
    }

    setupEventListeners() {
        this.engine.on('assetCreated', () => this.updateCounts());
        this.engine.on('assetDeleted', () => this.updateCounts());
        this.engine.on('stageChanged', () => this.updateCounts());
        this.engine.on('cleared', () => this.updateCounts());

        window.addEventListener('resize', () => this.render());
    }

    render() {
        const stages = this.engine.config.stages;
        const stats = this.engine.getStats();

        this.container.innerHTML = `
            <div class="flow-header">
                <h3>Pipeline Flow</h3>
                <div class="flow-stats">
                    <span class="stat-total">${stats.total} Assets</span>
                    <span class="stat-completed">${stats.completed} Completed</span>
                </div>
            </div>
            <div class="flow-stages">
                ${stages.map((stage, i) => this.renderStage(stage, i, stages.length, stats)).join('')}
            </div>
        `;

        // Add click handlers
        stages.forEach(stage => {
            const el = this.container.querySelector(`[data-stage="${stage.id}"]`);
            if (el) {
                el.addEventListener('click', () => this.onStageClick(stage));
            }
        });
    }

    renderStage(stage, index, total, stats) {
        const count = stats.byStage[stage.id] || 0;
        const isLast = index === total - 1;
        const hasAssets = count > 0;

        return `
            <div class="flow-stage-wrapper">
                <div class="flow-stage ${hasAssets ? 'has-assets' : ''}" 
                     data-stage="${stage.id}"
                     style="--stage-color: ${stage.color}">
                    <div class="stage-icon">${stage.icon}</div>
                    <div class="stage-info">
                        <div class="stage-name">${stage.name}</div>
                        <div class="stage-count">${count} asset${count !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="stage-glow" style="background: ${stage.color}"></div>
                </div>
                ${!isLast ? '<div class="flow-connector"><div class="connector-line"></div><div class="connector-arrow">→</div></div>' : ''}
            </div>
        `;
    }

    updateCounts() {
        const stats = this.engine.getStats();
        const stages = this.engine.config.stages;

        // Update header stats
        const totalEl = this.container.querySelector('.stat-total');
        const completedEl = this.container.querySelector('.stat-completed');
        if (totalEl) totalEl.textContent = `${stats.total} Assets`;
        if (completedEl) completedEl.textContent = `${stats.completed} Completed`;

        // Update each stage count
        stages.forEach(stage => {
            const stageEl = this.container.querySelector(`[data-stage="${stage.id}"]`);
            if (stageEl) {
                const count = stats.byStage[stage.id] || 0;
                const countEl = stageEl.querySelector('.stage-count');
                if (countEl) {
                    countEl.textContent = `${count} asset${count !== 1 ? 's' : ''}`;
                }

                // Toggle has-assets class
                if (count > 0) {
                    stageEl.classList.add('has-assets');
                } else {
                    stageEl.classList.remove('has-assets');
                }
            }
        });
    }

    onStageClick(stage) {
        const assets = this.engine.getAssetsByStage(stage.id);
        window.dispatchEvent(new CustomEvent('stageSelected', {
            detail: { stage, assets }
        }));
    }

    // Animate transition between stages
    animateTransition(assetId, fromStage, toStage) {
        const fromEl = this.container.querySelector(`[data-stage="${fromStage}"]`);
        const toEl = this.container.querySelector(`[data-stage="${toStage}"]`);

        if (fromEl && toEl) {
            // Create floating particle
            const particle = document.createElement('div');
            particle.className = 'transition-particle';
            this.container.appendChild(particle);

            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();
            const containerRect = this.container.getBoundingClientRect();

            particle.style.left = `${fromRect.left - containerRect.left + fromRect.width / 2}px`;
            particle.style.top = `${fromRect.top - containerRect.top + fromRect.height / 2}px`;

            // Animate to destination
            requestAnimationFrame(() => {
                particle.style.transition = 'all 0.5s ease-out';
                particle.style.left = `${toRect.left - containerRect.left + toRect.width / 2}px`;
                particle.style.top = `${toRect.top - containerRect.top + toRect.height / 2}px`;
                particle.style.opacity = '0';
            });

            setTimeout(() => particle.remove(), 500);
        }
    }
}

window.FlowDiagram = FlowDiagram;
