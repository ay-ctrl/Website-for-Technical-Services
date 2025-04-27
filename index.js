const express = require('express');
const mongoose= require('mongoose');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
app.use(express.json());
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const helmet = require('helmet');
const winston = require('winston'); // Hata logları için winston kullanıyoruz
const verifyToken = require('./middleware/verifytoken'); // Token doğrulama middleware'ı
app.disable('x-powered-by');
const https = require('https');

// Sertifikaları yükle
const privateKey = fs.readFileSync('localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('localhost.pem', 'utf8');
const httpsCredentials = { key: privateKey, cert: certificate };

// Schemas
const Request = require('./models/repairRequests'); 
const User=require('./models/users');
const Campaign=require('./models/campaigns');
const Product=require('./models/products');
const Media=require('./models/media');

// Logger config
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

//Sunucuya gelen isteklere izin vermek için
const corsOptions = {
    origin: ['http://localhost:5000'], // Frontend adresi
    methods: ['GET', 'POST','DELETE','PUT'], // İzin verilen HTTP metodları
    allowedHeaders: ['Content-Type','Authorization'], // İzin verilen başlıklar
    credentials: true, 
};

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
        fontSrc: ["'self'", "https://maxcdn.bootstrapcdn.com", "https://fonts.gstatic.com","https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'",
            "https://cdn-icons-png.flaticon.com/256/0/747.png",
            "data:",
            "https://upload.wikimedia.org",  // Wikimedia görselleri için izin
            "https://logos-world.net",  // Logos World görselleri için izin
            "https://i.pinimg.com",  // Pinterest görselleri için izin
            "https://logoeps.com",
            "https://cdn-icons-png.flaticon.com",  // Flaticon görselleri için izin
            "https://drive.google.com", 
            "https://lh3.googleusercontent.com",
            "https://coflex.com.tr",
            "https://st2.depositphotos.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    })
);

// Frontend dosyalarını statik olarak sun
app.use(express.static(path.join(__dirname, 'frontend/public')));

app.use(cors(corsOptions)); // CORS'u etkinleştir

//sunucu ve mongodb bağlantısı
mongoose.connect("mongodb+srv://moonloversin:Wg0RBqGNubEaOiAg@backend.cnmfb.mongodb.net/NODE-API?retryWrites=true&w=majority&appName=Backend").then(()=>{
    console.log("Connected to database :)"); 
    // HTTPS sunucusunu başlat
    https.createServer(httpsCredentials, app).listen(5000, () => {
    console.log('Sunucu HTTPS üzerinden 5000 portunda çalışıyor!');
  });
}).catch((error)=>{
    console.log("Database Connection failed :(");
    logger.error(`Database connection failed: ${error.message}`, { stack: error.stack });
});

// Anasayfaya gelen GET isteği için yönlendirme yap
app.get('/', (req, res) => {
    res.redirect('/CustomerSide/index.html');  // Anasayfaya yönlendir
});

//To upload a repair request
app.post('/api/repairRequests', async (req, res) => {
    try {
        const newRequest = new Request(req.body); // Gelen form verisini yeni bir Talep'e çevir
        await newRequest.save(); // MongoDB'ye kaydet
        res.status(201).send({message:'Talep başarıyla kaydedildi!', queryNum: newRequest.queryNum});
    } catch (error) {
        logger.error(`Repair request could not be saved: ${error.message}`, { stack: error.stack });
        res.status(400).send({ message: 'Bir hata oluştu, lütfen tekrar deneyin.' });
    }
});

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 3, // 3 deneme hakkı
    message: { message: 'Çok fazla başarısız giriş denemesi. Lütfen 60 dakika sonra tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        logger.warn(`Failed login attempt from IP: ${req.ip}. Exceeded limit.`);
        res.status(429).json({ message: 'Çok fazla başarısız giriş denemesi. Lütfen 60 dakika sonra tekrar deneyin.' });
    }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.authenticate(username, password);

        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı!' });
        }

        // reset the counter
        loginLimiter.resetKey(req.ip);

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        // HttpOnly Cookie ayarla
        res.cookie('token', token, {
            httpOnly: true,  // Token'a JavaScript ile erişilemiyor
            secure: false,   // Geliştirme ortamında HTTPS'ye gerek yok
            sameSite: 'Strict',  // Çerez sadece aynı site içinden gönderilebilir
            maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 gün = 1 ay
        });        
        res.status(200).json({ message: 'Giriş başarılı!'});

    } catch (error) {
        logger.error(`Login failed for ${req.ip}. Error: ${error.message}`);
        res.status(500).json({ message: 'Sunucu hatası, lütfen daha sonra tekrar deneyin.' });
    }
});

