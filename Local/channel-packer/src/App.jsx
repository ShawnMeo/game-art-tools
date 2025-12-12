import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('pack') // 'pack' | 'split'

  // Pack Mode State
  const [channels, setChannels] = useState({
    r: null,
    g: null,
    b: null,
    a: null
  })
  const [previewUrl, setPreviewUrl] = useState(null)
  const canvasRef = useRef(null)

  // Split Mode State
  const [splitSource, setSplitSource] = useState(null)
  const [splitChannels, setSplitChannels] = useState({
    r: null,
    g: null,
    b: null
  })
  const splitCanvasRef = useRef(null)

  // --- Common Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // --- Pack Mode Logic ---
  const handleDrop = (e, channel) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setChannels(prev => ({ ...prev, [channel]: img }))
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (mode !== 'pack' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const width = channels.r?.width || channels.g?.width || channels.b?.width || channels.a?.width || 1024
    const height = channels.r?.height || channels.g?.height || channels.b?.height || channels.a?.height || 1024

    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const drawChannel = (img, channelIndex) => {
      if (!img) return

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = width
      tempCanvas.height = height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.drawImage(img, 0, 0, width, height)

      const imageData = tempCtx.getImageData(0, 0, width, height)
      const data = imageData.data

      const mainImageData = ctx.getImageData(0, 0, width, height)
      const mainData = mainImageData.data

      for (let i = 0; i < data.length; i += 4) {
        mainData[i + channelIndex] = data[i]
        if (mainData[i + 3] === 0 && channelIndex !== 3) {
          mainData[i + 3] = 255
        }
      }

      ctx.putImageData(mainImageData, 0, 0)
    }

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    if (channels.r) drawChannel(channels.r, 0)
    if (channels.g) drawChannel(channels.g, 1)
    if (channels.b) drawChannel(channels.b, 2)
    if (channels.a) drawChannel(channels.a, 3)

    setPreviewUrl(canvas.toDataURL())

  }, [channels, mode])

  const downloadTexture = () => {
    if (!previewUrl) return
    const link = document.createElement('a')
    link.download = 'packed_texture.png'
    link.href = previewUrl
    link.click()
  }

  // --- Split Mode Logic ---
  const handleSplitDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setSplitSource(img)
          processSplit(img)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const processSplit = (img) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const createChannelImage = (channelIndex) => {
      const cCanvas = document.createElement('canvas')
      cCanvas.width = canvas.width
      cCanvas.height = canvas.height
      const cCtx = cCanvas.getContext('2d')
      const cImageData = cCtx.createImageData(canvas.width, canvas.height)
      const cData = cImageData.data

      for (let i = 0; i < data.length; i += 4) {
        const val = data[i + channelIndex]
        cData[i] = val     // R
        cData[i + 1] = val   // G
        cData[i + 2] = val   // B
        cData[i + 3] = 255   // A
      }

      cCtx.putImageData(cImageData, 0, 0)
      return cCanvas.toDataURL()
    }

    setSplitChannels({
      r: createChannelImage(0),
      g: createChannelImage(1),
      b: createChannelImage(2)
    })
  }

  const downloadChannel = (url, name) => {
    const link = document.createElement('a')
    link.download = `${name}_channel.png`
    link.href = url
    link.click()
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
        <h1>PBR Channel Packer</h1>
        <div className="mode-switch">
          <button
            className={mode === 'pack' ? 'active' : ''}
            onClick={() => setMode('pack')}
          >
            Packer
          </button>
          <button
            className={mode === 'split' ? 'active' : ''}
            onClick={() => setMode('split')}
          >
            Splitter
          </button>
        </div>
        <p>
          {mode === 'pack'
            ? 'Drag & Drop grayscale images to pack them into RGB channels.'
            : 'Drag & Drop an RGB texture to split it into individual channels.'}
        </p>
      </header>

      <main>
        {mode === 'pack' ? (
          <>
            <div className="channels-grid">
              {['r', 'g', 'b', 'a'].map(channel => (
                <div
                  key={channel}
                  className={`dropzone channel-${channel} ${channels[channel] ? 'filled' : ''}`}
                  onDrop={(e) => handleDrop(e, channel)}
                  onDragOver={handleDragOver}
                >
                  <div className="channel-label">
                    {channel.toUpperCase()}
                    {channel === 'r' && <span className="hint">(Ambient Occlusion)</span>}
                    {channel === 'g' && <span className="hint">(Roughness)</span>}
                    {channel === 'b' && <span className="hint">(Metallic)</span>}
                    {channel === 'a' && <span className="hint">(Alpha/Height)</span>}
                  </div>
                  {channels[channel] ? (
                    <div className="preview-thumb">
                      <img src={channels[channel].src} alt={channel} />
                      <button className="remove-btn" onClick={(e) => {
                        e.stopPropagation()
                        setChannels(prev => ({ ...prev, [channel]: null }))
                      }}>×</button>
                    </div>
                  ) : (
                    <div className="placeholder">+</div>
                  )}
                </div>
              ))}
            </div>

            <div className="preview-section">
              <div className="preview-container">
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {previewUrl ? (
                  <img src={previewUrl} alt="Packed Preview" className="main-preview" />
                ) : (
                  <div className="preview-placeholder">Preview</div>
                )}
              </div>
              <button className="download-btn" onClick={downloadTexture} disabled={!previewUrl}>
                Download Texture
              </button>
            </div>
          </>
        ) : (
          // --- SPLIT MODE UI ---
          <>
            <div className="split-input-section">
              <div
                className={`dropzone main-dropzone ${splitSource ? 'filled' : ''}`}
                onDrop={handleSplitDrop}
                onDragOver={handleDragOver}
              >
                <div className="channel-label">INPUT TEXTURE (RGB)</div>
                {splitSource ? (
                  <div className="preview-thumb">
                    <img src={splitSource.src} alt="Source" />
                    <button className="remove-btn" onClick={(e) => {
                      e.stopPropagation()
                      setSplitSource(null)
                      setSplitChannels({ r: null, g: null, b: null })
                    }}>×</button>
                  </div>
                ) : (
                  <div className="placeholder">Drop Texture Here</div>
                )}
              </div>
            </div>

            <div className="split-results-grid">
              {['r', 'g', 'b'].map(channel => (
                <div key={channel} className="split-result-card">
                  <div className={`channel-header channel-${channel}`}>
                    {channel.toUpperCase()} Channel
                  </div>
                  <div className="result-preview">
                    {splitChannels[channel] ? (
                      <img src={splitChannels[channel]} alt={channel} />
                    ) : (
                      <div className="empty-state">Waiting for input...</div>
                    )}
                  </div>
                  <button
                    className="download-mini-btn"
                    disabled={!splitChannels[channel]}
                    onClick={() => downloadChannel(splitChannels[channel], channel)}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>


    </div>
  )
}

export default App
