const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
    model: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    adress: { type: String, required: true },
    sorunlar: { type: [String], required: true }, // Çoklu seçim için bir dizi
    imei: { type: String, default: "belirtilmemiş" },
    kilit: { type: String , default: "yok"},
    yedekCihaz: { type: String , default: "hayır"}, // "evet" veya "hayır"
    queryNum: { type: Number},
    state: {type: String, default: "Talep Alındı"},
    price: {type:String, default: "belirtilmemiş"},
    phoneTakenDate: {type: Date, default: undefined},
    processMade: {type: String},
    repairDescription: {type:String},
    createdAt: { type: Date, default: Date.now }
});

repairRequestSchema.index({ phone: 1 });        
repairRequestSchema.index({ createdAt: -1 });  

repairRequestSchema.pre("save", function (next) {
    // Eğer queryNum zaten ayarlanmışsa yeniden oluşturma
    if (!this.queryNum) {
        // 10000 ile 99999 arasında rastgele bir sayı oluştur
        this.queryNum = Math.floor(10000 + Math.random() * 90000);
    }
    this.phoneTakenDate=null;
    this.processMade="belirtilmemiş";
    this.repairDescription="belirtilmemiş";
    next();
});

module.exports = mongoose.model('Request', repairRequestSchema);


