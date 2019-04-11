const express = require("express");
const { body } = require("express-validator/check");

const authClienteController = require("../controllers/auth-cliente");
const authMotoqueiroController = require("../controllers/auth-motoqueiro");

const router = express.Router();

router.post(
  "/cliente/",
  [
    body("username")
      .not()
      .isEmpty(),
    body("senha")
      .not()
      .isEmpty()
  ],
  authClienteController.login
);
router.post(
  "/cliente/refreshToken/",
  [
    body("refreshToken")
      .not()
      .isEmpty()
  ],
  authClienteController.refreshToken
);
router.post(
  "/motoqueiro/",
  [
    body("username")
      .not()
      .isEmpty(),
    body("senha")
      .not()
      .isEmpty()
  ],
  authMotoqueiroController.login
);
router.post(
  "/motoqueiro/refreshToken",
  [
    body("refreshToken")
      .not()
      .isEmpty()
  ],
  authMotoqueiroController.refreshToken
);

module.exports = router;
