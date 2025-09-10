const express = require("express");

const router = express.Router();

const ConversationController = require("../app/controllers/conversationController");
const authenticateToken = require("../app/middlewares/authMiddleware");


router.use(authenticateToken);
router.get("/:userId", ConversationController.getAllConversationsByUserId);
router.get("/messages/:conversationId", ConversationController.getMessagesByConversationId);
router.post("/message", ConversationController.sendMessage);

module.exports = router;
