const express = require("express");
const { body } = require("express-validator/check");
const corridaController = require("../../controllers/corrida/");

const router = express.Router();

// GET motoapp/v1/corrida/id
router.get("/:idCorrida", corridaController.getCorrida);

// GET motoapp/v1/corrida/
router.get("/", corridaController.getCorridas);

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
  "/",
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
