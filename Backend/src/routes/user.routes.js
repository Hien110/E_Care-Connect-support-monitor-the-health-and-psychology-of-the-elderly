const express = require("express");

const router = express.Router();

const UserController = require("../app/controllers/userController");
const authenticateToken = require("../app/middlewares/authMiddleware");


router.post("/registerUser", UserController.registerUser);
router.post("/loginUser", UserController.loginUser);

router.use(authenticateToken);
router.get("/getUserInfo",   UserController.getUserInfo );

module.exports = router;
