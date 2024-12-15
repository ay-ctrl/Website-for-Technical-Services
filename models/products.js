const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Ürün ID'si
    name: { type: String, required: true }, // Ürün ismi
    type: { type: String, required: true }, // Ürün türü
    price: { type: Number, required: true }, // Ürün fiyatı
    description: { type: String, required: true }, // Ürün açıklaması
    photos: [{ type: String, required: false }] // Ürün fotoğrafları (URL'ler veya dosya yolları)
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model('Product', productSchema);



