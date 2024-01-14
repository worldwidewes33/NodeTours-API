const express = require("express");

const router = express.Router();

const tourController = require("./../controllers/toursController");

// param middleware
// router.param("id", tourController.verifyID);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
