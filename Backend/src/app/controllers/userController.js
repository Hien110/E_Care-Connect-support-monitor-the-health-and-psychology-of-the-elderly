const User = require('../models/User');

const hashPassword = require('../../utils/hashPassword');

const jwt = require('jsonwebtoken');

const avatarDefault = "https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg"

const UserController = {

    // Đăng ký người dùng
    registerUser: async (req, res) => {
        try {
            const userData = req.body;
            console.log(userData);

            const hashedPassword = await hashPassword(userData.password);
            const user = new User({ name: userData.name, phoneNumber: userData.phoneNumber, password: hashedPassword, avatar: avatarDefault });
            const savedUser = await user.save();
            res.status(201).json({data: savedUser, message: "Đăng ký thành công" });
        } catch (error) {
            res.status(500).json({ message: "Đã xảy ra lỗi" });
        }
    },

}

module.exports = UserController;
