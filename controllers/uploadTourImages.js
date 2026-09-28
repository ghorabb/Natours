const fs = require('fs/promises');
const asyncHandler = require('../utils/asynchandler');
const cloudinary = require('../utils/cloudinary');

const uploadImage = async (file, publicId) => {
  // Guard against missing file or path
  if (!file || !file.path) {
    throw new Error('No valid file path provided for Cloudinary upload.');
  }

  const options = {
    folder: 'natours/tours',
    resource_type: 'image',
    transformation: [
      {
        width: 2000,
        height: 1333,
        crop: 'fill',
      },
    ],
    quality: 'auto',
    fetch_format: 'auto',
  };

  if (publicId) {
    options.public_id = publicId;
    options.overwrite = true;
    options.invalidate = true;
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, options);

    return {
      publicId: result.public_id,
      url: result.secure_url,
    };
  } finally {
    // Safely delete temp file if path exists
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }
  }
};

exports.uploadTourImagesToCloudinary = asyncHandler(async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) {
    return next();
  }

  // 1. Process Cover Image
  if (req.files.imageCover && req.files.imageCover[0]) {
    const file = req.files.imageCover[0];
    const coverPublicId = req.body.imageCoverPublicId || null;

    req.body.imageCover = await uploadImage(file, coverPublicId);
    delete req.body.imageCoverPublicId;
  }

  // 2. Process Gallery Images
  if (req.files.images && req.files.images.length > 0) {
    let publicIds = req.body.imagesPublicIds || [];

    // Ensure publicIds is always an array (Multer parses single values as strings)
    if (typeof publicIds === 'string') {
      try {
        publicIds = JSON.parse(publicIds);
      } catch {
        publicIds = [publicIds];
      }
    }

    req.body.images = await Promise.all(
      req.files.images.map((file, index) => uploadImage(file, Array.isArray(publicIds) ? publicIds[index] : null)),
    );

    delete req.body.imagesPublicIds;
  }

  next();
});
