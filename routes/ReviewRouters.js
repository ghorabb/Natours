const express = require('express');
const AuthController = require('../controllers/AuthController');
const ReviewController = require('../controllers/ReviewController');
const { validation } = require('../middleware/validationMiddleware');
const reviewValidator = require('../validators/reviewValidator');

const router = express.Router({ mergeParams: true });

//Protect all routers after this
router.use(AuthController.protect);

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(AuthController.restrictTo('user'), validation(reviewValidator.createReview), ReviewController.createReview);

router
  .route('/:id')
  .delete(
    AuthController.restrictTo('user', 'admin'),
    validation(reviewValidator.deleteReview),
    ReviewController.deleteReview,
  )
  .patch(
    AuthController.restrictTo('user', 'admin'),
    validation(reviewValidator.updateReview),
    ReviewController.updateReview,
  )
  .get(validation(reviewValidator.getReview), ReviewController.getReview);

module.exports = router;
