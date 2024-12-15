const mongoose = require('mongoose');

const phoneModelSchema = new mongoose.Schema({
    brand: { type: String, required: true }, // Telefon markası
    model: { type: String, required: true }, // Telefon modeli
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model('PhoneModel', phoneModelSchema);

// to load default values
/*const mongoose = require('mongoose');
const PhoneModel = require('./phoneModelSchema');

// MongoDB bağlantı adresi
const url = 'mongodb://localhost:27017/mydatabase';

// Default telefon modelleri
const defaultPhoneModels = [
    { brand: "Apple", model: "iPhone 14" },
    { brand: "Samsung", model: "Galaxy S22" },
    { brand: "Google", model: "Pixel 7" }
];

// Veritabanına bağlanma ve verileri ekleme
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Veritabanına bağlanıldı');

        // Mevcut verileri kontrol etme ve ekleme
        PhoneModel.countDocuments((err, count) => {
            if (err) {
                console.error('Hata:', err);
            } else if (count === 0) {
                // Eğer veri yoksa, default verileri ekleme
                PhoneModel.insertMany(defaultPhoneModels)
                    .then(() => console.log('Default telefon modelleri eklendi'))
                    .catch(err => console.error('Veri ekleme hatası:', err))
                    .finally(() => mongoose.connection.close());
            } else {
                console.log('Telefon modelleri zaten mevcut');
                mongoose.connection.close();
            }
        });
    })
    .catch(err => console.error('Veritabanına bağlanılamadı:', err));
*/

