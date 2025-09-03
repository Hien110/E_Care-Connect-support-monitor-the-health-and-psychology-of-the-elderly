const express = require("express");

const router = express.Router();

const UserController = require("../app/controllers/userController");
const authenticateToken = require("../app/middlewares/authMiddleware");


router.post("/registerUser", UserController.registerUser);
router.post("/loginUser", UserController.loginUser);
//gửi OTP
router.post("/send-otp", UserController.sendOTP);
//xác thực OTP
router.post("/verify-otp", UserController.verifyOTP);
//nhập CCCD
router.put("/set-identity", UserController.setIdentity);
//hoàn tất hồ sơ
router.put("/complete-Profile", UserController.completeProfile);

// Forgot password routes
router.post("/forgot-password/send-otp", UserController.sendForgotPasswordOTP);
router.post("/forgot-password/verify-otp", UserController.verifyForgotPasswordOTP);
router.post("/forgot-password/reset", UserController.resetPassword);

router.use(authenticateToken);
router.get("/getUserInfo", UserController.getUserInfo);
// Thay đổi mật khẩu
router.put("/change-password", UserController.changePassword);

module.exports = router;
