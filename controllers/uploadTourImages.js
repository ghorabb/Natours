const fs = require('fs/promises');

const asyncHandler = require('../utils/asynchandler');
const cloudinary = require('../utils/cloudinary');

const uploadTourImagesToCloudinary = asyncHandler(async (req, res, next) => {
  if (!req.files) return next();

  if (req.files.imageCover) {
    const file = req.files.imageCover[0];

    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'natours/tours',
        public_id: `tour-${req.params.id || 'new'}-cover`,
        overwrite: true,
        invalidate: true,
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
      });

      req.body.imageCover = {
        publicId: result.public_id,
        url: result.secure_url,
      };
    } finally {
      await fs.unlink(file.path).catch(() => {});
    }
  }

  if (req.files.images) {
    req.body.images = await Promise.all(
      req.files.images.map(async (file, i) => {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'natours/tours',
            public_id: `tour-${req.params.id || 'new'}-${i + 1}`,
            overwrite: true,
            invalidate: true,
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
          });

          return {
            publicId: result.public_id,
            url: result.secure_url,
          };
        } finally {
          await fs.unlink(file.path).catch(() => {});
        }
      }),
    );
  }

  next();
});

module.exports = uploadTourImagesToCloudinary;
