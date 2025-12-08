import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Element inputs
  const [elements, setElements] = useState([
    { id: 1, name: 'Brick', width: 256, height: 256, count: 4 }
  ])
  const [nextId, setNextId] = useState(2)

  // Sheet settings
  const [targetTexelDensity, setTargetTexelDensity] = useState(10.24)
  const [sheetSize, setSheetSize] = useState(2048)

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

  const addElement = () => {
    setElements([...elements, {
      id: nextId,
      name: `Element ${nextId}`,
      width: 256,
      height: 256,
      count: 1
    }])
    setNextId(nextId + 1)
  }

  const updateElement = (id, field, value) => {
    setElements(elements.map(el =>
      el.id === id ? { ...el, [field]: value } : el
    ))
  }

  const removeElement = (id) => {
    setElements(elements.filter(el => el.id !== id))
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
        <h1>Trim Sheet Planner</h1>
        <p>Calculate optimal trim sheet layouts and maximize texture memory efficiency.</p>
      </header>

      <main>
        <div className="planner-panel">
          <div className="panel-header">
            <h2>Elements</h2>
            <button onClick={addElement} className="add-btn">+ Add Element</button>
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
              <select value={sheetSize} onChange={(e) => setSheetSize(Number(e.target.value))}>
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
                onChange={(e) => setTargetTexelDensity(Number(e.target.value))}
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="results-panel">
          <h2>Analysis</h2>

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

          <div className="visualizer">
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
