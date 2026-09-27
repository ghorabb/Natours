const { Readable } = require('stream');
const cloudinary = require('./cloudinary');

const uploadToCloudinary = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    Readable.from(buffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;
