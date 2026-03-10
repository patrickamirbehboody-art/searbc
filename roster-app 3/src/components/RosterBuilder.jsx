import { useState, useEffect, useMemo } from 'react';
import { fetchAllRecords, createRecord, TABLES } from '../lib/airtable';
import {
  DEPARTMENTS, TEMPLATES, DAY_CATEGORIES, PRODUCT_COLORS, VENUES, CALL_TIMES
} from '../lib/constants';
import DeptCard from './DeptCard';
import { toast } from './Toast';

function buildRosterLabel(show, date, dayCategory) {
  if (!show || !date || !dayCategory) return '';
  const product = show.fields['Product'] || '';
  const showName = show.fields['Show Name'] || show.fields['Name'] || '';
  return `${product} · ${showName} · ${dayCategory} · ${date}`;
}

export default function RosterBuilder() {
  // ===== DATA LOADING =====
  const [staff, setStaff] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // ===== CONFIG STATE =====
  const [showId, setShowId] = useState('');
  const [date, setDate] = useState('');
  const [dayCategory, setDayCategory] = useState('Show Day');
  const [venue, setVenue] = useState('Riot Games Arena');
  const [callTime, setCallTime] = useState('10:00 AM');
  const [goTime, setGoTime] = useState('1:00 PM');
  const [notes, setNotes] = useState('');

  // ===== ROSTER STATE =====
  // { dept: [{staffId, isLead}] }
  const [roster, setRoster] = useState({});

  // ===== SAVE STATE =====
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null); // { showDayId, assignmentCount }

  // Load data on mount
  useEffect(() => {
    async function load() {
      try {
        const [staffRecs, showRecs] = await Promise.all([
          fetchAllRecords(TABLES.STAFF, { sort: [{ field: 'Name' }] }),
          fetchAllRecords(TABLES.SHOWS, { sort: [{ field: 'Show Name' }] }),
        ]);
        setStaff(staffRecs);
        setShows(showRecs);
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group staff by department
  const staffByDept = useMemo(() => {
    const map = {};
    for (const dept of DEPARTMENTS) {
      map[dept] = staff.filter(s => s.fields['Department'] === dept);
    }
    return map;
  }, [staff]);

  // Derive selected show object
  const selectedShow = useMemo(() => shows.find(s => s.id === showId), [shows, showId]);
  const product = selectedShow?.fields?.['Product'] || '';
  const productColor = PRODUCT_COLORS[product] || 'var(--red)';

  // Auto-load template when show or day category changes
  useEffect(() => {
    if (!product || !dayCategory) return;
    const key = `${product}|${dayCategory}`;
    const counts = TEMPLATES[key] || [0, 0, 0, 0, 0, 0, 0];

    // Build default roster with FT staff as defaults for each slot
    const newRoster = {};
    DEPARTMENTS.forEach((dept, i) => {
      const count = counts[i];
      const ftStaff = staffByDept[dept].filter(s =>
        s.fields['Employer'] === 'Gravity FT' || s.fields['Employer'] === 'Riot FT'
      );
      const slots = [];
      for (let j = 0; j < count; j++) {
        slots.push({ staffId: ftStaff[j]?.id || '', isLead: j === 0 });
      }
      newRoster[dept] = slots;
    });
    setRoster(newRoster);
  }, [product, dayCategory, staffByDept]);

  const updateDeptSlots = (dept, slots) => {
    setRoster(prev => ({ ...prev, [dept]: slots }));
  };

  // Count total assigned crew
  const totalAssigned = useMemo(() => {
    return Object.values(roster).flat().filter(s => s.staffId).length;
  }, [roster]);

  const totalSlots = useMemo(() => {
    return Object.values(roster).flat().length;
  }, [roster]);

  // ===== SAVE LOGIC =====
  const handleSave = async () => {
    if (!showId || !date || !dayCategory) {
      toast('Please fill in Show, Date, and Day Category before saving.', 'error');
      return;
    }
    if (totalAssigned === 0) {
      toast('No crew assigned — please add at least one person before saving.', 'error');
      return;
    }

    setSaving(true);
    try {
      // 1. Create Show Day
      const showDayLabel = buildRosterLabel(selectedShow, date, dayCategory);
      const showDayRec = await createRecord(TABLES.SHOW_DAYS, {
        'Show Day': showDayLabel,
        'Date': date,
        'Day Category': dayCategory,
        'Stage / Venue Detail': venue,
        'General Call Time': callTime,
        'Show / Go Time': goTime,
        'Status': 'Upcoming',
        'Product': product,
        'Notes': notes || undefined,
        'Show': showId ? [showId] : undefined,
      });
      const showDayId = showDayRec.id;

      // 2. Create Crew Assignments
      let assignmentCount = 0;
      for (const dept of DEPARTMENTS) {
        const slots = roster[dept] || [];
        for (let i = 0; i < slots.length; i++) {
          const slot = slots[i];
          if (!slot.staffId) continue;
          const staffRec = staff.find(s => s.id === slot.staffId);
          const positionValue = staffRec?.fields?.['Position'] || '';

          // Map staff Position to allowed Crew Assignment Position values
          const positionMap = {
            'Production Manager': 'Production Coordinator',
            'Production Assistant': 'Production Coordinator',
            'EVS Lead': 'EVS Lead',
            'EVS Operator': 'EVS Operator',
            'Jr. EVS Operator': 'Jr EVS Operator',
            'Jr EVS Operator': 'Jr EVS Operator',
            'Audio Supervisor': 'Audio 1',
            'Audio 1': 'Audio 1',
            'A1': 'Audio 1',
            'A2': 'Audio 1',
            'TOC Manager': 'Lead TOC Operator',
            'Lead TOC Operator': 'Lead TOC Operator',
            'TOC Operator': 'TOC Operator',
            'Jr. TOC Operator': 'TOC Operator',
            'Lead Engineer': 'Broadcast Engineer',
            'Broadcast Engineer': 'Broadcast Engineer',
            'Sr. Broadcast Engineer': 'Broadcast Engineer',
            'Jr. Comms Engineer': 'Broadcast Engineer',
            'Jr. Comms Operator': 'Broadcast Engineer',
            'Media Asset Manager': 'Media Coordinator',
            'Media Coordinator': 'Media Coordinator',
            'Lead Graphics Operator': 'GFX Operator',
            'GFX Operator': 'GFX Operator',
            'Tagboard Operator': 'GFX Operator',
            'Graphics Producer': 'GFX Operator',
          };

          const assignmentPosition = positionMap[positionValue] || 'Production Coordinator';

          await createRecord(TABLES.CREW_ASSIGNMENTS, {
            'Assignment Name': `${staffRec?.fields?.['Name']} – ${selectedShow?.fields?.['Show Name'] || ''} – ${date}`,
            'Date': date,
            'Day Type': dayCategory === 'Rehearsal Day' ? 'Rehearsal' : dayCategory,
            'Call Time': callTime,
            'Position': assignmentPosition,
            'Department': dept,
            'Status': 'Confirmed',
            'Confirmed': true,
            'Hierarchy Rank': i + 1,
            'Department Lead': i === 0,
            'Employee': [slot.staffId],
            'Show Days': [showDayId],
            'Show (Link)': [showId],
          });
          assignmentCount++;
        }
      }

      // 3. Create Draft Call Sheet
      await createRecord(TABLES.CALL_SHEETS, {
        'Show Day': showDayLabel,
        'Status': 'Draft',
        'Show Days': [showDayId],
      });

      setSaved({ showDayId, showDayLabel, assignmentCount });
      toast(`Saved! ${assignmentCount} crew assigned.`, 'success');
    } catch (e) {
      toast(`Save failed: ${e.message}`, 'error');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSaved(null);
    setShowId('');
    setDate('');
    setDayCategory('Show Day');
    setVenue('Riot Games Arena');
    setCallTime('10:00 AM');
    setGoTime('1:00 PM');
    setNotes('');
    setRoster({});
  };

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div className="loading-text">Loading RBC data…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="loading-screen">
        <div className="error-banner" style={{ maxWidth: 420 }}>
          <span>⚠</span>
          <div>
            <strong>Failed to load data</strong><br />
            {loadError}
          </div>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="success-screen">
        <div className="success-icon">✓</div>
        <h2>ROSTER SAVED</h2>
        <p>Show Day and crew assignments have been written to Airtable. A draft call sheet has been created.</p>
        <div className="success-details">
          <div><strong>Show Day</strong> {saved.showDayLabel}</div>
          <div><strong>Crew Assigned</strong> {saved.assignmentCount} people</div>
          <div><strong>Call Sheet</strong> Draft created</div>
          <div><strong>Airtable ID</strong> {saved.showDayId}</div>
        </div>
        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleReset}>Build Another Roster</button>
          <a
            className="btn btn-secondary"
            href={`https://airtable.com/${import.meta.env.VITE_BASE_ID || 'appLJLLEdSBYuAJf9'}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Airtable →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      {/* LEFT: Config Panel */}
      <div className="config-panel">
        <div className="panel-section">
          <div className="section-label">Show</div>

          <div className="field">
            <label>Show</label>
            <select value={showId} onChange={e => setShowId(e.target.value)}>
              <option value="">Select a show…</option>
              {['VCT', 'LCS', 'TFT', '2XKO', 'Other'].map(prod => {
                const prodShows = shows.filter(s => s.fields['Product'] === prod);
                if (!prodShows.length) return null;
                return (
                  <optgroup key={prod} label={`── ${prod} ──`}>
                    {prodShows.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fields['Show Name'] || s.fields['Name']}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="field">
            <label>Day Category</label>
            <select value={dayCategory} onChange={e => setDayCategory(e.target.value)}>
              {DAY_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="panel-section">
          <div className="section-label">Logistics</div>

          <div className="field">
            <label>Venue</label>
            <select value={venue} onChange={e => setVenue(e.target.value)}>
              {VENUES.map(v => <option key={v}>{v}</option>)}
              <option value="custom">Custom…</option>
            </select>
          </div>

          {venue === 'custom' && (
            <div className="field">
              <label>Custom Venue</label>
              <input type="text" placeholder="Venue name" onChange={e => setVenue(e.target.value)} />
            </div>
          )}

          <div className="field-row">
            <div className="field">
              <label>Call Time</label>
              <select value={callTime} onChange={e => setCallTime(e.target.value)}>
                {CALL_TIMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Go Time</label>
              <select value={goTime} onChange={e => setGoTime(e.target.value)}>
                {CALL_TIMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes for the show day…"
              rows={3}
            />
          </div>
        </div>

        <div className="panel-section" style={{ flex: 1 }}>
          <div className="section-label">Template</div>
          {product ? (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 2 }}>
              {DEPARTMENTS.map((dept, i) => {
                const key = `${product}|${dayCategory}`;
                const counts = TEMPLATES[key] || [0,0,0,0,0,0,0];
                const count = counts[i];
                if (count === 0) return null;
                return (
                  <div key={dept} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{dept}</span>
                    <span className="mono" style={{ color: 'var(--text)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Select a show to load template
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Roster Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Show header */}
        {selectedShow && date ? (
          <div className="roster-panel" style={{ paddingBottom: 0 }}>
            <div className="show-header" style={{ '--show-color': productColor }}>
              <div className="show-header-left">
                <h2>
                  {selectedShow.fields['Show Name'] || selectedShow.fields['Name']}
                </h2>
                <div className="show-header-meta">
                  <span>
                    <span
                      className="product-dot"
                      style={{ background: productColor }}
                    />
                    {product}
                  </span>
                  <span>
                    📅 {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>
                    <span style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '1px 6px',
                      borderRadius: 2,
                      fontSize: 10,
                      letterSpacing: 1,
                    }}>
                      {dayCategory.toUpperCase()}
                    </span>
                  </span>
                  <span>📍 {venue}</span>
                </div>
              </div>
              <div className="show-header-right">
                <div className="time-display">
                  <span style={{ color: 'var(--text-muted)' }}>CALL </span>
                  <span className="time-call">{callTime}</span>
                </div>
                <div className="time-display">
                  <span style={{ color: 'var(--text-muted)' }}>GO </span>
                  <span className="time-go">{goTime}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Dept cards */}
        <div className="roster-panel" style={{ flex: 1, overflow: 'auto' }}>
          {!selectedShow || !date ? (
            <div className="empty-roster">
              <div style={{ fontSize: 48, opacity: 0.2 }}>⬡</div>
              <p>Select a show and date to begin building a roster</p>
              <small>Templates will auto-populate based on product and day type</small>
            </div>
          ) : (
            <div className="dept-grid">
              {DEPARTMENTS.map(dept => {
                const slots = roster[dept] || [];
                if (!product) return null;
                const key = `${product}|${dayCategory}`;
                const counts = TEMPLATES[key] || [0,0,0,0,0,0,0];
                const deptIdx = DEPARTMENTS.indexOf(dept);
                if (counts[deptIdx] === 0 && slots.length === 0) return null;
                return (
                  <DeptCard
                    key={dept}
                    dept={dept}
                    slots={slots}
                    staffByDept={staffByDept}
                    onChange={(newSlots) => updateDeptSlots(dept, newSlots)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="action-bar">
          <div className="roster-stats">
            <div className="stat">
              <span>Crew</span>
              <span className="stat-val">{totalAssigned}/{totalSlots}</span>
            </div>
            <div className="stat">
              <span>Depts</span>
              <span className="stat-val">
                {Object.values(roster).filter(slots => slots.some(s => s.staffId)).length}
              </span>
            </div>
            {selectedShow && (
              <div className="stat">
                <span>Show</span>
                <span className="stat-val" style={{ color: productColor }}>
                  {selectedShow.fields['Show Name'] || ''}
                </span>
              </div>
            )}
          </div>

          <div className="btn-group">
            <button className="btn btn-ghost" onClick={handleReset}>
              Clear
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSave}
              disabled={saving || !showId || !date || totalAssigned === 0}
            >
              {saving ? (
                <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> Saving to Airtable…</>
              ) : (
                '✓ Save Roster to Airtable'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
