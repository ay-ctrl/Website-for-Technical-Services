const express = require('express');
const mongoose= require('mongoose');
const app = express();
const cors = require('cors');
app.use(express.json());
const Request = require('./models/repairRequests'); 
const User=require('./models/users');
const Comment=require('./models/comments');

const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Frontend adresi
    methods: ['GET', 'POST'], // İzin verilen HTTP metodları
    allowedHeaders: ['Content-Type'], // İzin verilen başlıklar
};

app.use(cors(corsOptions)); // CORS'u etkinleştir

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



mongoose.connect("mongodb+srv://moonloversin:Wg0RBqGNubEaOiAg@backend.cnmfb.mongodb.net/NODE-API?retryWrites=true&w=majority&appName=Backend").then(()=>{
    console.log("Connected to database :)"); 
    app.listen(3000, ()=>{
        console.log("Server is running on port 3000");
    });
}).catch(()=>{
    console.log("Connection failed :(");
});

