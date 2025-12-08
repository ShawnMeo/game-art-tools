import { useState } from 'react';
import { unlock, lock, isUnlocked } from './unlockKey';

export function UnlockModal({ onClose, onUnlock }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (unlock(key)) {
            onUnlock();
            onClose();
        } else {
            setError('Invalid unlock key. Get yours at patreon.com/[yourpage]');
        }
    };

    return (
        <div className="unlock-overlay">
            <div className="unlock-modal">
                <button className="unlock-close" onClick={onClose}>×</button>
                <div className="unlock-icon">🔐</div>
                <h2>Unlock Pro Features</h2>
                <p>Enter your Patreon unlock key to access batch processing and other premium features.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value.toUpperCase())}
                        placeholder="PATRON-XXX-XXXX"
                        className="unlock-input"
                    />
                    {error && <div className="unlock-error">{error}</div>}
                    <button type="submit" className="unlock-btn">Unlock</button>
                </form>

                <a
                    href="https://www.patreon.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="unlock-link"
                >
                    Get a key on Patreon →
                </a>
            </div>
        </div>
    );
}

export function ProBadge({ onClick }) {
    return (
        <button className="pro-badge" onClick={onClick}>
            PRO ✨
        </button>
    );
}

export function UnlockedBadge({ onClick }) {
    return (
        <button className="unlocked-badge" onClick={onClick} title="Click to manage">
            ✓ PRO
        </button>
    );
}
