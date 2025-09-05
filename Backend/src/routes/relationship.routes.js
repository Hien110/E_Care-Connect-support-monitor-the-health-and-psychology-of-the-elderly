const express = require("express");

const router = express.Router();

const RelationshipController = require("../app/controllers/relationshipController");
const authenticateToken = require("../app/middlewares/authMiddleware");


router.use(authenticateToken);
router.post("/create", RelationshipController.createRelationship);

module.exports = router;
