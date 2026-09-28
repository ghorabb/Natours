const fs = require('fs/promises');

const asyncHandler = require('../utils/asynchandler');
const cloudinary = require('../utils/cloudinary');

const uploadImage = async (file, publicId) => {
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
    await fs.unlink(file.path).catch(() => {});
  }
};

exports.uploadTourImagesToCloudinary = asyncHandler(async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) {
    return next();
  }

  if (req.files.imageCover) {
    const file = req.files.imageCover[0];

    req.body.imageCover = await uploadImage(file, req.body.imageCoverPublicId);

    delete req.body.imageCoverPublicId;
  }

  if (req.files.images) {
    const publicIds = req.body.imagesPublicIds || [];

    req.body.images = await Promise.all(req.files.images.map((file, index) => uploadImage(file, publicIds[index])));

    delete req.body.imagesPublicIds;
  }

  next();
});
