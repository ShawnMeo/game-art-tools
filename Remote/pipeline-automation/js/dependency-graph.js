/**
 * Dependency Graph - D3.js Force-Directed Visualization
 * Interactive graph showing asset relationships
 */

class DependencyGraph {
    constructor(containerId, engine) {
        this.container = document.getElementById(containerId);
        this.engine = engine;
        this.svg = null;
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        this.width = 0;
        this.height = 0;
        this.zoom = null;
        this.selectedNode = null;

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Clear any existing content
        this.container.innerHTML = '';

        // Get dimensions
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 800;
        this.height = rect.height || 500;

        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', [0, 0, this.width, this.height]);

        // Add zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Create main group for zoom/pan
        this.g = this.svg.append('g');

        // Add arrow marker for directed edges
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 25)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .append('path')
            .attr('d', 'M 0,-5 L 10,0 L 0,5')
            .attr('fill', '#666');

        // Create groups for links and nodes
        this.linkGroup = this.g.append('g').attr('class', 'links');
        this.nodeGroup = this.g.append('g').attr('class', 'nodes');

        // Initialize simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(50));

        // Initial render
        this.update();
    }

    setupEventListeners() {
        // Listen for engine events
        this.engine.on('assetCreated', () => this.update());
        this.engine.on('assetDeleted', () => this.update());
        this.engine.on('assetUpdated', () => this.update());
        this.engine.on('stageChanged', () => this.update());
        this.engine.on('dependencyAdded', () => this.update());
        this.engine.on('dependencyRemoved', () => this.update());
        this.engine.on('cleared', () => this.update());

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 800;
        this.height = rect.height || 500;

        this.svg.attr('viewBox', [0, 0, this.width, this.height]);
        this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.alpha(0.3).restart();
    }

    update() {
        const graphData = this.engine.getDependencyGraph();
        this.nodes = graphData.nodes;
        this.links = graphData.links;

        // Update links
        const link = this.linkGroup.selectAll('line')
            .data(this.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);

        link.exit().remove();

        const linkEnter = link.enter().append('line')
            .attr('stroke', '#444')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.6)
            .attr('marker-end', 'url(#arrowhead)')
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                event.stopPropagation();
                this.onLinkClick(d);
            })
            .on('mouseenter', (event) => {
                d3.select(event.currentTarget)
                    .attr('stroke', '#ff6b6b')
                    .attr('stroke-width', 4);
            })
            .on('mouseleave', (event) => {
                d3.select(event.currentTarget)
                    .attr('stroke', '#444')
                    .attr('stroke-width', 2);
            });

        const linkMerge = linkEnter.merge(link);

        // Update nodes
        const node = this.nodeGroup.selectAll('g.node')
            .data(this.nodes, d => d.id);

        node.exit()
            .transition()
            .duration(300)
            .attr('opacity', 0)
            .remove();

        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('opacity', 0)
            .call(d3.drag()
                .on('start', (event, d) => this.dragStart(event, d))
                .on('drag', (event, d) => this.dragging(event, d))
                .on('end', (event, d) => this.dragEnd(event, d)));

        nodeEnter.transition()
            .duration(300)
            .attr('opacity', 1);

        // Node circle with glow effect
        nodeEnter.append('circle')
            .attr('r', 24)
            .attr('fill', d => d.stageInfo?.color || '#666')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 0 8px rgba(0,212,255,0.5))')
            .style('cursor', 'pointer');

        // Node icon (emoji)
        nodeEnter.append('text')
            .attr('class', 'node-icon')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '16px')
            .style('pointer-events', 'none')
            .text(d => {
                const type = this.engine.config.assetTypes.find(t => t.id === d.type);
                return type?.icon || '📦';
            });

        // Node label
        nodeEnter.append('text')
            .attr('class', 'node-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '45px')
            .attr('fill', '#fff')
            .attr('font-size', '12px')
            .attr('font-weight', '500')
            .style('text-shadow', '0 0 4px rgba(0,0,0,0.8)')
            .text(d => d.name.length > 15 ? d.name.slice(0, 15) + '...' : d.name);

        // Stage label below name
        nodeEnter.append('text')
            .attr('class', 'stage-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '60px')
            .attr('fill', d => d.stageInfo?.color || '#888')
            .attr('font-size', '10px')
            .text(d => d.stageInfo?.name || 'Unknown');

        // Merge and add interactions
        const nodeMerge = nodeEnter.merge(node);

        nodeMerge.select('circle')
            .transition()
            .duration(300)
            .attr('fill', d => d.stageInfo?.color || '#666');

        nodeMerge.select('.stage-label')
            .text(d => d.stageInfo?.name || 'Unknown')
            .attr('fill', d => d.stageInfo?.color || '#888');

        // Click handler
        nodeMerge.on('click', (event, d) => {
            event.stopPropagation();
            this.selectNode(d);
        });

        // Hover effects
        nodeMerge
            .on('mouseenter', (event, d) => {
                d3.select(event.currentTarget).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 28)
                    .style('filter', 'drop-shadow(0 0 15px rgba(0,212,255,0.8))');
            })
            .on('mouseleave', (event, d) => {
                const isSelected = this.selectedNode?.id === d.id;
                d3.select(event.currentTarget).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', isSelected ? 28 : 24)
                    .style('filter', isSelected
                        ? 'drop-shadow(0 0 15px rgba(0,212,255,0.8))'
                        : 'drop-shadow(0 0 8px rgba(0,212,255,0.5))');
            });

        // Update simulation
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        this.simulation.alpha(0.5).restart();

        this.simulation.on('tick', () => {
            linkMerge
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            nodeMerge.attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    onLinkClick(linkData) {
        // Show option to remove the link
        const sourceName = linkData.source.name;
        const targetName = linkData.target.name;

        window.dispatchEvent(new CustomEvent('linkClicked', {
            detail: {
                sourceId: linkData.source.id,
                targetId: linkData.target.id,
                sourceName,
                targetName
            }
        }));
    }

    selectNode(nodeData) {
        this.selectedNode = nodeData;

        // Highlight selected node
        this.nodeGroup.selectAll('circle')
            .attr('stroke', d => d.id === nodeData.id ? '#00d4ff' : '#fff')
            .attr('stroke-width', d => d.id === nodeData.id ? 4 : 2);

        // Emit event for sidebar
        window.dispatchEvent(new CustomEvent('nodeSelected', { detail: nodeData }));
    }

    deselectAll() {
        this.selectedNode = null;
        this.nodeGroup.selectAll('circle')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('r', 24);
    }

    // Drag handlers
    dragStart(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragging(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragEnd(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Center view
    centerView() {
        this.svg.transition()
            .duration(500)
            .call(this.zoom.transform, d3.zoomIdentity);
    }

    // Fit all nodes in view
    fitToView() {
        if (this.nodes.length === 0) return;

        const bounds = {
            minX: d3.min(this.nodes, d => d.x) - 50,
            maxX: d3.max(this.nodes, d => d.x) + 50,
            minY: d3.min(this.nodes, d => d.y) - 50,
            maxY: d3.max(this.nodes, d => d.y) + 50
        };

        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        const scale = Math.min(
            this.width / width * 0.8,
            this.height / height * 0.8,
            2
        );

        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;

        this.svg.transition()
            .duration(500)
            .call(this.zoom.transform, d3.zoomIdentity
                .translate(this.width / 2, this.height / 2)
                .scale(scale)
                .translate(-centerX, -centerY));
    }
}

window.DependencyGraph = DependencyGraph;
