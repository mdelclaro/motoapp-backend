const express = require("express");
const { body } = require("express-validator/check");

const auth = require("../middlewares/auth");
const mensagemController = require("../controllers/mensagem");

const router = express.Router();

// POST /v1/mensagem/
router.post(
  "/",
  [
    body("sender")
      .trim()
      .not()
      .isEmpty(),
    body("text")
      .trim()
      .not()
      .isEmpty(),
    body("idMotoqueiro")
      .trim()
      .not()
      .isEmpty(),
    body("idMotoqueiro")
      .trim()
      .not()
      .isEmpty()
  ],
  // auth,
  mensagemController.createMensagem
);

module.exports = router;
