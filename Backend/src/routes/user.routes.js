const express = require("express");

const router = express.Router();

const UserController = require("../app/controllers/userController");
const authenticateToken = require("../app/middlewares/authMiddleware");
const { upload } = require('../app/middlewares/upload');


router.post("/registerUser", UserController.registerUser);
router.post("/loginUser", UserController.loginUser);
//gửi OTP
router.post("/send-otp", UserController.sendOTP);
//xác thực OTP
router.post("/verify-otp", UserController.verifyOTP);
//upload ảnh CCCD -> OCR
router.post("/upload-identity", UserController.uploadIdentityImage);
//(legacy) nhập CCCD thủ công
router.put("/set-identity", UserController.setIdentity);
//hoàn tất hồ sơ
router.put("/complete-profile", UserController.completeProfile);

// Forgot password routes
router.post("/forgot-password/send-otp", UserController.sendForgotPasswordOTP);
router.post("/forgot-password/verify-otp", UserController.verifyForgotPasswordOTP);
router.post("/forgot-password/reset", UserController.resetPassword);

// cleanup temp session
router.post("/cleanup-temp", UserController.cleanupTemp);
// get temp register data (for web polling)
router.get("/temp-register", UserController.getTempRegister);

router.post('/change-phone/send-otp', authenticateToken, UserController.changePhoneSendOTP);
router.post('/change-phone/verify', authenticateToken, UserController.changePhoneVerify);
router.post("/change-email/send-otp", authenticateToken, UserController.changeEmailSendOTP);
router.post("/change-email/verify", authenticateToken, UserController.changeEmailVerify);
router.use(authenticateToken);
router.get("/getUserInfo", UserController.getUserInfo);
// Thay đổi mật khẩu
router.put("/change-password", UserController.changePassword);
// Lấy danh sách người già
router.get("/get-elderly", UserController.getAllElderly);
// Update avatar người dùng
router.post("/me/avatar", authenticateToken, upload.single("avatar"), UserController.updateAvatar);

module.exports = router;
