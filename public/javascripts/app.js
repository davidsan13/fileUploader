(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  let csrf = $('meta[name="csrf-token"]')?.content || '';

  /* ---------- Toasts ---------- */
  const toasts = $('#toasts');
  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = message;
    toasts.appendChild(el);
    dismissLater(el);
  }
  function dismissLater(el) {
    const ms = el.classList.contains('toast-error') ? 7000 : 4000;
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 300);
    }, ms);
  }
  $$('.toast').forEach(dismissLater);
  try {
    const pending = sessionStorage.getItem('toast');
    if (pending) { sessionStorage.removeItem('toast'); toast(pending); }
  } catch { /* storage unavailable – toast is optional */ }

  /* ---------- Dialogs ---------- */
  $$('[data-open]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const dialog = document.getElementById(btn.dataset.open);
      dialog.showModal();
      dialog.querySelector('input[type="text"]')?.focus();
      dialog.querySelector('input[type="text"]')?.select();
    })
  );
  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    $$('[data-close]', dialog).forEach((b) => b.addEventListener('click', () => dialog.close()));
  });

  const deleteFileDialog = $('#deleteFileDialog');
  $$('[data-delete-file]').forEach((btn) =>
    btn.addEventListener('click', () => {
      $('#deleteFileForm').action = btn.dataset.deleteFile;
      $('#deleteFileName').textContent = btn.dataset.name;
      deleteFileDialog.showModal();
    })
  );

  /* ---------- Mobile sidebar ---------- */
  const app = $('.app');
  const toggles = $$('[data-sidebar-toggle]');
  function setSidebar(open) {
    app?.classList.toggle('sidebar-open', open);
    toggles.forEach((t) => t.hasAttribute('aria-expanded') && t.setAttribute('aria-expanded', String(open)));
  }
  toggles.forEach((t) => t.addEventListener('click', () => setSidebar(!app.classList.contains('sidebar-open'))));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setSidebar(false); });

  /* ---------- Upload ---------- */
  const zone = $('#dropzone');
  if (!zone) return;

  const input = $('#fileInput');
  const progress = $('.progress', zone);
  const label = $('.progress-label', zone);
  const bar = $('.progress-bar', zone);
  const maxBytes = Number(zone.dataset.maxMb) * 1024 * 1024;

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });
  input.addEventListener('change', () => { upload([...input.files]); input.value = ''; });

  ['dragenter', 'dragover'].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('dragover'); })
  );
  ['dragleave', 'drop'].forEach((ev) =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('dragover'); })
  );
  zone.addEventListener('drop', (e) => upload([...e.dataTransfer.files]));

  function post(file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/files/upload');
      xhr.setRequestHeader('x-csrf-token', csrf);
      xhr.setRequestHeader('accept', 'application/json');
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
      xhr.onload = () => {
        let body = {};
        try { body = JSON.parse(xhr.responseText); } catch { /* non-JSON error page */ }
        if (xhr.status >= 200 && xhr.status < 300) return resolve(body);
        const err = new Error(body.error || 'Upload failed');
        err.status = xhr.status;
        reject(err);
      };
      xhr.onerror = () => reject(new Error('Network error'));
      const form = new FormData();
      form.append('folderId', zone.dataset.folderId); // must precede the file so multer sees it
      form.append('file', file);
      xhr.send(form);
    });
  }

  async function sendOne(file, onProgress) {
    try {
      return await post(file, onProgress);
    } catch (err) {
      if (err.status !== 403) throw err;
      // Token was stale (e.g. page loaded before the session changed): fetch a fresh one and retry once.
      const res = await fetch('/csrf-token', { headers: { accept: 'application/json' }, cache: 'no-store' });
      if (res.status === 401) { location.href = '/users/login'; throw new Error('Please log in again'); }
      csrf = (await res.json()).token;
      const meta = $('meta[name="csrf-token"]');
      if (meta) meta.content = csrf;
      return post(file, onProgress);
    }
  }

  async function upload(files) {
    if (!files.length) return;
    zone.classList.add('busy');
    progress.hidden = false;
    let done = 0;

    for (const [i, file] of files.entries()) {
      label.textContent = `Uploading ${file.name} (${i + 1} of ${files.length})`;
      bar.style.width = '0';
      if (file.size > maxBytes) { toast(`${file.name} is larger than ${zone.dataset.maxMb} MB`, 'error'); continue; }
      try {
        await sendOne(file, (f) => { bar.style.width = `${Math.round(f * 100)}%`; });
        done++;
      } catch (err) {
        toast(`${file.name}: ${err.message}`, 'error');
      }
    }

    zone.classList.remove('busy');
    progress.hidden = true;
    if (done) {
      try { sessionStorage.setItem('toast', `Uploaded ${done} ${done === 1 ? 'file' : 'files'}`); } catch { /* optional */ }
      location.reload();
    }
  }
})();
