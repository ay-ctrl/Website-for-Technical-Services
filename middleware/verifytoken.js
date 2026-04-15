const jwt = require("jsonwebtoken"); // Eksik olan satır bu!

function verifyToken(req, res, next) {
  const token = req.cookies.token;

  console.log("--- Token Kontrolü ---");
  console.log("Gelen Çerezler (Cookies):", req.cookies); // Eğer {} ise sorun cookie-parser veya credentials'dır
  console.log("Bulunan Token:", token);

  if (!token) {
    console.log("HATA: Token bulunamadı!");
    return res
      .status(403)
      .json({ success: false, message: "Token gereklidir." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("HATA: JWT Doğrulanamadı!", err.message); // Süresi mi dolmuş yoksa secret mı yanlış?
      return res.status(403).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş token.",
      });
    }
    console.log("BAŞARILI: Kullanıcı ID:", decoded.userId);
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
