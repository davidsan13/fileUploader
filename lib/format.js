const KINDS = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'],
  doc: ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'],
  sheet: ['xls', 'xlsx', 'csv', 'ods'],
  slides: ['ppt', 'pptx', 'key'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  media: ['mp3', 'wav', 'mp4', 'mov', 'mkv', 'webm', 'm4a'],
  code: ['js', 'ts', 'json', 'html', 'css', 'py', 'java', 'c', 'cpp', 'sh', 'sql', 'yml', 'yaml'],
};

function extension(name = '') {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1).toLowerCase() : '';
}

function fileKind(name) {
  const ext = extension(name);
  return Object.keys(KINDS).find((k) => KINDS[k].includes(ext)) || 'other';
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let n = bytes / 1024;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) { n /= 1024; u++; }
  return `${n >= 10 ? Math.round(n) : n.toFixed(1)} ${units[u]}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Strip path separators / odd characters so names are safe as storage keys.
function safeName(name = 'file') {
  return name.normalize('NFKD').replace(/[^\w.\- ]+/g, '_').replace(/\s+/g, '_').slice(-120) || 'file';
}

module.exports = { extension, fileKind, formatBytes, formatDate, safeName };
