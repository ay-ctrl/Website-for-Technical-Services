const express = require('express');
const router = express.Router();

// /requests adresine gelen GET isteği
router.get('/', (req, res) => {
    const message = req.query.message; // Sorgu parametresinden gelen 'message' verisi
    console.log('GET isteği alındı:', message);
    
    res.status(200).json({ message: 'GET isteği başarıyla işlendi! happyyyy', receivedMessage: message });
});

module.exports = router;


