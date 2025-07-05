const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ success: false, message: 'Token gereklidir.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
        }
        req.user = decoded; // Kullanıcı bilgilerini req objesine ekliyoruz
        next(); // Token geçerli, işlemi devam ettiriyoruz
    });
}

module.exports = verifyToken;
