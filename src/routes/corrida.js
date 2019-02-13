const express = require("express");
const { body } = require("express-validator/check");
const corridaController = require("../controllers/corrida");

const router = express.Router();

// GET motoapp/v1/corridas/
router.get("/v1/corridas/", corridaController.getCorridas);

// GET motoapp/v1/corrida/
router.get("/v1/corrida/", corridaController.getCorrida);

// POST motoapp/v1/corrida/
router.post(
  "/v1/corrida/",
  [
    body("origem")
      .not()
      .isEmpty(),
    body("destino")
      .not()
      .isEmpty(),
    body("idCliente")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body("status")
      .not()
      .isEmpty()
      .trim()
      .escape()
  ],
  corridaController.createCorrida
);

router.put(
  "/v1/corrida/",
  [
    body("idCorrida")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    body("idMotoqueiro")
      .trim()
      .escape(),
    body("status")
      .trim()
      .escape()
  ],
  corridaController.updateCorrida
);

module.exports = router;
