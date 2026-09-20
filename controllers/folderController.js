const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { storage, pathFromUrl } = require('../lib/supabase');

const nameRule = body('name')
  .trim()
  .isLength({ min: 1, max: 60 }).withMessage('Folder name must be 1–60 characters');

// Appends "(1)", "(2)"… so a user never has two folders with the same name.
async function uniqueName(desired, userId, excludeId) {
  let name = desired;
  for (let i = 1; ; i++) {
    const clash = await prisma.folder.findFirst({
      where: { name, userId, ...(excludeId && { NOT: { id: excludeId } }) },
    });
    if (!clash) return name;
    name = `${desired} (${i})`;
  }
}

exports.index = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { file: true } } },
    });

    // First visit: give the user somewhere to put files.
    if (!folders.length) {
      await prisma.folder.create({ data: { name: 'My Files', userId } });
      return res.redirect('/folders');
    }

    const currentFolder = folders.find((f) => f.id === req.query.folder) || folders[0];
    const files = await prisma.file.findMany({
      where: { folderId: currentFolder.id },
      orderBy: { createAt: 'desc' },
    });
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    res.render('index', { title: currentFolder.name, folders, currentFolder, files, totalSize });
  } catch (err) {
    next(err);
  }
};

exports.create = [
  nameRule,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/folders');
      }
      const folder = await prisma.folder.create({
        data: { name: await uniqueName(req.body.name, req.user.id), userId: req.user.id },
      });
      req.flash('success', `Folder “${folder.name}” created`);
      res.redirect(`/folders?folder=${folder.id}`);
    } catch (err) {
      next(err);
    }
  },
];

exports.rename = [
  nameRule,
  async (req, res, next) => {
    try {
      const { folderId } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect(`/folders?folder=${folderId}`);
      }
      const folder = await prisma.folder.findFirst({ where: { id: folderId, userId: req.user.id } });
      if (!folder) return res.status(404).render('error', { title: 'Not found', status: 404, message: 'Folder not found', stack: null });

      await prisma.folder.update({
        where: { id: folder.id },
        data: { name: await uniqueName(req.body.name, req.user.id, folder.id) },
      });
      req.flash('success', 'Folder renamed');
      res.redirect(`/folders?folder=${folder.id}`);
    } catch (err) {
      next(err);
    }
  },
];

exports.remove = async (req, res, next) => {
  try {
    const folder = await prisma.folder.findFirst({
      where: { id: req.params.folderId, userId: req.user.id },
      include: { file: true },
    });
    if (!folder) return res.status(404).render('error', { title: 'Not found', status: 404, message: 'Folder not found', stack: null });

    // Remove the stored objects too, otherwise they'd be orphaned in Supabase.
    const paths = folder.file.map((f) => pathFromUrl(f.url, `${req.user.id}/${f.name}`));
    if (paths.length) {
      const { error } = await storage().remove(paths);
      if (error) console.error('Storage cleanup failed:', error.message);
    }
    await prisma.$transaction([
      prisma.file.deleteMany({ where: { folderId: folder.id } }),
      prisma.folder.delete({ where: { id: folder.id } }),
    ]);
    req.flash('success', `Folder “${folder.name}” deleted`);
    res.redirect('/folders');
  } catch (err) {
    next(err);
  }
};
