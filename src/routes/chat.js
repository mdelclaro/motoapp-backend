const express = require("express");

const auth = require("../middlewares/auth");
const chatController = require("../controllers/chat");

const router = express.Router();

// GET /v1/chat/
router.get("/", chatController.getChats);

// GET /v1/chat/cliente/:idCliente
router.get("/cliente/:idCliente", chatController.getChatCliente);

// GET /v1/chat/motoqueiro/:idMotoqueiro
router.get("/motoqueiro/:idMotoqueiro", chatController.getChatMotoqueiro);

module.exports = router;
