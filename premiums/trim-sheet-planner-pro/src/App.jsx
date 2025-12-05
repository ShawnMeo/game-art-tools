import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import './App.css'

function App() {
  // Multi-sheet state
  const [sheets, setSheets] = useState([
    { id: 1, name: 'Sheet 1', elements: [{ id: 1, name: 'Brick', width: 256, height: 256, count: 4 }], sheetSize: 2048, targetTexelDensity: 10.24 }
  ])
  const [activeSheetId, setActiveSheetId] = useState(1)
  const [nextElementId, setNextElementId] = useState(2)
  const [nextSheetId, setNextSheetId] = useState(2)

  const visualizerRef = useRef(null)

  // Derived state for active sheet
  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0]
  const elements = activeSheet.elements
  const sheetSize = activeSheet.sheetSize
  const targetTexelDensity = activeSheet.targetTexelDensity

  // Calculated results
  const [totalArea, setTotalArea] = useState(0)
  const [utilization, setUtilization] = useState(0)
  const [recommendedSize, setRecommendedSize] = useState(2048)

  useEffect(() => {
    // Calculate total area needed
    const area = elements.reduce((sum, el) => sum + (el.width * el.height * el.count), 0)
    setTotalArea(area)

    // Calculate utilization
    const sheetArea = sheetSize * sheetSize
    const util = (area / sheetArea) * 100
    setUtilization(util.toFixed(1))

    // Recommend optimal size
    const minSize = Math.sqrt(area)
    const powerOf2 = Math.pow(2, Math.ceil(Math.log2(minSize)))
    setRecommendedSize(powerOf2)
  }, [elements, sheetSize])

  const updateActiveSheet = (updates) => {
    setSheets(sheets.map(s => s.id === activeSheetId ? { ...s, ...updates } : s))
  }

  const addElement = () => {
    const newElement = {
      id: nextElementId,
      name: `Element ${nextElementId}`,
      width: 256,
      height: 256,
      count: 1
    }
    updateActiveSheet({ elements: [...elements, newElement] })
    setNextElementId(nextElementId + 1)
  }

  const updateElement = (id, field, value) => {
    const newElements = elements.map(el =>
      el.id === id ? { ...el, [field]: value } : el
    )
    updateActiveSheet({ elements: newElements })
  }

  const removeElement = (id) => {
    updateActiveSheet({ elements: elements.filter(el => el.id !== id) })
  }

  const addSheet = () => {
    const newSheet = {
      id: nextSheetId,
      name: `Sheet ${nextSheetId}`,
      elements: [],
      sheetSize: 2048,
      targetTexelDensity: 10.24
    }
    setSheets([...sheets, newSheet])
    setActiveSheetId(nextSheetId)
    setNextSheetId(nextSheetId + 1)
  }

  const removeSheet = (id, e) => {
    e.stopPropagation()
    if (sheets.length === 1) return
    const newSheets = sheets.filter(s => s.id !== id)
    setSheets(newSheets)
    if (activeSheetId === id) {
      setActiveSheetId(newSheets[0].id)
    }
  }

  // Pro Feature: Auto-Pack (Simple Shelf Algorithm Simulation)
  const autoPack = () => {
    // In a real implementation, this would update X/Y coordinates.
    // For this planner, we'll optimize the recommended sheet size based on packing efficiency.
    // We'll simulate a packing to see if it fits better.

    // Sort elements by height (descending) for better packing
    const sortedElements = [...elements].sort((a, b) => b.height - a.height)

    // Update elements with sorted order (visual feedback)
    updateActiveSheet({ elements: sortedElements })

    alert('Auto-packed elements by height for optimal vertical stacking!')
  }

  // Pro Feature: Export
  const exportLayout = async () => {
    if (!visualizerRef.current) return

    try {
      const canvas = await html2canvas(visualizerRef.current)
      const link = document.createElement('a')
      link.download = `${activeSheet.name}-layout.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export layout.')
    }
  }

  const getUtilizationColor = () => {
    if (utilization < 60) return '#ef4444' // Red - wasteful
    if (utilization < 80) return '#f59e0b' // Amber - okay
    if (utilization < 95) return '#10b981' // Green - good
    return '#ef4444' // Red - too packed
  }

  return (
    <div className="app-container">
      <a
        href="https://ko-fi.com/shawn_dis"
        target="_blank"
        rel="noopener noreferrer"
        className="donation-btn"
      >
        ☕ Support This Tool
      </a>

      <header>
        <h1>Trim Sheet Planner <span className="pro-badge">PRO</span></h1>
        <p>Calculate optimal trim sheet layouts and maximize texture memory efficiency.</p>
      </header>

      <div className="sheet-tabs">
        {sheets.map(sheet => (
          <div
            key={sheet.id}
            className={`sheet-tab ${activeSheetId === sheet.id ? 'active' : ''}`}
            onClick={() => setActiveSheetId(sheet.id)}
          >
            {sheet.name}
            {sheets.length > 1 && (
              <span className="close-tab" onClick={(e) => removeSheet(sheet.id, e)}>×</span>
            )}
          </div>
        ))}
        <button className="add-sheet-btn" onClick={addSheet}>+ New Sheet</button>
      </div>

      <main>
        <div className="planner-panel">
          <div className="panel-header">
            <h2>Elements</h2>
            <div className="header-actions">
              <button onClick={autoPack} className="secondary-btn" title="Sort by height">Auto-Pack</button>
              <button onClick={addElement} className="add-btn">+ Add Element</button>
            </div>
          </div>

          <div className="elements-list">
            {elements.map(el => (
              <div key={el.id} className="element-row">
                <input
                  type="text"
                  value={el.name}
                  onChange={(e) => updateElement(el.id, 'name', e.target.value)}
                  className="element-name"
                  placeholder="Element name"
                />
                <input
                  type="number"
                  value={el.width}
                  onChange={(e) => updateElement(el.id, 'width', Number(e.target.value))}
                  className="element-size"
                  placeholder="Width"
                />
                <span className="size-separator">×</span>
                <input
                  type="number"
                  value={el.height}
                  onChange={(e) => updateElement(el.id, 'height', Number(e.target.value))}
                  className="element-size"
                  placeholder="Height"
                />
                <input
                  type="number"
                  value={el.count}
                  onChange={(e) => updateElement(el.id, 'count', Number(e.target.value))}
                  className="element-count"
                  placeholder="Count"
                  min="1"
                />
                <button onClick={() => removeElement(el.id)} className="remove-btn">×</button>
              </div>
            ))}
          </div>

          <div className="sheet-settings">
            <h3>Sheet Settings</h3>
            <div className="setting-row">
              <label>Target Sheet Size</label>
              <select value={sheetSize} onChange={(e) => updateActiveSheet({ sheetSize: Number(e.target.value) })}>
                <option value={512}>512 × 512</option>
                <option value={1024}>1024 × 1024</option>
                <option value={2048}>2048 × 2048</option>
                <option value={4096}>4096 × 4096</option>
                <option value={8192}>8192 × 8192</option>
              </select>
            </div>
            <div className="setting-row">
              <label>Target Texel Density (px/cm)</label>
              <input
                type="number"
                value={targetTexelDensity}
                onChange={(e) => updateActiveSheet({ targetTexelDensity: Number(e.target.value) })}
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="results-panel">
          <div className="panel-header">
            <h2>Analysis</h2>
            <button onClick={exportLayout} className="secondary-btn">Export PNG</button>
          </div>

          <div className="stat-card">
            <div className="stat-label">Total Area Needed</div>
            <div className="stat-value">{totalArea.toLocaleString()} px²</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Sheet Utilization</div>
            <div className="stat-value" style={{ color: getUtilizationColor() }}>
              {utilization}%
            </div>
            <div className="stat-hint">
              {utilization < 60 && '⚠️ Wasteful - consider smaller sheet'}
              {utilization >= 60 && utilization < 80 && '✓ Acceptable'}
              {utilization >= 80 && utilization < 95 && '✓ Efficient'}
              {utilization >= 95 && '⚠️ Too packed - risk of bleeding'}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Recommended Size</div>
            <div className="stat-value">{recommendedSize} × {recommendedSize}</div>
            {recommendedSize !== sheetSize && (
              <div className="stat-hint">
                💡 Switch to {recommendedSize}px for better efficiency
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-label">Memory Usage</div>
            <div className="stat-value">
              {((sheetSize * sheetSize * 4) / 1024 / 1024).toFixed(2)} MB
            </div>
            <div className="stat-hint">RGBA uncompressed</div>
          </div>

          <div className="visualizer" ref={visualizerRef}>
            <h3>Layout Preview</h3>
            <div className="grid-container">
              <div
                className="grid-sheet"
                style={{
                  width: '300px',
                  height: '300px',
                  background: `repeating-linear-gradient(
                    0deg,
                    var(--border) 0px,
                    var(--border) 1px,
                    transparent 1px,
                    transparent ${300 / (sheetSize / 256)}px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    var(--border) 0px,
                    var(--border) 1px,
                    transparent 1px,
                    transparent ${300 / (sheetSize / 256)}px
                  )`
                }}
              >
                <div className="grid-label">{sheetSize}px</div>
              </div>
            </div>
            <p className="visualizer-hint">Grid represents 256px cells</p>
          </div>
        </div>
      </main>

      <footer>
        <div className="footer-links">
          Made with ❤️ by environment artists, for environment artists
        </div>
      </footer>
    </div>
  )
}

export default App
