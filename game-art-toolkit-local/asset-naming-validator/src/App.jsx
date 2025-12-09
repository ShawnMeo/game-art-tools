import { useState } from 'react'
import './App.css'
import { conventions } from './conventions'

function App() {
  const [selectedEngine, setSelectedEngine] = useState('unreal')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAsset, setExpandedAsset] = useState(null)

  const currentConvention = conventions[selectedEngine]

  // Filter assets based on search
  const filteredAssets = currentConvention.assets.filter(asset =>
    asset.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.prefix?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleAssetExpand = (assetId) => {
    setExpandedAsset(expandedAsset === assetId ? null : assetId)
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
        <h1>Asset Naming Conventions</h1>
        <p>Quick reference guide for game engine asset naming standards</p>
      </header>

      <main>
        {/* Engine Selector Tabs */}
        <div className="engine-tabs">
          <button
            className={`engine-tab ${selectedEngine === 'unreal' ? 'active' : ''}`}
            onClick={() => setSelectedEngine('unreal')}
          >
            <span className="engine-icon">🎮</span>
            Unreal Engine
          </button>
          <button
            className={`engine-tab ${selectedEngine === 'unity' ? 'active' : ''}`}
            onClick={() => setSelectedEngine('unity')}
          >
            <span className="engine-icon">🎲</span>
            Unity
          </button>
        </div>

        {/* Format Info */}
        <div className="format-card">
          <div className="format-label">Naming Format</div>
          <div className="format-pattern">{currentConvention.format}</div>
          <div className="format-description">{currentConvention.formatDescription}</div>
        </div>

        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search asset types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        {/* Asset Cards Grid */}
        <div className="asset-grid">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className={`asset-card ${expandedAsset === asset.id ? 'expanded' : ''}`}
              onClick={() => toggleAssetExpand(asset.id)}
            >
              <div className="asset-header">
                <span className="asset-icon">{asset.icon}</span>
                <div className="asset-title">
                  <h3>{asset.label}</h3>
                  <code className="asset-prefix">{asset.prefix || 'PascalCase'}</code>
                </div>
              </div>

              <p className="asset-description">{asset.description}</p>

              <div className="asset-examples">
                <span className="examples-label">Examples:</span>
                <div className="examples-list">
                  {asset.examples.map((example, i) => (
                    <code key={i} className="example-code">{example}</code>
                  ))}
                </div>
              </div>

              {asset.suffix && (
                <div className="asset-suffix">
                  <span className="suffix-label">Suffix:</span>
                  <code>{asset.suffix}</code>
                </div>
              )}

              {asset.note && (
                <div className="asset-note">
                  💡 {asset.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="no-results">
            No asset types found matching "{searchQuery}"
          </div>
        )}

        {/* Texture Suffixes Section */}
        <section className="texture-section">
          <h2>
            <span className="section-icon">🖼️</span>
            Texture Map Suffixes
          </h2>
          <p className="section-description">
            Common suffixes used to identify texture map types
          </p>

          <div className="suffix-grid">
            {currentConvention.textureSuffixes.map((item, i) => (
              <div key={i} className="suffix-card">
                <code className="suffix-code">{item.suffix}</code>
                <div className="suffix-info">
                  <span className="suffix-meaning">{item.meaning}</span>
                  <span className="suffix-desc">{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Tips */}
        <section className="tips-section">
          <h2>
            <span className="section-icon">💡</span>
            Best Practices
          </h2>
          <ul className="tips-list">
            <li>
              <strong>Consistency is key</strong> — Pick a convention and stick to it throughout your project
            </li>
            <li>
              <strong>Use descriptive names</strong> — Avoid vague names like "Asset01" or "NewMaterial"
            </li>
            <li>
              <strong>Include variants</strong> — Use numbers or descriptors for variations (e.g., _01, _Rusty, _Large)
            </li>
            <li>
              <strong>No spaces or special characters</strong> — Use underscores or PascalCase instead
            </li>
            <li>
              <strong>Keep it readable</strong> — Balance between brevity and clarity
            </li>
          </ul>
        </section>
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
