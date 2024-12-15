const mongoose = require('mongoose');
const User = require('./models/users.js'); // User modeli burada dahil ediliyor

let instance = null;

class Database {
    constructor() {
        if (!instance) {
            this.mongoConnection = null;
            instance = this;
        }
    }

    // Veritabanına bağlanma ve kullanıcı ekleme fonksiyonu
    async initializeDatabase(options) {
        try {
            // Veritabanına bağlan
            await mongoose.connect(options.CONNECTION_STRING);

            console.log('MongoDB bağlantısı başarılı!');

            // Varsayılan bir kullanıcı ekle
            const existingUser = await User.findOne({ username: 'ayse' }); // Aynı kullanıcı varsa ekleme
            if (!existingUser) {
                const newUser = new User({
                    username: 'ayse', // TC Kimlik No veya Vergi No
                    password: '12345',
                });

                await newUser.save();
                console.log('Varsayılan kullanıcı başarıyla eklendi!');
            } else {
                console.log('Varsayılan kullanıcı zaten mevcut.');
            }
        } catch (err) {
            console.error('MongoDB bağlantı hatası veya kullanıcı ekleme hatası:', err);
        } finally {
            // Bağlantıyı kapatma (isteğe bağlı)
            mongoose.disconnect();
        }
    }
}

module.exports = Database;

