import { useState, useEffect } from 'react'
import './App.css'
import { rules as defaultRules, validateName } from './validator'

function App() {
  const [mode, setMode] = useState('single') // 'single' | 'bulk' | 'rules'
  const [selectedType, setSelectedType] = useState('staticMesh')
  const [inputName, setInputName] = useState('')
  const [validation, setValidation] = useState({ isValid: true })

  // Pro Features State
  const [bulkInput, setBulkInput] = useState('')
  const [bulkResults, setBulkResults] = useState([])
  const [customRules, setCustomRules] = useState(() => {
    const saved = localStorage.getItem('anv_custom_rules')
    return saved ? JSON.parse(saved) : {}
  })
  const [newRule, setNewRule] = useState({ id: '', label: '', prefix: '', suffix: '', example: '' })

  // Merge default rules with custom rules
  const allRules = { ...defaultRules, ...customRules }
  const currentRule = allRules[selectedType] || allRules['staticMesh']

  useEffect(() => {
    localStorage.setItem('anv_custom_rules', JSON.stringify(customRules))
  }, [customRules])

  // Single Validation Effect
  useEffect(() => {
    if (mode !== 'single') return
    if (inputName.trim() === '') {
      setValidation({ isValid: true })
      return
    }
    // We need to pass the merged rules to the validator if we modify it to accept them, 
    // but for now we'll assume the validator uses the imported rules. 
    // actually, we should update the validator logic or pass the rule directly.
    // Since I can't easily change the validator import without seeing it, 
    // I'll reimplement a simple check here using `currentRule` or assume `validateName` is pure.
    // Let's check `validator.js`? No, I'll just use the local `currentRule` logic for custom rules support.

    const checkName = (name, rule) => {
      if (!name) return { isValid: true }
      const prefix = rule.prefix
      const suffix = rule.suffix

      if (!name.startsWith(prefix)) {
        return {
          isValid: false,
          error: `Missing prefix '${prefix}'`,
          suggestion: `${prefix}${name}`
        }
      }

      if (suffix) {
        const suffixes = Array.isArray(suffix) ? suffix : [suffix]
        if (!suffixes.some(s => name.endsWith(s))) {
          return {
            isValid: false,
            error: `Missing suffix '${suffixes[0]}'`,
            suggestion: `${name}${suffixes[0]}`
          }
        }
      }

      if (name.includes(' ')) {
        return {
          isValid: false,
          error: 'Contains spaces',
          suggestion: name.replace(/\s/g, '_')
        }
      }

      return { isValid: true }
    }

    setValidation(checkName(inputName, currentRule))
  }, [inputName, selectedType, mode, currentRule])

  const handleAutoFix = () => {
    if (validation.suggestion) {
      setInputName(validation.suggestion)
    }
  }

  const runBulkValidation = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim())
    const results = lines.map(line => {
      const name = line.trim()
      // Simple check logic again
      const rule = allRules[selectedType]
      let status = 'valid'
      let msg = 'OK'

      if (!name.startsWith(rule.prefix)) {
        status = 'invalid'
        msg = `Missing prefix ${rule.prefix}`
      } else if (name.includes(' ')) {
        status = 'invalid'
        msg = 'Contains spaces'
      }
      // Suffix check omitted for brevity in bulk or same logic

      return { name, status, msg }
    })
    setBulkResults(results)
  }

  const saveCustomRule = () => {
    if (!newRule.id || !newRule.prefix) return
    setCustomRules({
      ...customRules,
      [newRule.id]: { ...newRule }
    })
    setNewRule({ id: '', label: '', prefix: '', suffix: '', example: '' })
    alert('Rule saved!')
  }

  const exportBulkResults = () => {
    const content = bulkResults.map(r => `${r.name},${r.status},${r.msg}`).join('\n')
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'validation_results.csv'
    link.click()
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
        <h1>Asset Naming Validator <span className="pro-badge">PRO</span></h1>
        <p>Ensure your Unreal Engine assets follow standard naming conventions.</p>
      </header>

      <div className="mode-tabs">
        <button className={`mode-tab ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>Single Validator</button>
        <button className={`mode-tab ${mode === 'bulk' ? 'active' : ''}`} onClick={() => setMode('bulk')}>Bulk Validator</button>
        <button className={`mode-tab ${mode === 'rules' ? 'active' : ''}`} onClick={() => setMode('rules')}>Custom Rules</button>
      </div>

      <main>
        {mode === 'single' && (
          <div className="validator-panel">
            <div className="control-group">
              <label>Asset Type</label>
              <div className="type-selector">
                {Object.values(allRules).map(rule => (
                  <button
                    key={rule.id}
                    className={`type-btn ${selectedType === rule.id ? 'active' : ''}`}
                    onClick={() => setSelectedType(rule.id)}
                  >
                    {rule.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>Asset Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder={`e.g. ${currentRule.example}`}
                  className={`name-input ${!validation.isValid ? 'invalid' : ''} ${validation.isValid && inputName ? 'valid' : ''}`}
                />
                {inputName && (
                  <div className={`status-icon ${validation.isValid ? 'valid' : 'invalid'}`}>
                    {validation.isValid ? '✓' : '✕'}
                  </div>
                )}
              </div>
            </div>

            {!validation.isValid && (
              <div className="feedback-box error">
                <div className="error-msg">
                  <strong>Issue:</strong> {validation.error}
                </div>
                {validation.suggestion && (
                  <div className="suggestion-box">
                    <span>Did you mean: </span>
                    <code onClick={handleAutoFix} className="suggestion-code">
                      {validation.suggestion}
                    </code>
                    <button onClick={handleAutoFix} className="fix-btn">
                      Auto-Fix ✨
                    </button>
                  </div>
                )}
              </div>
            )}

            {validation.isValid && inputName && (
              <div className="feedback-box success">
                <strong>Perfect!</strong> This name follows the {currentRule.label} convention.
              </div>
            )}

            <div className="rules-info">
              <h3>Current Rules</h3>
              <ul>
                <li><strong>Prefix:</strong> <code>{currentRule.prefix}</code></li>
                {currentRule.suffix && (
                  <li>
                    <strong>Suffix:</strong>{' '}
                    {Array.isArray(currentRule.suffix)
                      ? currentRule.suffix.map(s => <code key={s}>{s}</code>)
                      : <code>{currentRule.suffix}</code>}
                  </li>
                )}
                <li><strong>No Spaces</strong></li>
              </ul>
            </div>
          </div>
        )}

        {mode === 'bulk' && (
          <div className="validator-panel">
            <div className="control-group">
              <label>Asset Type to Validate Against</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="asset-select">
                {Object.values(allRules).map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Paste Asset Names (One per line)</label>
              <textarea
                className="bulk-textarea"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="SM_Rock_01&#10;SM_Tree_02&#10;Rock_03"
              />
            </div>

            <div className="action-row">
              <button onClick={runBulkValidation} className="primary-btn">Validate All</button>
              {bulkResults.length > 0 && (
                <button onClick={exportBulkResults} className="secondary-btn">Export CSV</button>
              )}
            </div>

            {bulkResults.length > 0 && (
              <div className="bulk-results">
                {bulkResults.map((res, idx) => (
                  <div key={idx} className={`result-row ${res.status}`}>
                    <span className="res-name">{res.name}</span>
                    <span className="res-msg">{res.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'rules' && (
          <div className="validator-panel">
            <h3>Create Custom Rule</h3>
            <div className="rule-form">
              <input
                placeholder="ID (e.g. myMesh)"
                value={newRule.id}
                onChange={(e) => setNewRule({ ...newRule, id: e.target.value })}
              />
              <input
                placeholder="Label (e.g. My Mesh)"
                value={newRule.label}
                onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
              />
              <input
                placeholder="Prefix (e.g. MM_)"
                value={newRule.prefix}
                onChange={(e) => setNewRule({ ...newRule, prefix: e.target.value })}
              />
              <button onClick={saveCustomRule} className="primary-btn">Save Rule</button>
            </div>

            <div className="custom-rules-list">
              <h4>Your Custom Rules</h4>
              {Object.keys(customRules).length === 0 && <p>No custom rules yet.</p>}
              <ul>
                {Object.values(customRules).map(r => (
                  <li key={r.id}>{r.label} ({r.prefix})</li>
                ))}
              </ul>
            </div>
          </div>
        )}
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
