import { useState } from 'react';
import { setPAT, validatePAT } from '../lib/airtable';

export default function LoginScreen({ onLogin }) {
  const [pat, setPat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!pat.trim()) return;
    setLoading(true);
    setError('');
    try {
      setPAT(pat.trim());
      await validatePAT();
      onLogin();
    } catch (e) {
      setError('Invalid token or no access to SEA-RBC base. Check your PAT and try again.');
      setPAT(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">RBC</div>
        <h1>ROSTER BUILDER</h1>
        <p>SEA-RBC Production · Des Moines, WA</p>

        <div className="field">
          <label>Airtable Personal Access Token</label>
          <input
            type="password"
            placeholder="patXXXXXXXXXXXXXX.XXXX..."
            value={pat}
            onChange={e => setPat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: 16 }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          onClick={handleSubmit}
          disabled={loading || !pat.trim()}
        >
          {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> Connecting…</> : 'Connect to Airtable →'}
        </button>

        <div className="login-hint">
          Need a PAT?{' '}
          <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer">
            airtable.com/create/tokens
          </a>
          {' '}— scope: data.records:read + data.records:write on the SEA-RBC base.
          <br /><br />
          Your token is stored in memory only and never leaves your browser.
        </div>
      </div>
    </div>
  );
}
