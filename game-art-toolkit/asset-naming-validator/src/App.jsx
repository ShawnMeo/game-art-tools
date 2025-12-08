import { useState, useEffect } from 'react'
import './App.css'
import { rules, validateName, validateBatch } from './validator'
import { isUnlocked as checkUnlocked, lock } from './unlockKey'
import { UnlockModal, ProBadge, UnlockedBadge } from './UnlockModal'

function App() {
  const [mode, setMode] = useState('single') // 'single' or 'batch'
  const [selectedType, setSelectedType] = useState('staticMesh')
  const [inputName, setInputName] = useState('')
  const [validation, setValidation] = useState({ isValid: true })
  const [batchInput, setBatchInput] = useState('')
  const [batchResults, setBatchResults] = useState([])
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(checkUnlocked())

  const currentRule = rules[selectedType]

  useEffect(() => {
    if (inputName.trim() === '') {
      setValidation({ isValid: true }) // Reset on empty
      return
    }
    const result = validateName(inputName, selectedType)
    setValidation(result)
  }, [inputName, selectedType])

  const handleAutoFix = () => {
    if (validation.suggestion) {
      setInputName(validation.suggestion)
    }
  }

  const handleBatchTabClick = () => {
    if (isUnlocked) {
      setMode('batch')
    } else {
      setShowUnlockModal(true)
    }
  }

  const handleUnlock = () => {
    setIsUnlocked(true)
    setMode('batch')
  }

  const handleLock = () => {
    lock()
    setIsUnlocked(false)
    setMode('single')
  }

  const handleBatchValidate = () => {
    if (batchInput.trim() === '') {
      setBatchResults([])
      return
    }
    const results = validateBatch(batchInput, selectedType)
    setBatchResults(results)
  }

  const handleFixAll = () => {
    const fixedNames = batchResults.map(r =>
      r.suggestion || r.original
    ).join('\n')
    setBatchInput(fixedNames)
    // Re-validate with fixed names
    const results = validateBatch(fixedNames, selectedType)
    setBatchResults(results)
  }

  const handleCopyFixed = async () => {
    const fixedNames = batchResults.map(r =>
      r.suggestion || r.original
    ).join('\n')
    try {
      await navigator.clipboard.writeText(fixedNames)
      alert('Fixed names copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const validCount = batchResults.filter(r => r.isValid).length
  const invalidCount = batchResults.filter(r => !r.isValid).length

  return (
    <div className="app-container">
      {/* Unlock Modal */}
      {showUnlockModal && (
        <UnlockModal
          onClose={() => setShowUnlockModal(false)}
          onUnlock={handleUnlock}
        />
      )}

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
        <h1>Asset Naming Validator</h1>
        <p>Ensure your Unreal Engine assets follow standard naming conventions.</p>
      </header>

      <main>
        {/* Mode Tabs */}
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'single' ? 'active' : ''}`}
            onClick={() => setMode('single')}
          >
            Single
          </button>
          <button
            className={`mode-tab ${mode === 'batch' ? 'active' : ''}`}
            onClick={handleBatchTabClick}
          >
            Batch
            {isUnlocked ? (
              <UnlockedBadge onClick={(e) => { e.stopPropagation(); handleLock(); }} />
            ) : (
              <ProBadge onClick={(e) => { e.stopPropagation(); setShowUnlockModal(true); }} />
            )}
          </button>
        </div>

        <div className="validator-panel">
          <div className="control-group">
            <label>Asset Type</label>
            <div className="type-selector">
              {Object.values(rules).map(rule => (
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

          {/* Single Mode */}
          {mode === 'single' && (
            <>
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
            </>
          )}

          {/* Batch Mode */}
          {mode === 'batch' && (
            <>
              <div className="input-group">
                <label>Asset Names (one per line)</label>
                <textarea
                  className="batch-input"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder={`SM_Chair_01\nSM_Table_02\nChair_03`}
                  rows={8}
                />
              </div>

              <div className="batch-actions">
                <button className="validate-btn" onClick={handleBatchValidate}>
                  🔍 Validate All
                </button>
                {batchResults.length > 0 && (
                  <>
                    <button className="fix-all-btn" onClick={handleFixAll}>
                      ✨ Fix All
                    </button>
                    <button className="copy-btn" onClick={handleCopyFixed}>
                      📋 Copy Fixed Names
                    </button>
                  </>
                )}
              </div>

              {batchResults.length > 0 && (
                <div className="batch-results">
                  <div className="results-summary">
                    <span className="valid-count">✓ {validCount} valid</span>
                    <span className="invalid-count">✕ {invalidCount} invalid</span>
                  </div>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Original Name</th>
                        <th>Issue</th>
                        <th>Suggested Fix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((result, index) => (
                        <tr key={index} className={result.isValid ? 'valid-row' : 'invalid-row'}>
                          <td className="status-cell">
                            {result.isValid ? '✓' : '✕'}
                          </td>
                          <td className="name-cell">{result.original}</td>
                          <td className="issue-cell">{result.error || '—'}</td>
                          <td className="suggestion-cell">
                            {result.suggestion || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
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
