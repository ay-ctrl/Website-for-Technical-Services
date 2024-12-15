require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();

// CORS ayarları
const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Frontend adresi
    methods: ['GET', 'POST'], // İzin verilen HTTP metodları
    allowedHeaders: ['Content-Type'], // İzin verilen başlıklar
};

app.use(cors(corsOptions)); // CORS'u etkinleştir

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Rotalar
app.use('/requests', require('./routes/request'));

// Hataları Yönlendirme ve Hata İşleme Orta Katmanı
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Sunucu Dinlemeye Başlama
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} numaralı portta çalışıyor`);
});

module.exports = app;