app.post('/api/logout', verifyToken , (req, res) => {
    // Çerezi sil
    res.clearCookie('token', { path: '/' });
    res.status(200).json({ message: 'Çıkış yapıldı ve çerez silindi.' });
});


app.get('/api/verify-token', (req, res) => {
    const token = req.cookies.token; // Cookie'den token'ı al

    if (!token) {
        logger.warn(`Token bulunamadı, IP: ${req.ip}`);  // IP adresini logla
        return res.status(401).json({ success: false, message: 'Token bulunamadı, lütfen giriş yapın.' });
    }

    // JWT token'ını doğrulama
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            logger.error(`Token doğrulama hatası, IP: ${req.ip}, Error: ${err.message}`);
            return res.status(401).json({ success: false, message: 'Token geçersiz veya süresi dolmuş.' });
        }
        return res.status(200).json({ success: true, message: 'Token geçerli.' });
    });
});

//Change password route
app.post('/change-password', verifyToken , async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    try {
        // Kullanıcıyı veritabanında bul
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Eski şifre doğrulama
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            logger.warn(`Yanlış şifre denemesi, IP: ${req.ip}, Kullanıcı Adı: ${username}`);
            return res.status(400).json({ message: 'Eski şifre yanlış' });
        }

        // Yeni şifreyi hashle ve güncelle
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        logger.info(`Şifre başarıyla değiştirildi, IP: ${req.ip}, Kullanıcı Adı: ${username}`);
        res.status(200).json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (error) {
        logger.error(`Şifre değişikliği hatası, IP: ${req.ip}, Hata: ${error.message}`); 
        res.status(500).json({ message: 'Bir hata oluştu' });
    }
});

//Talep sorgulama API
app.post("/api/repairRequests/search", async (req, res) => {
    const { queryNum } = req.body; // Kullanıcıdan gelen sorgulama numarası

    try {
        // Talep numarasına göre veritabanında arama yap
        const repairRequest = await Request.findOne({ queryNum });

        if (repairRequest) {
            // Talep bulunduysa, talep bilgilerini geri gönder
            logger.info(`Talep bulundu, IP: ${req.ip}, Sorgulama Numarası: ${queryNum}`);
            res.json({
                success: true,
                data: repairRequest
            });
        } else {
            logger.warn(`Talep bulunamadı, IP: ${req.ip}, Sorgulama Numarası: ${queryNum}`); 
            res.json({
                success: false,
                message: 'Talep bulunamadı!'
            });
        }
    } catch (error) {
        logger.error(`Talep sorgulama hatası, IP: ${req.ip}, Sorgulama Numarası: ${queryNum}, Hata: ${error.message}`);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

// 'uploads' klasörünü oluştur
const uploadsDir = path.join(__dirname, 'uploads');
fs.promises.mkdir(uploadsDir, { recursive: true });

// Multer için dosya yükleme ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dosyalar 'uploads' klasörüne kaydedilecek
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Benzersiz bir isim verilir
    }
});
// Multer'ı yapılandırın
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Maksimum dosya boyutu (10 MB)
    fileFilter: (req, file, cb) => {
        // Sadece belirli türdeki dosyaları kabul et
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'), false);
        }
        cb(null, true);
    }
});

