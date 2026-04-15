const express = require("express");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
require("dotenv").config();

const cookieParser = require("cookie-parser");

const helmet = require("helmet");
const lusca = require("lusca");



const winston = require("winston"); // Hata logları için winston kullanıyoruz
const DailyRotateFile = require("winston-daily-rotate-file");
const verifyToken = require("./middleware/verifytoken"); // Token doğrulama middleware'ı

const https = require("https");
const rateLimit = require("express-rate-limit");
const sanitize = require("mongo-sanitize");

// Sertifikaları yükle
const privateKey = fs.readFileSync("localhost-key.pem", "utf8");
const certificate = fs.readFileSync("localhost.pem", "utf8");
const httpsCredentials = { key: privateKey, cert: certificate };

// Schemas
const Request = require("./models/repairRequests");
const User = require("./models/users");
const Campaign = require("./models/campaigns");
const Product = require("./models/products");
const Media = require("./models/media");
// Genel hız sınırlayıcı (15 dakikada her IP'den 100 istek)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Çok fazla istek attınız, lütfen 15 dakika sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
// Logger config
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "14d",
    }),
  ],
});

//Sunucuya gelen isteklere izin vermek için
const corsOptions = {
  origin: [
    "http://localhost:5000",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
  ], // Frontend adresi
  methods: ["GET", "POST", "DELETE", "PUT"], // İzin verilen HTTP metodları
  allowedHeaders: ["Content-Type", "Authorization"], // İzin verilen başlıklar
  credentials: true,
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Lusca'dan ÖNCE gelmeli
app.use(cors(corsOptions)); // corsOptions artık yukarıda tanımlı olduğu için hata vermez
app.use(helmet()); 

// GitHub'ın beklediği kritik satır
app.use(lusca.csrf()); 

app.disable("x-powered-by");
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 yıl
    includeSubDomains: true,
    preload: true,
  }),
  helmet.noSniff(),
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net", // Bootstrap 5
        "https://ajax.googleapis.com", // jQuery
        "https://maxcdn.bootstrapcdn.com", // Bootstrap 3
        "cdnjs.cloudflare.com",
      ],
      styleSrc: [
        "'self'",
        "https://cdn.jsdelivr.net", // Bootstrap 5
        "https://maxcdn.bootstrapcdn.com", // Bootstrap 3
        "https://cdnjs.cloudflare.com", // Font Awesome
      ],
      fontSrc: [
        "'self'",
        "https://maxcdn.bootstrapcdn.com",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],
      connectSrc: ["'self'"],
      imgSrc: [
        "'self'",
        "https://cdn-icons-png.flaticon.com/256/0/747.png",
        "data:",
        "https://upload.wikimedia.org", // Wikimedia görselleri için izin
        "https://logos-world.net", // Logos World görselleri için izin
        "https://i.pinimg.com", // Pinterest görselleri için izin
        "https://logoeps.com",
        "https://cdn-icons-png.flaticon.com", // Flaticon görselleri için izin
        "https://lh3.googleusercontent.com",
        "https://coflex.com.tr",
        "https://st2.depositphotos.com",
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }),
);

// Frontend dosyalarını statik olarak sun
app.use(
  cors(corsOptions),
  express.static(path.join(__dirname, "frontend/public")),
);

app.use("/uploads", express.static("uploads"));

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to database :)");
      https.createServer(httpsCredentials, app).listen(5000, () => {
        console.log("Sunucu HTTPS üzerinden 5000 portunda çalışıyor!");
      });
    })
    .catch((error) => {
      console.log("Database Connection failed :(");
      console.error("HATA DETAYI BURADA --->", error); // Bu satırı ekle
    });
} else {
  mongoose.connect(process.env.MONGO_TEST_URI).then(() => {
    console.log("Connected to test database :)");
  });
}

app.get("/health", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).send("Veritabanı sağlıklı");
  } catch (err) {
    res.status(500).send("Veritabanı hatası");
  }
});

