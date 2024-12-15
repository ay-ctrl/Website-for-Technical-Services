const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('Kullanıcı bulunamadı');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send('Geçersiz şifre');
        }
        res.status(200).send('Giriş başarılı');
    } catch (err) {
        res.status(500).send('Giriş hatası: ' + err.message);
    }
});

module.exports = router;
