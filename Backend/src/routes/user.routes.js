const express = require("express")

const router = express.Router()

const UserController = require("../app/controllers/userController")

// Đăng kí người dùng
router.post("/registerUser", UserController.registerUser)

router.post("/send-otp", UserController.sendOTP);
router.post("/verify-otp", UserController.verifyOTP);
router.put("/set-identity", UserController.setIdentity);
router.put("/complete-profile", UserController.completeProfile);

// giữ endpoint registerUser cũ nếu cần
router.post("/registerUser", UserController.register);
module.exports = router