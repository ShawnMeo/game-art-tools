import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('density')

  // Inputs
  const [objectSize, setObjectSize] = useState(100)
  const [textureSize, setTextureSize] = useState(2048)
  const [targetDensity, setTargetDensity] = useState(10.24)

  // Results
  const [calculatedDensity, setCalculatedDensity] = useState(0)
  const [calculatedTextureSize, setCalculatedTextureSize] = useState(0)

  // PRO: Custom Presets with localStorage
  const [customPresets, setCustomPresets] = useState(() => {
    const saved = localStorage.getItem('texel-presets')
    return saved ? JSON.parse(saved) : []
  })
  const [presetName, setPresetName] = useState('')

  // Default Presets
  const defaultPresets = [
    { name: 'First Person (High)', density: 20.48, desc: 'Hero assets, weapons' },
    { name: 'First Person (Std)', density: 10.24, desc: 'Environment, props' },
    { name: 'Third Person', density: 5.12, desc: 'General gameplay' },
    { name: 'Background', density: 2.56, desc: 'Distant objects' },
  ]

  useEffect(() => {
    if (mode === 'density') {
      const density = textureSize / objectSize
      setCalculatedDensity(density.toFixed(2))
    } else {
      const size = targetDensity * objectSize
      setCalculatedTextureSize(Math.round(size))
    }
  }, [mode, objectSize, textureSize, targetDensity])

  // PRO: Save custom preset
  const savePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }
    const newPreset = {
      name: presetName,
      density: mode === 'density' ? parseFloat(calculatedDensity) : targetDensity,
      objectSize,
      textureSize: mode === 'density' ? textureSize : calculatedTextureSize
    }
    const updated = [...customPresets, newPreset]
    setCustomPresets(updated)
    localStorage.setItem('texel-presets', JSON.stringify(updated))
    setPresetName('')
    alert(`Preset "${presetName}" saved!`)
  }

  // PRO: Delete preset
  const deletePreset = (index) => {
    const updated = customPresets.filter((_, i) => i !== index)
    setCustomPresets(updated)
    localStorage.setItem('texel-presets', JSON.stringify(updated))
  }

  // PRO: Load preset
  const loadPreset = (preset) => {
    setTargetDensity(preset.density)
    setObjectSize(preset.objectSize)
    if (preset.textureSize) setTextureSize(preset.textureSize)
  }

  const getQualityColor = (density) => {
    if (density >= 20) return '#10b981'
    if (density >= 10) return '#3b82f6'
    if (density >= 5) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="app-container">
      <header>
        <h1>Texel Architect <span className="pro-badge">PRO</span></h1>
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
                {defaultPresets.map(p => (
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

          {/* PRO: Save Preset Section */}
          <div className="save-preset-section">
            <h3>💾 Save Custom Preset (PRO)</h3>
            <div className="save-preset-form">
              <input
                type="text"
                placeholder="Preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="preset-name-input"
              />
              <button onClick={savePreset} className="save-preset-btn">
                Save Preset
              </button>
            </div>
          </div>

          {/* PRO: Custom Presets List */}
          {customPresets.length > 0 && (
            <div className="custom-presets">
              <h4>Your Saved Presets</h4>
              {customPresets.map((preset, idx) => (
                <div key={idx} className="custom-preset-item">
                  <div className="preset-info">
                    <strong>{preset.name}</strong>
                    <span>{preset.density} px/cm</span>
                  </div>
                  <div className="preset-actions">
                    <button onClick={() => loadPreset(preset)} className="load-btn">Load</button>
                    <button onClick={() => deletePreset(idx)} className="delete-btn">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="visualizer-panel">
          <h2>Visualizer (1m²)</h2>
          <div className="visualizer-container">
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
    </div>
  )
}

export default App
