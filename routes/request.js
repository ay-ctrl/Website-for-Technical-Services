const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController.js');

// Yeni talep oluşturma
router.post('/create', requestController.createRequest);

// Tüm talepleri alma
router.get('/', requestController.getAllRequests);

// ID ile talep alma
router.get('/:id', requestController.getRequestById);

module.exports = router;
