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

// Schemas
const Request = require('./models/repairRequests'); 
const User=require('./models/users');
const Campaign=require('./models/campaigns');
const Product=require('./models/products');
const Media=require('./models/media');

// Frontend dosyalarını statik olarak sun
app.use(express.static(path.join(__dirname, 'frontend')));

//Sunucuya gelen isteklere izin vermek için
const corsOptions = {
    origin: ['http://ayda.site', 'http://localhost:3000','http://localhost:5000','http://127.0.0.1:5500'], // Frontend adresi
    methods: ['GET', 'POST','DELETE','PUT'], // İzin verilen HTTP metodları
    allowedHeaders: ['Content-Type','Authorization'], // İzin verilen başlıklar
};

app.use(cors(corsOptions)); // CORS'u etkinleştir

//sunucu ve mongodb bağlantısı
mongoose.connect("mongodb+srv://moonloversin:Wg0RBqGNubEaOiAg@backend.cnmfb.mongodb.net/NODE-API?retryWrites=true&w=majority&appName=Backend").then(()=>{
    console.log("Connected to database :)"); 
    app.listen(5000, ()=>{
        console.log("Server is running on port 5000");
    });
}).catch((error)=>{
    console.log("Connection failed :(");
    console.error(error);  // Bu çok önemli!
});


