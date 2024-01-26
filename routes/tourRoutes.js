const express = require("express");

const router = express.Router();

const tourController = require("./../controllers/toursController");
const authController = require("./../controllers/authController");

// param middleware
// router.param("id", tourController.verifyID);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrict("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
