const express = require('express');
const TourController = require('../controllers/TourController');
const AuthController = require('../controllers/AuthController');
const ReviewRouters = require('./ReviewRouters');
const BookingRouters = require('./BookingRouters');
const { validation } = require('../middleware/validationMiddleware');
const TourValidator = require('../validators/tourValidator');
const uploadTourImagesToCloudinary = require('../controllers/uploadTourImages');

const router = express.Router();

// router.param('id', TourController.checkID);

router.use('/:tourId/reviews', ReviewRouters);
router.use('/:tourId/bookings', BookingRouters);

router.route('/top-5-cheap').get(TourController.aliasTopTour, TourController.getAllTours);
router.route('/Tours-stats').get(TourController.getToursStats);

router
  .route('/monthly-plan/:year')
  .get(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide', 'guide'),
    validation(TourValidator.monthlyPlanParam),
    TourController.getMonthlyPlan,
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(validation(TourValidator.toursWithinParam), TourController.getToursWithin);
// router.route('/tours-within').get(TourController.getToursWithin);
router
  .route('/distances/:latlng/unit/:unit')
  .get(validation(TourValidator.getDistancesParam), TourController.getDistances);

router
  .route('/')
  .get(TourController.getAllTours)
  .post(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.uploadToursImages,
    validation(TourValidator.createTour),
    uploadTourImagesToCloudinary,
    TourController.createTour,
  );

router
  .route('/:id')
  .get(validation(TourValidator.tourIdParam), TourController.getTour)
  .patch(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    TourController.uploadToursImages,
    validation(TourValidator.updateTour),
    uploadTourImagesToCloudinary,
    TourController.updateTour,
  )
  .delete(
    AuthController.protect,
    AuthController.restrictTo('admin', 'lead-guide'),
    validation(TourValidator.tourIdParam),
    TourController.deleteTour,
  );

module.exports = router;
