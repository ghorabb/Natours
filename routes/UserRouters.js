const express = require('express');
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');
const BookingRouters = require('./BookingRouters');
const { validation } = require('../middleware/validationMiddleware');
const authValidator = require('../validators/authValidator');
const userValidator = require('../validators/userValidator');

const router = express.Router();

router.use('/:userId/bookings', BookingRouters);

router.route('/signup').post(validation(authValidator.signup), AuthController.signup);
router.route('/activateAccount').post(validation(authValidator.activateAccount), AuthController.activateAccount);
router.route('/login').post(validation(authValidator.login), AuthController.login);
router.route('/forgotPassword').post(validation(authValidator.forgotPassword), AuthController.forgotPassword);
router.route('/resetPassword').patch(validation(authValidator.resetPassword), AuthController.resetPassword);

//Protect all routers after this
router.use(AuthController.protect);

router.route('/updatePassword').patch(validation(authValidator.updatePassword), AuthController.updatePassword);

router
  .route('/updateMe')
  .patch(
    UserController.uploadUserPhoto,
    validation(userValidator.updateMe),
    UserController.updatePhoto,
    UserController.updateMe,
  );

router.route('/deleteMe').delete(UserController.deleteMe);
router.route('/me').get(UserController.getMe);

//Authorized routes
router.use(AuthController.restrictTo('admin'));

router.route('/').get(UserController.getAllUsers);
router
  .route('/:id')
  .get(validation(userValidator.getUser), UserController.getUser)
  .patch(validation(userValidator.updateUser), UserController.updateUser)
  .delete(validation(userValidator.deleteUser), UserController.deleteUser);

module.exports = router;