// Anasayfaya gelen GET isteği için yönlendirme yap
app.get('/', (req, res) => {
    res.redirect('/CustomerSide/index.html');  // Anasayfaya yönlendir
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// yeni eklendi
//To upload a repair request
app.post('/api/repairRequests', async (req, res) => {
    try {
        // Önce bellek üzerinde hızlı validasyon
        if (!req.body.model || !req.body.name || !req.body.phone) {
            return res.status(400).send('Zorunlu alanlar eksik!');
        }

        // Model oluşturmadan önce queryNum hesapla (DB hit'i azaltır)
        const queryNum = Math.floor(10000 + Math.random() * 90000);
        const newRequest = new Request({ ...req.body, queryNum });

        // writeConcern: "majority" ile performans/consistency trade-off
        await newRequest.save({ w: "majority", j: false }); 

        res.status(201).json({ 
            message: 'Talep oluşturuldu!', 
            queryNum,
            _id: newRequest._id // Sonraki sorgular için
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Talep oluşturulamadı',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// yeni eklendi


// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.authenticate(username, password);
        if (!user) {
            return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı!' });
        }

        // JWT token oluştur ve geri gönder
        const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
        res.json({ message: 'Giriş başarılı!', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

//Change password route
app.post('/change-password', async (req, res) => {
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
            return res.status(400).json({ message: 'Eski şifre yanlış' });
        }

        // Yeni şifreyi hashle ve güncelle
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Şifre başarıyla değiştirildi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Bir hata oluştu' });
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// yeni eklendi
//Talep sorgulama API
app.post("/api/repairRequests/search", async (req, res) => {
    const { queryNum } = req.body;
    
    // Hızlı validasyon
    if (!queryNum || isNaN(queryNum)) {
        return res.status(400).json({ success: false, message: 'Geçersiz talep numarası' });
    }

    try {
        // Sadece gerekli alanları seç + index kullanımı
        const repairRequest = await Request.findOne({ queryNum })
            .select('name phone adress sorunlar createdAt state price')
            .lean(); // Daha hızlı JSON dönüşümü

        if (!repairRequest) {
            return res.json({ success: false, message: 'Talep bulunamadı!' });
        }

        // Hızlı yanıt
        res.json({
            success: true,
            data: repairRequest
        });
    } catch (error) {
        console.error('Sorgu hatası:', error);
        res.status(500).json({ 
            success: false,
            message: 'Sunucu hatası',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// yeni eklendi

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
app.post('/api/upload-campaign', upload.single('dosya'), async (req, res) => {
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

            } catch (googleError) {
                console.error("Google Drive yükleme hatası:", googleError);
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

        res.status(200).json({ success: true, message: 'Kampanya başarıyla yüklendi!', campaign: newCampaign });
    } catch (error) {
        console.error("Genel hata:", error);
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
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(500).json({ message: 'Bir hata oluştu', error });
    }
});
  
 // To upload product
app.post('/upload-product', upload.single('file'), async (req, res) => {
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

        res.status(200).json({ message: 'Ürün başarıyla yüklendi!', product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Bir hata oluştu.' });
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
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// To delete a product
app.delete('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        await Product.findByIdAndDelete(productId);  // Ürünü sil
        res.status(200).send("Ürün başarıyla silindi.");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Ürün silme hatası.");
    }
});

// To get requests
app.get('/get-requests',  authenticateToken, async (req, res) => {
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
        console.error(err);
        res.status(500).json({ error: 'Bir hata oluştu.' });
    }
});

// API endpoint for updating repair request
app.put('/api/update-request/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedRequest = await Request.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedRequest) {
            return res.status(404).json({ message: 'Talep bulunamadı' });
        }
        res.json(updatedRequest);
    } catch (error) {
        console.error('Sunucu Hatası:', error);  // Hata detaylarını konsola yazdır
        res.status(500).json({ message: 'Bir hata oluştu', error });
    }
});

// To delete a request
app.delete('/delete-request/:id', async (req, res) => {
    try {
        await Request.findByIdAndDelete(req.params.id);
        res.status(200).send('Talep silindi.');
    } catch (err) {
        res.status(500).send('Silme işlemi başarısız!');
    }
});

// Talebi idsine göre GET ile alma
app.get('/get-request/:id', async (req, res) => {
    const requestId = req.params.id;

    try {
        // Veritabanında talebi ID'ye göre arayın
        const request = await Request.findById(requestId); // MongoDB'de `findById` metodu
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(request); // JSON formatında yanıt gönder
    } catch (error) {
        console.error('Hata:', error); // Hata detaylarını logla
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// To load media
app.post('/upload-media', upload.single('dosya'), async (req, res) => {
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

            } catch (googleError) {
                console.error("Google Drive yükleme hatası:", googleError);
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

        res.status(200).json({ success: true, message: 'Kampanya başarıyla yüklendi!', campaign: newMedia });
    } catch (error) {
        console.error("Genel hata:", error);
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
        res.status(500).json({ message: 'Bir hata oluştu', error });
    }
});

// Google OAuth2 Client Setup
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uris = process.env.REDIRECT_URIS;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';

fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
        console.error('Token dosyası bulunamadı. Yetkilendirme yapmalısınız.');
        return;
    }
    oAuth2Client.setCredentials(JSON.parse(token));

    // Token ayarlandıktan sonra Google Drive API nesnesini oluşturun
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code; // URL üzerinden gönderilen "code" parametresini alıyoruz
  
  if (!code) {
    return res.status(400).send('Code not found in the URL.');
  }

  try {
    // Kodla token al
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Token'ı dosyaya kaydet
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    res.send('Token başarıyla kaydedildi!');
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).send('Token alınırken bir hata oluştu.');
  }
});

// Kullanıcıyı OAuth2 sayfasına yönlendir
app.get('/authorize', (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    
    // URL'yi konsola yazdırıyoruz
    console.log('Yetkilendirme URL\'si: ', authUrl);
  
    // Kullanıcıyı OAuth2 sayfasına yönlendiriyoruz
    res.redirect(authUrl);
  });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// Token doğrulama middleware'ı
function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Token'ı header'dan al

    if (!token) {
        return res.status(401).json({ error: 'Erişim izni yok.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_secret_key');  // Token'ı doğrula
        req.user = decoded; // Token'dan kullanıcı bilgilerini al
        next(); // İstek işlemi devam etsin
    } catch (err) {
        res.status(403).json({ error: 'Geçersiz token.' });
    }
}  