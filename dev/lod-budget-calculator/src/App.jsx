import { useState } from 'react'
import './App.css'
import { budgets, assetTypes } from './data'

function App() {
  const [platform, setPlatform] = useState('pc')
  const [assetType, setAssetType] = useState('character')

  const currentBudget = budgets[platform].assets[assetType]
  const platformInfo = budgets[platform]

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
        <h1>LOD Budget Calculator</h1>
        <p>Estimate recommended polycounts for your game assets across different platforms.</p>
      </header>

      <main>
        <div className="controls-panel">
          <div className="control-group">
            <label>Target Platform</label>
            <div className="platform-selector">
              {Object.entries(budgets).map(([key, data]) => (
                <button
                  key={key}
                  className={`platform-btn ${platform === key ? 'active' : ''}`}
                  onClick={() => setPlatform(key)}
                >
                  {data.label}
                </button>
              ))}
            </div>
            <p className="description-text">{platformInfo.description}</p>
          </div>

          <div className="control-group">
            <label>Asset Type</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              className="asset-select"
            >
              {assetTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="results-panel">
          <h2>Recommended Budgets (Triangles)</h2>

          <div className="lod-grid">
            <div className="lod-card lod0">
              <div className="lod-label">LOD 0</div>
              <div className="lod-desc">Hero / Close Up</div>
              <div className="lod-value">{currentBudget.lod0.toLocaleString()}</div>
              <div className="lod-bar">
                <div className="fill" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="lod-card lod1">
              <div className="lod-label">LOD 1</div>
              <div className="lod-desc">Near Distance (~10m)</div>
              <div className="lod-value">{currentBudget.lod1.toLocaleString()}</div>
              <div className="lod-bar">
                <div className="fill" style={{ width: '50%' }}></div>
              </div>
            </div>

            <div className="lod-card lod2">
              <div className="lod-label">LOD 2</div>
              <div className="lod-desc">Mid Distance (~25m)</div>
              <div className="lod-value">{currentBudget.lod2.toLocaleString()}</div>
              <div className="lod-bar">
                <div className="fill" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div className="lod-card lod3">
              <div className="lod-label">LOD 3</div>
              <div className="lod-desc">Far Distance (~50m+)</div>
              <div className="lod-value">{currentBudget.lod3.toLocaleString()}</div>
              <div className="lod-bar">
                <div className="fill" style={{ width: '12.5%' }}></div>
              </div>
            </div>
          </div>

          <div className="info-box">
            <p><strong>Note:</strong> These are general guidelines. Actual budgets depend on your specific game engine, scene complexity, and art style.</p>
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
