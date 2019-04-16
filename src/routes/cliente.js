const express = require("express");
const { body, param } = require("express-validator/check");

const clienteController = require("../controllers/cliente");
const auth = require("../middlewares/auth");

const router = express.Router();

// GET motoapp/v1/usuario/cliente/
router.get("/", auth, clienteController.getClientes);

// GET motoapp/v1/usuario/cliente/id
router.get("/:idCliente", auth, clienteController.getCliente);

// POST motoapp/v1/usuario/cliente/
router.post(
  "/",
  [
    body("nome")
      .trim()
      .isLength({ min: 2 }),
    body("sobrenome")
      .trim()
      .isLength({ min: 2 }),
    body("email").isEmail(),
    body("senha")
      .trim()
      .isLength({ min: 8 })
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
      .normalizeEmail()
      .optional(),
    body("senha")
      .trim()
      .isLength({ min: 8 })
      .optional()
  ],
  auth,
  clienteController.updateCliente
);

module.exports = router;
