const jwt = require("jsonwebtoken"); // Eksik olan satır bu!

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    console.log("HATA: Token bulunamadı!");
    return res
      .status(403)
      .json({ success: false, message: "Token gereklidir." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş token.",
      });
    }
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
