const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    phoneModel: { type: String, required: true }, // Telefon Modeliniz
    fullName: { type: String, required: true }, // Adınız Soyadınız
    phoneNumber: { type: String, required: true }, // Telefon Numaranız
    address: { type: String, required: true }, // Adres
    issues: { type: [String], required: true }, // Karşılaşılan Sorun (Çoklu seçenek)
    imeiNumber: { type: String, required: false }, // Cihazın IMEI Numarası (İsteğe Bağlı)
    lockCode: { type: String, required: false }, // Cihazın Tuş Kilidi (Varsa)
    wantsReplacement: { type: Boolean, default: true } // Yedek Cihaz İstiyor Musunuz? (Evet / Hayır)
}, { 
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
 });

module.exports = mongoose.model('Request', requestSchema);


