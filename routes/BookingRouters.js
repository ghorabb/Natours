const express = require('express');
const AuthController = require('../controllers/AuthController');
const BookingController = require('../controllers/BookingController');
const { validation } = require('../middleware/validationMiddleware');
const bookingValidator = require('../validators/bookingValidator');

const router = express.Router({ mergeParams: true });

//Protect all routers after this
router.use(AuthController.protect);

router.get('/my-bookings', BookingController.getMyBookings);
router.post('/:tourId', validation(bookingValidator.createBooking), BookingController.createBooking);

//Authorized the access to admin adn lead-guide only
router.use(AuthController.restrictTo('admin', 'lead-guide'));

router.route('/').get(BookingController.getAllBookings);
router
  .route('/:id')
  .get(validation(bookingValidator.getBooking), BookingController.getBooking)
  .patch(validation(bookingValidator.updateBooking), BookingController.updateBooking)
  .delete(validation(bookingValidator.deleteBooking), BookingController.deleteBooking);

module.exports = router;
