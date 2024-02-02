const express = require('express');

const tourController = require('../controllers/toursController');
const authController = require('../controllers/authController');

const router = express.Router();

// param middleware
// router.param("id", tourController.verifyID);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