//To load a campaign
app.post('/api/upload-campaign', verifyToken , upload.single('dosya'), async (req, res) => {
    try {
        const drive = await getAuthorizedDrive();
        if (!drive) return res.status(401).send('Yetkilendirme gerekli.');

        const { aciklama } = req.body;

        if (!aciklama) {
            return res.status(400).json({ error: 'Açıklama alanı doldurulmalıdır!' });
        }

        let fileUrl = '';
        if (req.file) {
            try {
                const filePath = path.join(__dirname, req.file.path);
                const fileMetadata = {
                    name: req.file.originalname,
                    parents: ["1CzwXTomfW0fF-Lzv86RNufOQm2bXidem"], // Google Drive klasör ID
                };
                const media = {
                    mimeType: req.file.mimetype,
                    body: fs.createReadStream(filePath),
                };

                // Dosyayı Google Drive'a yükleme
                const response = await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id',  // Yalnızca dosya id'sini alıyoruz
                });

                // Yüklenen dosyanın ID'sini alıyoruz
                const fileId = response.data.id;

                // Thumbnail URL'yi oluşturuyoruz
                fileUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600-h600`;

                // Google Drive'a erişim izni veriyoruz
                await drive.permissions.create({
                    fileId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });
                logger.info(`File uploaded to Google Drive, File ID: ${fileId}, IP: ${req.ip}`);

            } catch (googleError) {
                logger.error(`Google Drive yükleme hatası: ${googleError.message}, IP: ${req.ip}`);
                
            if (googleError.message.includes('invalid_grant')) {
                return res.status(401).json({
                error: 'Google yetkilendirme süresi doldu.',
                authExpired: true,
                });
                }
                return res.status(500).json({ error: 'Google Drive yükleme hatası oluştu!' });
            }
            fs.unlinkSync(req.file.path); // geçici dosyayı sil
        }

        // MongoDB'ye kaydetme
        const newCampaign = new Campaign({
            description: aciklama,
            imageURL: fileUrl,  // Thumbnail URL'sini kaydediyoruz
        });
        await newCampaign.save();
        logger.info(`New campaign uploaded successfully, Campaign ID: ${newCampaign._id}, IP: ${req.ip}`);

        res.status(200).json({ success: true, message: 'Kampanya başarıyla yüklendi!', campaign: newCampaign });
    } catch (error) {
        logger.error(`Campaign upload failed: ${error.message}, IP: ${req.ip}`);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    } finally {
        // Eğer dosya yükleme başarısız olsa bile geçici dosya silinsin
        if (req.file) {
            const filePath = path.join(__dirname, req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Dosyayı sil
            }
        }
    }
});

// To get campaigns
app.get('/api/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 }); // En son eklenen en üstte
        logger.info(`Campaigns fetched successfully, IP: ${req.ip}`);
        res.status(200).json(campaigns);
    } catch (error) {
        logger.error(`Failed to fetch campaigns: ${error.message}, IP: ${req.ip}`);
        res.status(500).json({ message: 'Bir hata oluştu', error });
    }
});
  
 // To upload product
app.post('/upload-product', verifyToken , upload.single('file'), async (req, res) => {
    try {
        const { name, price, description } = req.body;

        if (!name || !price || !description) {
            alert("Tüm alanlar doldurulmalıdır!");
            return res.status(400).json({ error: 'Tüm alanlar doldurulmalıdır!' });
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return res.status(400).json({ error: 'Geçersiz fiyat değeri!' });
        }

        // Dosyayı Google Drive’a yükleme
        let fileUrl = '';
        if (req.file) {
            const filePath = path.join(__dirname, req.file.path);
            const fileMetadata = {
                name: req.file.originalname,
                parents: ["19n1vDszqWJOZHOFUoH1QJBP6SWi2_KTs"] // Google Drive klasör ID
            };
            const media = {
                mimeType: req.file.mimetype,
                body: fs.createReadStream(filePath),
            };
            const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });

            // Yüklenen dosya URL'sini oluşturma
            const fileId = response.data.id;
            await drive.permissions.create({
                fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
            fileUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600-h600`;
            fs.unlinkSync(filePath); // Geçici dosyayı sil
        }

        // MongoDB'ye kaydetme
        const product = new Product({
            id: new mongoose.Types.ObjectId().toString(),
            name,
            price,
            description,
            photos: [fileUrl],
        });
        await product.save();
        logger.info(`Product uploaded successfully, Product ID: ${product.id}, IP: ${req.ip}`);

        res.status(200).json({ message: 'Ürün başarıyla yüklendi!', product });
    } catch (err) {
        logger.error(`Failed to upload product: ${err.message}, IP: ${req.ip}`);
        res.status(500).json({ error: 'Ürün yüklenirken bir hata oluştu.' });
    }finally {
        // Eğer dosya yükleme başarısız olsa bile geçici dosya silinsin
        if (req.file) {
            const filePath = path.join(__dirname, req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Dosyayı sil
            }
        }
    }
});

