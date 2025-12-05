import { useState, useEffect } from 'react'
import './App.css'
import { budgets, assetTypes } from './data'

function App() {
  const [platform, setPlatform] = useState('pc')
  const [assetType, setAssetType] = useState('character')

  // Pro Features State
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('lod_projects')
    return saved ? JSON.parse(saved) : []
  })
  const [currentProjectName, setCurrentProjectName] = useState('')
  const [comparePlatform, setComparePlatform] = useState(null) // null or platform key
  const [showSaveModal, setShowSaveModal] = useState(false)

  const currentBudget = budgets[platform].assets[assetType]
  const platformInfo = budgets[platform]
  const compareBudget = comparePlatform ? budgets[comparePlatform].assets[assetType] : null

  useEffect(() => {
    localStorage.setItem('lod_projects', JSON.stringify(projects))
  }, [projects])

  const saveProject = () => {
    if (!currentProjectName) return
    const newProject = {
      id: Date.now(),
      name: currentProjectName,
      platform,
      assetType,
      date: new Date().toLocaleDateString()
    }
    setProjects([...projects, newProject])
    setShowSaveModal(false)
    setCurrentProjectName('')
    alert('Project saved!')
  }

  const loadProject = (project) => {
    setPlatform(project.platform)
    setAssetType(project.assetType)
  }

  const deleteProject = (id, e) => {
    e.stopPropagation()
    setProjects(projects.filter(p => p.id !== id))
  }

  const exportCSV = () => {
    const headers = ['LOD Level', 'Description', 'Triangle Count']
    const rows = [
      ['LOD 0', 'Hero / Close Up', currentBudget.lod0],
      ['LOD 1', 'Near Distance (~10m)', currentBudget.lod1],
      ['LOD 2', 'Mid Distance (~25m)', currentBudget.lod2],
      ['LOD 3', 'Far Distance (~50m+)', currentBudget.lod3],
    ]

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `lod_budget_${platform}_${assetType}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        <h1>LOD Budget Calculator <span className="pro-badge">PRO</span></h1>
        <p>Estimate recommended polycounts for your game assets across different platforms.</p>
      </header>

      <main>
        <div className="sidebar">
          <div className="project-manager">
            <h3>My Projects</h3>
            <button onClick={() => setShowSaveModal(true)} className="save-btn">💾 Save Current</button>

            {showSaveModal && (
              <div className="save-modal">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={currentProjectName}
                  onChange={(e) => setCurrentProjectName(e.target.value)}
                />
                <button onClick={saveProject}>Confirm</button>
                <button onClick={() => setShowSaveModal(false)} className="cancel">Cancel</button>
              </div>
            )}

            <div className="project-list">
              {projects.length === 0 && <p className="empty-msg">No saved projects</p>}
              {projects.map(p => (
                <div key={p.id} className="project-item" onClick={() => loadProject(p)}>
                  <div className="project-info">
                    <span className="project-name">{p.name}</span>
                    <span className="project-meta">{p.platform} • {p.assetType}</span>
                  </div>
                  <button className="delete-btn" onClick={(e) => deleteProject(p.id, e)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content-area">
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

            <div className="control-group">
              <label>Compare With (Pro)</label>
              <select
                value={comparePlatform || ''}
                onChange={(e) => setComparePlatform(e.target.value || null)}
                className="asset-select"
              >
                <option value="">None</option>
                {Object.entries(budgets).map(([key, data]) => (
                  <option key={key} value={key}>{data.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="results-panel">
            <div className="panel-header">
              <h2>Recommended Budgets (Triangles)</h2>
              <button onClick={exportCSV} className="secondary-btn">Export CSV</button>
            </div>

            <div className="lod-grid">
              {['lod0', 'lod1', 'lod2', 'lod3'].map((lod, idx) => (
                <div key={lod} className={`lod-card ${lod}`}>
                  <div className="lod-label">LOD {idx}</div>
                  <div className="lod-desc">
                    {idx === 0 && 'Hero / Close Up'}
                    {idx === 1 && 'Near Distance (~10m)'}
                    {idx === 2 && 'Mid Distance (~25m)'}
                    {idx === 3 && 'Far Distance (~50m+)'}
                  </div>

                  <div className="lod-value-group">
                    <div className="lod-value primary">
                      {currentBudget[lod].toLocaleString()}
                    </div>
                    {compareBudget && (
                      <div className="lod-value secondary">
                        vs {compareBudget[lod].toLocaleString()}
                        <span className="diff">
                          ({Math.round((currentBudget[lod] - compareBudget[lod]) / compareBudget[lod] * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="lod-bar">
                    <div className="fill" style={{ width: `${100 / Math.pow(2, idx)}%` }}></div>
                    {compareBudget && (
                      <div className="fill secondary" style={{ width: `${(compareBudget[lod] / currentBudget[lod]) * (100 / Math.pow(2, idx))}%`, background: 'rgba(255,255,255,0.3)' }}></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="info-box">
              <p><strong>Note:</strong> These are general guidelines. Actual budgets depend on your specific game engine, scene complexity, and art style.</p>
            </div>
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
