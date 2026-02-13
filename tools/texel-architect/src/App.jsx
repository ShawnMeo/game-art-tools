import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('density') // 'density' (calc density) or 'size' (calc texture size)

  // Inputs
  const [objectSize, setObjectSize] = useState(100) // cm
  const [textureSize, setTextureSize] = useState(2048) // px
  const [targetDensity, setTargetDensity] = useState(10.24) // px/cm

  // Results
  const [calculatedDensity, setCalculatedDensity] = useState(0)
  const [calculatedTextureSize, setCalculatedTextureSize] = useState(0)

  // Presets
  const presets = [
    { name: 'First Person (High)', density: 20.48, desc: 'Hero assets, weapons' },
    { name: 'First Person (Std)', density: 10.24, desc: 'Environment, props' },
    { name: 'Third Person', density: 5.12, desc: 'General gameplay' },
    { name: 'Background', density: 2.56, desc: 'Distant objects' },
  ]

  useEffect(() => {
    if (mode === 'density') {
      // Density = Texture Size / Object Size
      const density = textureSize / objectSize
      setCalculatedDensity(density.toFixed(2))
    } else {
      // Texture Size = Density * Object Size
      const size = targetDensity * objectSize
      setCalculatedTextureSize(Math.round(size))
    }
  }, [mode, objectSize, textureSize, targetDensity])

  const getQualityColor = (density) => {
    if (density >= 20) return '#10b981' // High
    if (density >= 10) return '#3b82f6' // Good
    if (density >= 5) return '#f59e0b' // Medium
    return '#ef4444' // Low
  }

  return (
    <div className="app-container">
      {/* Ko-fi Donation Button */}
      <a
        href="https://ko-fi.com/shawn_dis"
        target="_blank"
        rel="noopener noreferrer"
        className="donation-btn"
      >
        ☕ Support This Tool
      </a>

      <header>
        <h1>Texel Architect</h1>
        <p>Calculate and visualize consistent texture density for your environments.</p>
      </header>

      <main>
        <div className="calculator-panel">
          <div className="tabs">
            <button
              className={mode === 'density' ? 'active' : ''}
              onClick={() => setMode('density')}
            >
              Calculate Density
            </button>
            <button
              className={mode === 'size' ? 'active' : ''}
              onClick={() => setMode('size')}
            >
              Calculate Texture Size
            </button>
          </div>

          <div className="input-group">
            <label>Object Size (cm)</label>
            <input
              type="number"
              value={objectSize}
              onChange={(e) => setObjectSize(Number(e.target.value))}
            />
            <span className="unit-hint">1m = 100cm</span>
          </div>

          {mode === 'density' ? (
            <>
              <div className="input-group">
                <label>Texture Resolution</label>
                <select
                  value={textureSize}
                  onChange={(e) => setTextureSize(Number(e.target.value))}
                >
                  <option value={512}>512 x 512</option>
                  <option value={1024}>1024 x 1024</option>
                  <option value={2048}>2048 x 2048</option>
                  <option value={4096}>4096 x 4096</option>
                  <option value={8192}>8192 x 8192</option>
                </select>
              </div>

              <div className="result-box">
                <span className="label">Resulting Density</span>
                <div className="value" style={{ color: getQualityColor(calculatedDensity) }}>
                  {calculatedDensity} <span className="unit">px/cm</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label>Target Density (px/cm)</label>
                <input
                  type="number"
                  value={targetDensity}
                  onChange={(e) => setTargetDensity(Number(e.target.value))}
                />
              </div>

              <div className="presets">
                {presets.map(p => (
                  <button key={p.name} onClick={() => setTargetDensity(p.density)} className="preset-btn">
                    <span className="p-name">{p.name}</span>
                    <span className="p-val">{p.density} px/cm</span>
                  </button>
                ))}
              </div>

              <div className="result-box">
                <span className="label">Required Texture Size</span>
                <div className="value">
                  {calculatedTextureSize} <span className="unit">px</span>
                </div>
                <div className="recommendation">
                  Closest Power of 2:
                  <strong> {Math.pow(2, Math.round(Math.log2(calculatedTextureSize)))}</strong>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="visualizer-panel">
          <h2>Visualizer (1m²)</h2>
          <div className="visualizer-container">
            {/* Represents a 1m x 1m surface */}
            <div
              className="grid-preview"
              style={{
                backgroundSize: `${(mode === 'density' ? calculatedDensity : targetDensity) * 10}px ${(mode === 'density' ? calculatedDensity : targetDensity) * 10}px`
              }}
            >
              <div className="ruler-h">100cm</div>
              <div className="ruler-v">100cm</div>
            </div>
          </div>
          <p className="visualizer-hint">
            The grid represents the texel density on a 1m² surface.
            Denser grid = Sharper textures.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-links">
          Made with ❤️ by environment artists, for environment artists
        </div>
      </footer>
    </div>
  )
}

export default App
