const express = require('express');
const router = express.Router();
const User = require('../models/users'); // User modelini yükle

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Kullanıcıyı MongoDB'den kontrol et
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı bulunamadı!' });
        }

        // Şifreyi doğrula
        if (user.password !== password) {
            return res.status(401).json({ message: 'Hatalı şifre!' });
        }

        // Başarılı giriş
        return res.status(200).json({ message: 'Başarılı giriş!', redirectUrl: '/dashboard' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Sunucu hatası!' });
    }
});

module.exports = router;