// To get products
app.get('/products', async (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Varsayılan olarak 1. sayfa
    const limit = 30;  // Sayfa başına gösterilecek ürün sayısı
    const skip = (page - 1) * limit;

    try {
        const products = await Product.find()
        .skip(skip)
        .limit(limit);  // Verileri sayfalar halinde al
        const totalProducts = await Product.countDocuments();  // Toplam ürün sayısı

        res.json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
        });
    } catch (error) {
        logger.error(`Ürünler alınırken bir hata oluştu: ${error.message}`);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// To delete a product
app.delete('/products/:id', verifyToken , async (req, res) => {
    try {
        const productId = req.params.id;
        await Product.findByIdAndDelete(productId);  // Ürünü sil
        res.status(200).send("Ürün başarıyla silindi.");
    } catch (error) {
        logger.error(`Ürün silme hatası: ${error.message}. Ürün ID: ${productId}`);
        res.status(500).send("Ürün silme hatası.");
    }
});

// To get requests
app.get('/get-requests',verifyToken , async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;  // Sayfa numarası (varsayılan 1)
        const pageSize = 30;  // Sayfa başına gösterilecek veri sayısı
        const skip = (page - 1) * pageSize;  // Hangi veriden başlayacağı

        // Verileri çekme
        const requests = await Request.find()
            .sort({ createdAt: -1 })
            .skip(skip)  // Başlangıç noktasını atla
            .limit(pageSize);  // Sayfa başına veriyi sınırlama

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
        res.status(500).json({ error: 'Talepler alınırken bir hata oluştu.' });
    }
});

// API endpoint for updating repair request
app.put('/api/update-request/:id', verifyToken ,async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedRequest = await Request.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedRequest) {
            logger.warn(`PUT /api/update-request/${id} - Talep bulunamadı (ID: ${id})`);
            return res.status(404).json({ message: 'Talep bulunamadı' });
        }
        logger.info(`PUT /api/update-request/${id} - Talep başarıyla güncellendi (ID: ${id})`);
        res.json(updatedRequest);
    } catch (error) {
        logger.error(`PUT /api/update-request/${id} - Sunucu hatası: ${error.message}`);
        res.status(500).json({ message: 'Bir hata oluştu', error });
    }
});