// Anasayfaya gelen GET isteği için yönlendirme yap
app.get("/", (req, res) => {
  res.redirect("/CustomerSide/index.html"); // Anasayfaya yönlendir
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // 3 deneme hakkı
  message: {
    message:
      "Çok fazla başarısız giriş denemesi. Lütfen 60 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    logger.warn(`Failed login attempt from IP: ${req.ip}. Exceeded limit.`);
    res.status(429).json({
      message:
        "Çok fazla başarısız giriş denemesi. Lütfen 60 dakika sonra tekrar deneyin.",
    });
  },
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(401).json({ message: "Lütfen tüm alanları doldurun!" });
  }

  try {
    const user = await User.authenticate(username, password);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Kullanıcı adı veya şifre hatalı!" });
    }

    // reset the counter
    loginLimiter.resetKey(req.ip);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // HttpOnly Cookie ayarla
    res.cookie("token", token, {
      httpOnly: true, // Tarayıcı JS'si bu cookie'ye erişemesin (XSS koruması)
      secure: true, // Sadece HTTPS üzerinden gönderilsin (Zaten sertifikan var, harika)
      sameSite: "Strict", // Sadece senin kendi sitenden gelen isteklere izin ver (CSRF koruması!)
    });
    res.status(200).json({ message: "Giriş başarılı!" });
  } catch (error) {
    logger.error(`Login failed for ${req.ip}. Error: ${error.message}`);
    res
      .status(500)
      .json({ message: "Sunucu hatası, lütfen daha sonra tekrar deneyin." });
  }
});

app.post("/api/logout", (req, res) => {
  // Çerezi silerken oluştururken kullandığın opsiyonları ekle
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: true, // Login'de true ise burada da true olmalı
    sameSite: "None", // Login'de None ise burada da None olmalı
  });

  res.status(200).json({ success: true, message: "Çıkış yapıldı." });
});

app.get("/api/verify-token", (req, res) => {
  const token = req.cookies.token; // Cookie'den token'ı al

  if (!token) {
    logger.warn(`Token bulunamadı, IP: ${req.ip}`); // IP adresini logla
    return res.status(401).json({
      success: false,
      message: "Token bulunamadı, lütfen giriş yapın.",
    });
  }

  // JWT token'ını doğrulama
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.error(
        `Token doğrulama hatası, IP: ${req.ip}, Error: ${err.message}`,
      );
      return res.status(401).json({
        success: false,
        message: "Token geçersiz veya süresi dolmuş.",
      });
    }
    return res.status(200).json({ success: true, message: "Token geçerli." });
  });
});

//Change password route
app.post("/change-password", verifyToken, async (req, res) => {
  const { username, oldPassword, newPassword, newPasswordAgain } = req.body;
  try {
    // Yeni şifrelerin eşleşip eşleşmediğini kontrol et
    if (newPassword !== newPasswordAgain) {
      return res.status(400).json({ message: "Yeni şifreler eşleşmiyor!" });
    }

    // Kullanıcıyı veritabanında bul
    const user = await User.findOne({ username: sanitize(username) });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Eski şifre doğrulama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      logger.warn(
        `Yanlış şifre denemesi, IP: ${req.ip}, Kullanıcı Adı: ${username}`,
      );
      return res.status(400).json({ message: "Eski şifre yanlış" });
    }

    // Yeni şifreyi hashle ve güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    logger.info(
      `Şifre başarıyla değiştirildi, IP: ${req.ip}, Kullanıcı Adı: ${username}`,
    );
    res.status(200).json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    logger.error(
      `Şifre değişikliği hatası, IP: ${req.ip}, Hata: ${error.message}`,
    );
    res.status(500).json({ message: "Bir hata oluştu" });
  }
});

//Talep sorgulama API
app.post("/api/repairRequests/search", async (req, res) => {
  const { queryNum } = req.body; // Kullanıcıdan gelen sorgulama numarası

  // Hızlı validasyon
  if (!queryNum || isNaN(queryNum)) {
    return res
      .status(400)
      .json({ success: false, message: "Geçersiz talep numarası" });
  }

  try {
    // Sadece gerekli alanları seç + index kullanımı
    const repairRequest = await Request.findOne({
      queryNum: sanitize(queryNum),
    })
      .select("queryNum name phone adress sorunlar createdAt state price")
      .lean(); // Daha hızlı JSON dönüşümü

    if (repairRequest) {
      // Talep bulunduysa, talep bilgilerini geri gönder
      logger.info(
        `Talep bulundu, IP: ${req.ip}, Sorgulama Numarası: ${queryNum}`,
      );
      res.json({
        success: true,
        data: repairRequest,
      });
    } else {
      logger.warn(
        `Talep bulunamadı, IP: ${req.ip}, Sorgulama Numarası: ${queryNum}`,
      );
      res.status(200).json({
        // 200 koduyla başarılı olarak dönecek ancak success: false olacak
        success: false,
        message: "Talep bulunamadı!",
      });
    }
  } catch (error) {
    logger.error(
      `Talep sorgulama hatası, IP: ${req.ip}, Sorgulama Numarası: ${queryNum}, Hata: ${error.message}`,
    );
    // Daha önce yanıt gönderildiyse tekrar gönderme
    if (!res.headersSent) {
      return res.status(500).json({ message: "Bir hata oluştu." });
    }
  }
});

