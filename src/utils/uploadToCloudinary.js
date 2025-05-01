import cloudinary from './cloudinary.js';

export const uploadToCloudinary = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', public_id: `contacts/${filename}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer);
  });
};
