const crypto = require('crypto');
const multer = require('multer');
const prisma = require('../lib/prisma');
const { storage, pathFromUrl } = require('../lib/supabase');
const { safeName } = require('../lib/format');

const MAX_BYTES = (parseInt(process.env.MAX_UPLOAD_MB, 10) || 25) * 1024 * 1024;

// Memory storage: no temp files left in ./uploads if something fails halfway.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES, files: 1 } }).single('file');

// Only ever look files up through their folder's owner.
const findOwnedFile = (fileId, userId) =>
  prisma.file.findFirst({ where: { id: fileId, folder: { userId } } });

exports.upload = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? `File is too large (max ${MAX_BYTES / 1024 / 1024} MB)`
        : 'Upload failed';
      return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: msg });
    }
    if (!req.file) return res.status(400).json({ error: 'No file selected' });

    let objectPath;
    try {
      const folder = await prisma.folder.findFirst({
        where: { id: req.body.folderId, userId: req.user.id },
      });
      if (!folder) return res.status(404).json({ error: 'Folder not found' });

      const original = Buffer.from(req.file.originalname, 'latin1').toString('utf8'); // multer mangles UTF-8 names
      objectPath = `${req.user.id}/${crypto.randomUUID()}-${safeName(original)}`;

      const bucket = storage();
      const { error } = await bucket.upload(objectPath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
      if (error) throw new Error(`Supabase upload error: ${error.message}`);

      const { data } = bucket.getPublicUrl(objectPath);
      const saved = await prisma.file.create({
        data: { name: original, size: req.file.size, url: data.publicUrl, folderId: folder.id },
      });
      res.status(201).json({ file: { id: saved.id, name: saved.name, size: saved.size } });
    } catch (e) {
      console.error('Upload failed:', e);
      if (objectPath) storage().remove([objectPath]).catch(() => {});
      res.status(500).json({ error: 'Upload failed. Please try again.' });
    }
  });
};

exports.download = async (req, res, next) => {
  try {
    const file = await findOwnedFile(req.params.fileId, req.user.id);
    if (!file) return res.status(404).render('error', { title: 'Not found', status: 404, message: 'File not found', stack: null });

    const { data, error } = await storage().download(pathFromUrl(file.url, `${req.user.id}/${file.name}`));
    if (error) throw error;

    res.set({
      'Content-Type': data.type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    });
    res.send(Buffer.from(await data.arrayBuffer()));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const file = await findOwnedFile(req.params.fileId, req.user.id);
    if (!file) return res.status(404).render('error', { title: 'Not found', status: 404, message: 'File not found', stack: null });

    await prisma.file.delete({ where: { id: file.id } });
    const { error } = await storage().remove([pathFromUrl(file.url, `${req.user.id}/${file.name}`)]);
    if (error) console.error('Storage cleanup failed:', error.message);

    req.flash('success', `“${file.name}” deleted`);
    res.redirect(`/folders?folder=${file.folderId}`);
  } catch (err) {
    next(err);
  }
};
