const multer = require('multer');
const AppError = require('./appError');

const uploadphoto = () => {
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images', 400), false);
    }
  };
  return multer({
    storage: multer.diskStorage({}),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
};

module.exports = uploadphoto;
