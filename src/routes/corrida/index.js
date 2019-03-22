const express = require("express");
const { body, param } = require("express-validator/check");

const corridaController = require("../../controllers/corrida/");
const auth = require("../../utils/auth/");

const router = express.Router();

// GET motoapp/v1/corrida/id
router.get("/:idCorrida", auth, corridaController.getCorrida);

// GET motoapp/v1/corrida/
router.get("/", auth, corridaController.getCorridas);

// POST motoapp/v1/corrida/
router.post(
  "/",
  [
    body("origem")
      .not()
      .isEmpty(),
    body("destino")
      .not()
      .isEmpty(),
    body("status")
      .not()
      .isEmpty(),
    body("distancia")
      .not()
      .isEmpty(),
    body("tempo")
      .not()
      .isEmpty()
  ],
  // auth,
  corridaController.createCorrida
);

// PUT motoapp/v1/corrida/id
router.put(
  "/:idCorrida",
  [
    param("idCorrida")
      .not()
      .isEmpty(),
    body("idMotoqueiro")
      .trim()
      .escape(),
    body("status")
      .trim()
      .escape()
      .not()
      .isEmpty()
  ],
  auth,
  corridaController.updateCorrida
);

// DELETE motoapp/v1/corrida/id
router.delete(
  "/:idCorrida",
  [
    param("idCorrida")
      .not()
      .isEmpty()
  ],
  auth,
  corridaController.deleteCorrida
);

module.exports = router;
