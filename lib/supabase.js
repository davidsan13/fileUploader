const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.SUPABASE_BUCKET || 'newFiles';
let client;

// Created lazily so the app can boot (and show a clear error) even if env vars are missing.
function storage() {
  if (!client) {
    const { SUPA_URL, SUPABASE_KEY } = process.env;
    if (!SUPA_URL || !SUPABASE_KEY) {
      throw new Error('SUPA_URL and SUPABASE_KEY must be set in .env');
    }
    client = createClient(SUPA_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  }
  return client.storage.from(BUCKET);
}

// Derive the object path from a stored public URL, falling back to the legacy
// `${userId}/${name}` layout used by files uploaded before unique keys existed.
function pathFromUrl(url, fallback) {
  const marker = `/${BUCKET}/`;
  const i = typeof url === 'string' ? url.indexOf(marker) : -1;
  return i === -1 ? fallback : decodeURIComponent(url.slice(i + marker.length));
}

module.exports = { storage, pathFromUrl };
