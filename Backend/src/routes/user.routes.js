const express = require("express")

const router = express.Router()

const UserController = require("../app/controllers/userController")

// Đăng kí người dùng
router.post("/registerUser", UserController.registerUser)

module.exports = router