const express = require('express'); // Express.js modülünü dahil ediyoruz
const app = express(); // Express uygulamasını başlatıyoruz
const port = process.env.PORT || 3000; // Sunucu portunu belirliyoruz

// Temel bir GET rotası
app.get('/', (req, res) => {
    res.send('Merhaba! Bu benim web sitemin backend\'i.'); // Ana sayfada basit bir mesaj döndürüyoruz
});

// Sunucuyu belirtilen portta dinlemeye başlıyoruz
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
