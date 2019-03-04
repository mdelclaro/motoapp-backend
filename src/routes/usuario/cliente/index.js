const express = require("express");
const { body, param } = require("express-validator/check");

const clienteController = require("../../../controllers/usuario/cliente/");
const Cliente = require("../../../models/usuario/cliente/");

const auth = require("../../../utils/auth/");

const router = express.Router();

// GET motoapp/v1/usuario/cliente/id
router.get("/:idCliente", auth, clienteController.getCliente);

// GET motoapp/v1/usuario/cliente/
router.get("/", auth, clienteController.getClientes);

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
    body("email")
      .isEmail()
      .normalizeEmail(),
    body("senha")
      .trim()
      .isLength({ min: 4 })
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
    body("email")
      .isEmail()
      .normalizeEmail(),
    body("senha")
      .trim()
      .isLength({ min: 4 })
  ],
  auth,
  clienteController.updateCliente
);

module.exports = router;
