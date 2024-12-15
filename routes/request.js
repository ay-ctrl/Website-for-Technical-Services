const express = require('express');
const router = express.Router();

// /requests adresine gelen POST isteği
router.post('/', (req, res) => {
    console.log('POST isteği alındı:', req.body);
    res.status(200).json({ message: 'İstek başarıyla alındı!' });
});

module.exports = router;
