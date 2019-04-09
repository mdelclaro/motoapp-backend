const express = require("express");
const { body } = require("express-validator/check");

const locationController = require("../controllers/location");
const auth = require("../middlewares/auth");

const router = express.Router();

// GET motoapp/v1/localizacao/id
router.get("/:idMotoqueiro", auth, locationController.getLocation);

// GET motoapp/v1/localizacao/
router.get("/", auth, locationController.getLocations);

// POST motoapp/v1/localizacao/
router.post(
  "/",
  [
    body("idMotoqueiro")
      .not()
      .isEmpty(),
    body("location")
      .not()
      .isEmpty()
  ],
  auth,
  locationController.createLocation
);

// PUT motoapp/v1/corrida/id
// router.put(
//   "/:idMotoqueiro",
//   [
//     param("idMotoqueiro")
//       .not()
//       .isEmpty(),
//     body("location")
//       .not()
//       .isEmpty()
//   ],
//   auth,
//   locationController.updateMotoqueiroLocation
// );

module.exports = router;