app.post("/api/repairRequests", async (req, res) => {
  console.log("--- YENİ TALEP GELDİ ---");
  console.log("Gelen Veri:", req.body); // Frontend'den ne geldiğini gör

  try {
    const { name, phone, adress, imei, model, kilit, sorunlar } = req.body;

    // 1. İsim Kontrolü
    if (!name || name.trim() === "") {
      return res.status(400).send({ message: "Ad ve soyad zorunludur." });
    }
    const nameRegex = /^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/;
    if (!nameRegex.test(name.trim())) {
      console.log("Hata: İsim Regex'e takıldı ->", name);
      return res
        .status(400)
        .send({ message: "Ad ve soyad sadece harflerden oluşmalıdır." });
    }

    // 2. Telefon Kontrolü (10 hane, başında 0 yok)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone || !phoneRegex.test(phone.trim())) {
      console.log("Hata: Telefon Regex'e takıldı ->", phone);
      return res.status(400).send({
        message:
          "Geçerli bir telefon numarası girin (Başında 0 olmadan 10 hane).",
      });
    }

    // 3. Adres Kontrolü
    const adresRegex = /^[a-zA-Z0-9ğüşöçıİĞÜŞÖÇ\s.\-\/()]+$/;
    if (!adress || !adresRegex.test(adress.trim())) {
      console.log("Hata: Adres Regex'e takıldı veya boş ->", adress);
      return res
        .status(400)
        .send({ message: "Adres geçersiz karakterler içeriyor veya boş." });
    }

    // 4. IMEI Kontrolü (Varsa 15 hane)
    if (imei && imei.trim() !== "" && !/^\d{15}$/.test(imei.trim())) {
      console.log("Hata: IMEI Regex'e takıldı ->", imei);
      return res
        .status(400)
        .send({ message: "IMEI 15 haneli olmalı veya boş bırakılmalıdır." });
    }

    // 5. Model Kontrolü
    if (!model || model.trim() === "") {
      return res.status(400).send({ message: "Telefon modeli zorunludur." });
    }
    const modelRegex = /^[a-zA-Z0-9\s\-_.]+$/;
    if (!modelRegex.test(model.trim())) {
      console.log("Hata: Model Regex'e takıldı ->", model);
      return res
        .status(400)
        .send({ message: "Model geçersiz karakter içeriyor." });
    }

    // 6. Sorunlar Kontrolü (Array mi?)
    if (!Array.isArray(sorunlar) || sorunlar.length === 0) {
      console.log("Hata: Sorunlar dizi değil veya boş.");
      return res.status(400).send({ message: "Lütfen en az bir sorun seçin." });
    }

    // --- HER ŞEY TAMAMSA KAYDET ---
    const newRequest = new Request(req.body);
    await newRequest.save();

    console.log("BAŞARILI: Talep kaydedildi, Sorgu No:", newRequest.queryNum);

    res.status(201).send({
      message: "Talep başarıyla kaydedildi!",
      queryNum: newRequest.queryNum,
    });
  } catch (error) {
    logger.error(`Repair request could not be saved: ${error.message}`);
    console.error("VERİTABANI HATASI:", error);
    if (!res.headersSent) {
      res.status(500).send({ message: "Sunucu hatası oluştu." });
    }
  }
});

// Temel klasörleri oluşturma fonksiyonu
const createDirs = () => {
  const folders = ["uploads/campaigns", "uploads/products", "uploads/about"];
  folders.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
createDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subFolder = "others"; // Varsayılan klasör

    // İsteğin gittiği URL'ye göre klasör belirle
    if (req.originalUrl.includes("campaign")) {
      subFolder = "campaigns";
    } else if (req.originalUrl.includes("product")) {
      subFolder = "products";
    } else if (req.originalUrl.includes("media")) {
      subFolder = "about";
    }

    cb(null, `uploads/${subFolder}/`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Multer'ı yapılandırın
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum dosya boyutu (5 MB)
  fileFilter: (req, file, cb) => {
    // Sadece belirli türdeki dosyaları kabul et
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  },
});

