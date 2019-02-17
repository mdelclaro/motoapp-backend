const express = require("express");
const { body } = require("express-validator/check");
const clienteController = require("../../../controllers/usuario/cliente/");

const router = express.Router();

// GET motoapp/v1/usuario/clientes/
router.get("/:idCliente", clienteController.getCliente);

// GET motoapp/v1/corrida/
router.get("/", clienteController.getClientes);

// POST motoapp/v1/usuario/cliente/
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
    body("senha").isLength({ min: 4 })
  ],
  clienteController.createCliente
);

// PUT motoapp/v1/usuario/cliente/
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
  clienteController.updateCliente
);

module.exports = router;
