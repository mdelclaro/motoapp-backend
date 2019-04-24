const express = require("express");
const { body, param } = require("express-validator/check");

const motoqueiroController = require("../controllers/motoqueiro");

const auth = require("../middlewares/auth");

const router = express.Router();

// GET motoapp/v1/usuario/motoqueiro/
router.get("/", auth, motoqueiroController.getMotoqueiros);

// GET motoapp/v1/usuario/motoqueiro/id
router.get("/:idMotoqueiro", auth, motoqueiroController.getMotoqueiro);

// POST motoapp/v1/usuario/motoqueiro/
router.post(
  "/",
  [
    body("nome")
      .trim()
      .isLength({ min: 2 }),
    body("sobrenome")
      .trim()
      .isLength({ min: 2 }),
    body("email")
      .isEmail()
      .normalizeEmail(),
    body("senha")
      .trim()
      .isLength({ min: 8 })
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
    body("email")
      .isEmail()
      .normalizeEmail()
      .optional(),
    body("senha")
      .trim()
      .isLength({ min: 8 })
      .optional(),
    body("moto")
      .trim()
      .isLength({ max: 20 })
      .optional(),
    body("placa")
      .trim()
      .isLength({ min: 7, max: 7 })
      .optional()
  ],
  auth,
  motoqueiroController.updateMotoqueiro
);

module.exports = router;