// Kampanya Yükleme Route'u
app.post(
  "/api/upload-campaign",
  verifyToken,
  upload.single("dosya"),
  async (req, res) => {
    try {
      const { aciklama } = req.body;

      // 1. Kontrol: Açıklama var mı?
      if (!aciklama) {
        return res
          .status(400)
          .json({ error: "Açıklama alanı doldurulmalıdır!" });
      }

      // 2. Kontrol: Dosya seçilmiş mi?
      if (!req.file) {
        return res.status(400).json({ error: "Lütfen bir görsel yükleyin!" });
      }

      // 3. Dosya Yolunu Hazırla (Sunucundaki erişim linki)
      // Örneğin: http://localhost:5000/uploads/gorsel-adi.jpg
      const fileUrl = `/uploads/campaigns/${req.file.filename}`;

      // 4. MongoDB'ye Kaydet
      const newCampaign = new Campaign({
        description: aciklama,
        imageURL: fileUrl, // Drive linki yerine artık yerel link var
      });

      await newCampaign.save();

      logger.info(`Yeni kampanya yüklendi, ID: ${newCampaign._id}`);
      res.status(200).json({
        success: true,
        message: "Kampanya başarıyla yüklendi!",
        campaign: newCampaign,
      });
    } catch (error) {
      logger.error(`Yükleme hatası: ${error.message}`);
      res.status(500).json({ error: "Bir hata oluştu." });
    }
  },
);

// To get campaigns
app.get("/api/campaigns", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }); // En son eklenen en üstte
    logger.info(`Campaigns fetched successfully, IP: ${req.ip}`);
    res.status(200).json(campaigns);
  } catch (error) {
    logger.error(`Failed to fetch campaigns: ${error.message}, IP: ${req.ip}`);
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
});

// Ürün Yükleme Route'u (Yerel Kayıt Sürümü)
app.post(
  "/upload-product",
  verifyToken,
  upload.single("file"), // Frontend'den "file" ismiyle geldiğini varsayıyorum
  async (req, res) => {
    try {
      const { name, price, description } = req.body;

      // 1. Kontroller: Gerekli alanlar ve dosya var mı?
      if (!name || !price || !description) {
        return res.status(400).json({ error: "Tüm alanlar doldurulmalıdır!" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Lütfen ürün için bir görsel yükleyin!" });
      }

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice)) {
        return res.status(400).json({ error: "Geçersiz fiyat değeri!" });
      }

      // 2. Dosya Yolunu Hazırla
      // Artık Drive linki yerine kendi sunucundaki yolu kaydediyoruz
      const fileUrl = `/uploads/products/${req.file.filename}`;

      // 3. MongoDB'ye Kaydetme
      const product = new Product({
        // Mongoose zaten otomatik ID (ObjectId) oluşturur,
        // ama senin şemanda özel bir string ID gerekiyorsa bunu tutabilirsin.
        name,
        price: numericPrice,
        description,
        photos: [fileUrl], // Artık yerel dosya yolunu içeren dizi
      });

      await product.save();

      // 4. Başarılı Logu
      logger.info(
        `Product uploaded successfully to local storage, Product ID: ${product._id}, IP: ${req.ip}`,
      );

      res.status(200).json({
        message: "Ürün başarıyla yüklendi!",
        product,
      });
    } catch (err) {
      logger.error(`Failed to upload product: ${err.message}, IP: ${req.ip}`);
      res.status(500).json({ error: "Ürün yüklenirken bir hata oluştu." });
    }
    // NOT: Artık fs.unlinkSync(filePath) yapmana gerek yok!
    // Çünkü dosyayı geçici değil, kalıcı olarak "uploads" klasöründe tutmak istiyoruz.
  },
);

// To get products
app.get("/products", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Varsayılan olarak 1. sayfa
  const limit = 30; // Sayfa başına gösterilecek ürün sayısı
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit); // Verileri sayfalar halinde al
    const totalProducts = await Product.countDocuments(); // Toplam ürün sayısı

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    });
  } catch (error) {
    logger.error(`Ürünler alınırken bir hata oluştu: ${error.message}`);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// To delete a product
app.delete("/products/:id", verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId); // Ürünü sil
    res.status(200).send("Ürün başarıyla silindi.");
  } catch (error) {
    logger.error(`Ürün silme hatası: ${error.message}. Ürün ID: ${productId}`);
    res.status(500).send("Ürün silme hatası.");
  }
});

// To get requests
app.get("/get-requests", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Sayfa numarası (varsayılan 1)
    const pageSize = 30; // Sayfa başına gösterilecek veri sayısı
    const skip = (page - 1) * pageSize; // Hangi veriden başlayacağı

    // Verileri çekme
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .skip(skip) // Başlangıç noktasını atla
      .limit(pageSize); // Sayfa başına veriyi sınırlama

    // Toplam veri sayısını almak
    const totalRequests = await Request.countDocuments();

    // Toplam sayfa sayısını hesaplamak
    const totalPages = Math.ceil(totalRequests / pageSize);

    res.json({
      requests,
      totalPages,
      currentPage: page,
      totalRequests,
    });
  } catch (err) {
    logger.error(`GET /get-requests Hata: ${err.message}`);
    res.status(500).json({ error: "Talepler alınırken bir hata oluştu." });
  }
});

