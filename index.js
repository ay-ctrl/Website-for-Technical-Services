const express = require('express');
const mongoose= require('mongoose');
const app = express();
const cors = require('cors');
app.use(express.json());
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

// Schemas
const Request = require('./models/repairRequests'); 
const User=require('./models/users');
const Campaign=require('./models/campaigns');




//Sunucuya gelen isteklere izin vermek için
const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Frontend adresi
    methods: ['GET', 'POST'], // İzin verilen HTTP metodları
    allowedHeaders: ['Content-Type'], // İzin verilen başlıklar
};

app.use(cors(corsOptions)); // CORS'u etkinleştir

//sunucu ve mongodb bağlantısı
mongoose.connect("mongodb+srv://moonloversin:Wg0RBqGNubEaOiAg@backend.cnmfb.mongodb.net/NODE-API?retryWrites=true&w=majority&appName=Backend").then(()=>{
    console.log("Connected to database :)"); 
    app.listen(3000, ()=>{
        console.log("Server is running on port 3000");
    });
}).catch(()=>{
    console.log("Connection failed :(");
});


app.post("/api/users",(req,res)=>{
    console.log(req.body);
    res.send("Data recieved to the server "+JSON.stringify(req.body));
});

app.post('/api/repairRequests', async (req, res) => {
    try {
        const newRequest = new Request(req.body); // Gelen form verisini yeni bir Talep'e çevir
        await newRequest.save(); // MongoDB'ye kaydet
        res.status(201).send({message:'Talep başarıyla kaydedildi!', queryNum: newRequest.queryNum});
    } catch (error) {
        res.status(400).send('Talep kaydedilemedi: ' + error.message);
    }
});



// this is for comment sending requests but wont be used at first version
/* 
app.post("/api/comment", async (req, res) => {
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // Aynı IP'den gelen yorum var mı kontrol et
        const existingComment = await Comment.findOne({ ip: userIp });

        if (existingComment) {
            return res.status(400).send({ message: 'Bu IP adresinden zaten yorum yapıldı.' });
        }

        const newComment = new Comment({ ...req.body, ip: userIp });
        await newComment.save();
        res.status(201).send({ message: 'Yorum başarıyla gönderildi!' });
    } catch (error) {
        res.status(400).send({ message: 'Yorum gönderilemedi: ' + error.message });
    }
});
*/



app.post("/api/login", async (req, res) => {
    const { username, password } = req.body; // Kullanıcı adı ve şifreyi al

    try {
        // Veritabanında kullanıcıyı arıyoruz
        const user = await User.findOne({ username });

        // Kullanıcı bulunamazsa hata döner
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        // Veritabanındaki şifreyle gelen şifreyi karşılaştırıyoruz
        if (user.password === password) {
            return res.status(200).json({ message: "Giriş başarılı!" }); // Şifre doğruysa başarılı giriş
        } else {
            return res.status(401).json({ message: "Yanlış şifre" }); // Şifre yanlışsa hata
        }

    } catch (error) {
        console.error("Hata oluştu:", error);
        res.status(500).json({ message: "Bir hata oluştu." });
    }
});

// Talep sorgulama API
app.post("/api/repairRequests/search", async (req, res) => {
    const { queryNum } = req.body; // Kullanıcıdan gelen sorgulama numarası

    try {
        // Talep numarasına göre veritabanında arama yap
        const repairRequest = await Request.findOne({ queryNum });

        if (repairRequest) {
            // Talep bulunduysa, talep bilgilerini geri gönder
            res.json({
                success: true,
                data: repairRequest
            });
        } else {
            res.json({
                success: false,
                message: 'Talep bulunamadı!'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Bir hata oluştu.' });
    }
});

app.get("/api/users",(req,res)=>{
    console.log("aaaaa");
    res.send("ayse");
});

app.get("/",(req,res)=>{
    res.send("hello from api server day");
});


// Multer için dosya yükleme ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dosyalar 'uploads' klasörüne kaydedilecek
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Benzersiz bir isim verilir
    }
});

const upload = multer({ storage: storage });

app.post('/upload-campaign', upload.single('dosya'), async (req, res) => {
    try {
      // Google Drive'a dosya yükleme
      const fileMetadata = {
        name: req.file.filename,
        parents: ['1CzwXTomfW0fF-Lzv86RNufOQm2bXidem']  // Dosyanın yükleneceği klasörün ID'si
      };
  
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path)
      };
  
      const driveResponse = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
      });
  
      // Dosya başarıyla yüklendiyse
      const fileUrl = driveResponse.data.webViewLink;
  
      // MongoDB'ye kaydetme
      const newCampaign = new Campaign({
        description: req.body.aciklama,
        imageURL: fileUrl
      });
  
      await newCampaign.save();
  
      // Geçici dosyayı sil
      fs.unlinkSync(req.file.path);
  
      res.json({ success: true, message: 'Kampanya başarıyla eklendi!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Bir hata oluştu!' });
    }
  });
  


// Google OAuth2 Client Setup
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uris = process.env.REDIRECT_URIS;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);



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



