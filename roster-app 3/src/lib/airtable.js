// Airtable API client — calls api.airtable.com directly from the browser.
// Airtable supports CORS on their records API for PAT-authenticated requests.

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

let _pat = null;

export function setPAT(pat) { _pat = pat; }
export function getPAT() { return _pat; }

async function airtableFetch(path, options = {}) {
  const url = `https://api.airtable.com${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${_pat}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Airtable error ${res.status}`);
  }
  return res.json();
}

// Validate PAT — simple records fetch, no special API permissions needed
export async function validatePAT() {
  const data = await airtableFetch(`/v0/${BASE_ID}/${TABLES.SHOWS}?maxRecords=1`);
  return Array.isArray(data.records);
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
  return airtableFetch(`/v0/${BASE_ID}/${tableId}`, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
}
