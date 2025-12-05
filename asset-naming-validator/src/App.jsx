import { useState, useEffect } from 'react'
import './App.css'
import { rules, validateName } from './validator'

function App() {
  const [selectedType, setSelectedType] = useState('staticMesh')
  const [inputName, setInputName] = useState('')
  const [validation, setValidation] = useState({ isValid: true })

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
        <h1>Asset Naming Validator</h1>
        <p>Ensure your Unreal Engine assets follow standard naming conventions.</p>
      </header>

      <main>
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
