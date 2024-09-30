const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUniqueFolderName(desiredName, userId) {
  let name = desiredName;
  let counter = 1;
  let folderExists = await prisma.folder.findFirst({ where: { name, userId } });

  while (folderExists) {
    name = `${desiredName} (${counter})`;
    counter++;
    folderExists = await prisma.folder.findFirst({ where: { name, userId } });
  }

  return name;
}

async function createFolder(folderName, userId) {
  const uniqueName = await getUniqueFolderName(folderName, userId);
  return prisma.folder.create({
    data: { name: uniqueName }
  });
}

async function renameFolder(folderId, newName, userId) {
  const uniqueName = await getUniqueFolderName(newName, userId);
  return prisma.folder.update({
    where: { id: folderId, userId },
    data: { name: uniqueName }
  });
}

async function getFolders() {
  return prisma.folder.findMany({
    orderBy: { name: 'asc' }
  });
}

module.exports = {
  getUniqueFolderName,
  createFolder,
  renameFolder,
  getFolders
};
