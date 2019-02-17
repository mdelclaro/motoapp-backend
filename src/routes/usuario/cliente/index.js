const express = require("express");
const { body, param } = require("express-validator/check");
const clienteController = require("../../../controllers/usuario/cliente/");

const router = express.Router();

// GET motoapp/v1/usuario/cliente/id
router.get("/:idCliente", clienteController.getCliente);

// GET motoapp/v1/usuario/cliente/
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
  "/:idCliente",
  [
    param("idCliente")
      .not()
      .isEmpty(),
    body("email").isEmail(),
    body("senha").isLength({ min: 4 })
  ],
  clienteController.updateCliente
);

module.exports = router;