// To delete a request
app.delete('/delete-request/:id', verifyToken, async (req, res) => {
    try {
        const requestId = req.params.id;  // ID'yi burada alıyoruz
        await Request.findByIdAndDelete(requestId);
        logger.info(`DELETE /delete-request/${requestId} - Talep başarıyla silindi (ID: ${requestId})`);
        res.status(200).send('Talep silindi.');
    } catch (error) {
        logger.error(`DELETE /delete-request/${req.params.id} - Sunucu hatası: ${error.message}`);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

// Talebi idsine göre GET ile alma
app.get('/get-request/:id', verifyToken ,  async (req, res) => {
    const requestId = req.params.id;

    try {
        // Veritabanında talebi ID'ye göre arayın
        const request = await Request.findById(requestId); // MongoDB'de `findById` metodu
        if (!request) {
            logger.warn(`GET /get-request/${requestId} - Talep bulunamadı (ID: ${requestId})`);
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(request); // JSON formatında yanıt gönder
    } catch (error) {
        logger.error(`GET /get-request/${requestId} - Sunucu hatası: ${error.message}`);
        res.status(500).json({ error: 'İç Sunucu Hatası. Lütfen tekrar deneyin.' });
    }
});

// To load media
app.post('/upload-media', verifyToken , upload.single('dosya'), async (req, res) => {
    try {
        const { aciklama } = req.body;

        if (!aciklama) {
            return res.status(400).json({ error: 'Açıklama alanı doldurulmalıdır!' });
        }

        let fileUrl = '';
        if (req.file) {
            try {
                const filePath = path.join(__dirname, req.file.path);
                const fileMetadata = {
                    name: req.file.originalname,
                    parents: ["1O_Mm7uLWa1ThVlGNzibP7P0hjiSG0JrG"], // Google Drive klasör ID
                };
                const media = {
                    mimeType: req.file.mimetype,
                    body: fs.createReadStream(filePath),
                };

                // Dosyayı Google Drive'a yükleme
                const response = await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id',  // Yalnızca dosya id'sini alıyoruz
                });

                // Yüklenen dosyanın ID'sini alıyoruz
                const fileId = response.data.id;

                // Thumbnail URL'yi oluşturuyoruz
                fileUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600-h600`;

                // Google Drive'a erişim izni veriyoruz
                await drive.permissions.create({
                    fileId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });
                logger.info(`Dosya başarıyla Google Drive'a yüklendi: ${fileId}`);

            } catch (googleError) {
                logger.error(`Google Drive yükleme hatası: ${googleError.message}`);
                return res.status(500).json({ error: 'Google Drive yükleme hatası oluştu!' });
            }
            fs.unlinkSync(req.file.path); //geçici dosyayı sil
        }

        // MongoDB'ye kaydetme
        const newMedia = new Media({
            description: aciklama,
            imageURL: fileUrl,  // Thumbnail URL'sini kaydediyoruz
        });
        await newMedia.save();
        logger.info(`Yeni kampanya başarıyla yüklendi: ${newMedia._id}`);

        res.status(200).json({ success: true, message: 'Kampanya başarıyla yüklendi!', campaign: newMedia });
    } catch (error) {
        logger.error(`Genel hata: ${error.message}`);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    } finally {
        // Eğer dosya yükleme başarısız olsa bile geçici dosya silinsin
        if (req.file) {
            const filePath = path.join(__dirname, req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Dosyayı sil
            }
        }
    }
});

// To get medias
app.get('/api/medias', async (req, res) => {
    try {
        const medias = await Media.find().sort({ createdAt: -1 }); // En son eklenen en üstte
        res.status(200).json(medias);
    } catch (error) {
        logger.error(`Medya verisi alınırken hata oluştu: ${error.message}`);
        res.status(500).json({ message: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.' });
    }
});

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uris = process.env.REDIRECT_URIS; // Bu bir dizi olmalı

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';

// Token dosyasını oku
fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
        console.error('Token dosyası bulunamadı. Yetkilendirme yapmalısınız.');
        logger.error(`Token dosyası bulunamadı veya okuma hatası oluştu: ${err.message}`);
        return;
    }
    oAuth2Client.setCredentials(JSON.parse(token));
});

app.get('/authorize', (req, res) => {
    const error = req.query.error;
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    // Kullanıcıya bilgi mesajı ver
    let message = '';
    if (error === 'expired') {
        message = '🔄 Oturum süresi dolmuş olabilir, lütfen tekrar giriş yapın.';
    }

    res.send(`
      <h2>Google ile giriş yap</h2>
      ${message ? `<p style="color:red;">${message}</p>` : ''}
      <a href="${authUrl}">Google ile Yetkilendir</a>
    `);
});

// 🔑 Callback: Google'dan gelen yetki kodunu token'a çevirme
app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('Authorization code not found.');

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Token'ı kaydet
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        res.send('✅ Token başarıyla kaydedildi! Artık yükleme yapabilirsiniz.');
    } catch (error) {
        console.error('Token alınırken hata:', error.message);
        return res.redirect('/authorize?error=expired');
    }
});

// 🔄 Drive yetkili nesnesini döndüren fonksiyon
async function getAuthorizedDrive() {
    try {
        const token = await fs.promises.readFile(TOKEN_PATH, 'utf-8');
        oAuth2Client.setCredentials(JSON.parse(token));
        return google.drive({ version: 'v3', auth: oAuth2Client });
    } catch (err) {
        console.error('Token okunamadı. Yetkilendirme gerekli.');
        return null;
    }
}