// API endpoint for updating repair request
app.put("/api/update-request/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Hem id'yi hem de gelen tüm body verisini sanitize ediyoruz
    const updatedRequest = await Request.findByIdAndUpdate(
      sanitize(id),
      sanitize(updateData),
      {
        new: true,
      },
    );
    if (!updatedRequest) {
      logger.warn(
        `PUT /api/update-request/${id} - Talep bulunamadı (ID: ${id})`,
      );
      return res.status(404).json({ message: "Talep bulunamadı" });
    }
    logger.info(
      `PUT /api/update-request/${id} - Talep başarıyla güncellendi (ID: ${id})`,
    );
    res.json(updatedRequest);
  } catch (error) {
    logger.error(
      `PUT /api/update-request/${id} - Sunucu hatası: ${error.message}`,
    );
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
});

// To delete a request
app.delete("/delete-request/:id", verifyToken, async (req, res) => {
  try {
    const requestId = req.params.id; // ID'yi burada alıyoruz
    await Request.findByIdAndDelete(sanitize(requestId));
    logger.info(
      `DELETE /delete-request/${requestId} - Talep başarıyla silindi (ID: ${requestId})`,
    );
    res.status(200).json({ message: "Talep silindi!" });
  } catch (error) {
    logger.error(
      `DELETE /delete-request/${req.params.id} - Sunucu hatası: ${error.message}`,
    );
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Talebi idsine göre GET ile alma
app.get("/get-request/:id", verifyToken, async (req, res) => {
  const requestId = req.params.id;

  try {
    // Veritabanında talebi ID'ye göre arayın
    const request = await Request.findById(requestId); // MongoDB'de `findById` metodu
    if (!request) {
      logger.warn(
        `GET /get-request/${requestId} - Talep bulunamadı (ID: ${requestId})`,
      );
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(request); // JSON formatında yanıt gönder
  } catch (error) {
    logger.error(
      `GET /get-request/${requestId} - Sunucu hatası: ${error.message}`,
    );
    res.status(500).json({ error: "İç Sunucu Hatası. Lütfen tekrar deneyin." });
  }
});

// Medya Yükleme Route'u (Yerel Kayıt Sürümü)
app.post(
  "/upload-media",
  verifyToken,
  upload.single("dosya"),
  async (req, res) => {
    try {
      const { aciklama } = req.body;

      // 1. Kontrol: Açıklama var mı?
      if (!aciklama) {
        return res
          .status(400)
          .json({ error: "Açıklama alanı doldurulmalıdır!" });
      }

      // 2. Kontrol: Dosya seçilmiş mi?
      if (!req.file) {
        return res.status(400).json({ error: "Lütfen bir dosya yükleyin!" });
      }

      // 3. Dosya Yolunu Hazırla
      // Drive thumbnail linki yerine kendi uploads klasörümüzdeki linki veriyoruz
      const fileUrl = `/uploads/about/${req.file.filename}`;

      // 4. MongoDB'ye Kaydetme
      const newMedia = new Media({
        description: aciklama,
        imageURL: fileUrl, // Artık yerel dosya yolu (ör: /uploads/12345.jpg)
      });

      await newMedia.save();

      // 5. Başarılı Logu
      logger.info(`Yeni medya yerel olarak yüklendi: ${newMedia._id}`);

      res.status(200).json({
        success: true,
        message: "Medya başarıyla yüklendi!",
        campaign: newMedia, // Frontend'de 'campaign' ismiyle bekleniyorsa böyle kalsın
      });
    } catch (error) {
      logger.error(`Medya yükleme hatası: ${error.message}`);
      res.status(500).json({ error: "Bir hata oluştu." });
    }
    // NOT: Drive'a göndermediğimiz için fs.unlinkSync ile dosyayı SİLMİYORUZ.
    // Dosya 'uploads' klasöründe kalmalı ki sitede görebilelim.
  },
);

// To get medias
app.get("/api/medias", async (req, res) => {
  try {
    const medias = await Media.find().sort({ createdAt: -1 }); // En son eklenen en üstte
    res.status(200).json(medias);
  } catch (error) {
    logger.error(`Medya verisi alınırken hata oluştu: ${error.message}`);
    res.status(500).json({
      message: "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
    });
  }
});

module.exports = app;
