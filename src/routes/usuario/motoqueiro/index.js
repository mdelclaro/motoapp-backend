const express = require("express");
const { body, param } = require("express-validator/check");
const motoqueiroController = require("../../../controllers/usuario/motoqueiro/");

const router = express.Router();

// GET motoapp/v1/usuario/motoqueiro/id
router.get("/:idMotoqueiro", motoqueiroController.getMotoqueiro);

// GET motoapp/v1/usuario/motoqueiro/
router.get("/", motoqueiroController.getMotoqueiros);

// POST motoapp/v1/usuario/motoqueiro/
router.post(
  "/",
  [
    body("nome")
      .trim()
      .isLength({ min: 3 }),
    body("sobrenome")
      .trim()
      .isLength({ min: 3 }),
    body("email").isEmail(),
    body("senha").isLength({ min: 4 }),
    body("cnh")
      .trim()
      .not()
      .isEmpty(),
    body("placa")
      .trim()
      .not()
      .isEmpty()
  ],
  motoqueiroController.createMotoqueiro
);

// PUT motoapp/v1/usuario/motoqueiro/id
router.put(
  "/:idMotoqueiro",
  [
    param("idMotoqueiro")
      .not()
      .isEmpty(),
    body("email").isEmail(),
    body("senha").isLength({ min: 4 }),
    body("placa")
      .trim()
      .not()
      .isEmpty()
  ],
  motoqueiroController.updateMotoqueiro
);

module.exports = router;
