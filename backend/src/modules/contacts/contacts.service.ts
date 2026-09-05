import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { cloudinary } from '../../config/cloudinary';
import { Readable } from 'stream';

export const getContacts = async (archived = false) => {
  return prisma.contact.findMany({
    where: { isArchived: archived },
    orderBy: { createdAt: 'desc' },
  });
};

export const getContactById = async (id: string) => {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new AppError(404, 'Contact not found');
  return contact;
};

export const createContact = async (data: {
  name: string;
  type: 'customer' | 'vendor' | 'both';
  email: string;
  mobile: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  return prisma.contact.create({ data });
};

export const updateContact = async (id: string, data: Partial<{
  name: string;
  type: 'customer' | 'vendor' | 'both';
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  profileImageUrl: string;
}>) => {
  await getContactById(id);
  return prisma.contact.update({ where: { id }, data });
};

export const archiveContact = async (id: string) => {
  await getContactById(id);
  return prisma.contact.update({ where: { id }, data: { isArchived: true } });
};

export const uploadContactImage = async (id: string, fileBuffer: Buffer, mimetype: string): Promise<string> => {
  await getContactById(id);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'urban-furniture/contacts', resource_type: 'image' },
      async (error, result) => {
        if (error) return reject(new AppError(500, 'Image upload failed'));
        if (!result) return reject(new AppError(500, 'No upload result'));
        const url = result.secure_url;
        await prisma.contact.update({ where: { id }, data: { profileImageUrl: url } });
        resolve(url);
      }
    );
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};
