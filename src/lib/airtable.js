// Airtable API client
// Base config
export const BASE_ID = 'appLJLLEdSBYuAJf9';

export const TABLES = {
  STAFF: 'tblmPsVLmuhqTPAxv',
  SHOWS: 'tblhRnA2QTElNnKJm',
  SHOW_DAYS: 'tblfi2EjeRtaDeKQ4',
  CREW_ASSIGNMENTS: 'tblnQvw5Mw8RMh8qC',
  SHOW_TEMPLATES: 'tbleCzscverJkurQR',
  CALL_SHEETS: 'tblBGOdgvljvuLwJB',
  PRODUCTS: 'tblCURM8nXgSS69gS',
};

// PAT stored in memory (set on login)
let _pat = null;

export function setPAT(pat) {
  _pat = pat;
}

export function getPAT() {
  return _pat;
}

async function airtableFetch(path, options = {}) {
  const url = `https://api.airtable.com${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${_pat}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Airtable error ${res.status}`);
  }
  return res.json();
}

// Fetch all records from a table (handles pagination)
export async function fetchAllRecords(tableId, params = {}) {
  const records = [];
  let offset = null;
  do {
    const query = new URLSearchParams(params);
    if (offset) query.set('offset', offset);
    const data = await airtableFetch(`/v0/${BASE_ID}/${tableId}?${query}`);
    records.push(...(data.records || []));
    offset = data.offset || null;
  } while (offset);
  return records;
}

// Create a single record
export async function createRecord(tableId, fields) {
  const data = await airtableFetch(`/v0/${BASE_ID}/${tableId}`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
  return data;
}

// Validate PAT by fetching the base info
export async function validatePAT() {
  const data = await airtableFetch(`/v0/meta/bases/${BASE_ID}/tables`);
  return !!data.tables;
}
