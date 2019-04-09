const express = require("express");

const authClienteController = require("../controllers/auth-cliente");
const authMotoqueiroController = require("../controllers/auth-motoqueiro");

const router = express.Router();

router.post("/cliente/", authClienteController.login);
router.post("/cliente/refreshToken/", authClienteController.refreshToken);
router.post("/motoqueiro/", authMotoqueiroController.login);
router.post("/motoqueiro/refreshToken", authMotoqueiroController.refreshToken);

module.exports = router;
