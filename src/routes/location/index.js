const express = require("express");
const { body, param } = require("express-validator/check");

const motoqueiroLocationController = require("../../controllers/localizacao/");
const auth = require("../../utils/auth/");

const router = express.Router();

// GET motoapp/v1/localizacao/id
router.get(
  "/:idMotoqueiro",
  auth,
  motoqueiroLocationController.getMotoqueiroLocation
);

// GET motoapp/v1/localizacao/
router.get("/", auth, motoqueiroLocationController.getMotoqueiroLocations);

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
  motoqueiroLocationController.createMotoqueiroLocation
);

// PUT motoapp/v1/corrida/id
router.put(
  "/:idMotoqueiro",
  [
    param("idMotoqueiro")
      .not()
      .isEmpty(),
    body("location")
      .not()
      .isEmpty()
  ],
  auth,
  motoqueiroLocationController.updateMotoqueiroLocation
);

module.exports = router;
