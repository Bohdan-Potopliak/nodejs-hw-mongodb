import cloudinary from './cloudinary.js';

export const uploadToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'image',
  });
  return result.secure_url;
};
