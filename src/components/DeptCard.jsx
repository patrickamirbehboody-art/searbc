import { DEPT_COLORS, DEPT_SHORT } from '../lib/constants';

export default function DeptCard({ dept, slots, staffByDept, onChange }) {
  const color = DEPT_COLORS[dept];
  const deptStaff = staffByDept[dept] || [];

  const updateSlot = (idx, staffId) => {
    const newSlots = [...slots];
    newSlots[idx] = { ...newSlots[idx], staffId };
    onChange(newSlots);
  };

  const addSlot = () => {
    onChange([...slots, { staffId: '', isLead: false }]);
  };

  const removeSlot = (idx) => {
    const newSlots = slots.filter((_, i) => i !== idx);
    // Re-assign lead to first slot if needed
    if (newSlots.length > 0 && !newSlots[0].isLead) {
      newSlots[0] = { ...newSlots[0], isLead: true };
    }
    onChange(newSlots);
  };

  const filledCount = slots.filter(s => s.staffId).length;

  return (
    <div className="dept-card">
      <div className="dept-card-header">
        <div className="dept-name">
          <div className="dept-color-bar" style={{ background: color }} />
          {DEPT_SHORT[dept]}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 11 }}>
            {dept}
          </span>
        </div>
        <div className="dept-count mono">
          {filledCount}/{slots.length}
        </div>
      </div>

      <div className="dept-slots">
        {slots.length === 0 ? (
          <div style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No slots — add crew below
          </div>
        ) : (
          slots.map((slot, idx) => (
            <div key={idx} className={`crew-slot ${idx === 0 ? 'is-lead' : ''}`}>
              <div className="slot-lead-star">
                {idx === 0 ? '★' : <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{idx + 1}</span>}
              </div>
              <select
                className="slot-select"
                value={slot.staffId}
                onChange={e => updateSlot(idx, e.target.value)}
              >
                <option value="">— Unassigned —</option>
                {deptStaff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fields['Name']}
                    {s.fields['Employer'] === 'Gravity FT' || s.fields['Employer'] === 'Riot FT' ? '' : ' (FL)'}
                  </option>
                ))}
              </select>
              {slot.staffId && (
                <span className="slot-position">
                  {deptStaff.find(s => s.id === slot.staffId)?.fields?.['Position'] || ''}
                </span>
              )}
              <button className="slot-remove" onClick={() => removeSlot(idx)} title="Remove slot">×</button>
            </div>
          ))
        )}

        <button className="dept-add-slot" onClick={addSlot}>
          + Add slot
        </button>
      </div>
    </div>
  );
}
