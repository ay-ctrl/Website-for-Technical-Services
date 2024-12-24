const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Giriş doğrulama fonksiyonu
userSchema.statics.authenticate = async function (username, password) {
    const user = await this.findOne({ username });
    if (!user) return null; // Kullanıcı bulunamadı

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null; // Şifre yanlış

    return user; // Kullanıcı doğrulandı
};

module.exports = mongoose.model('User', userSchema);

// Şifreyi hash'lemek için fonksiyon

/*async function hashPassword(password) {
    const saltRounds = 10; // Güvenlik için kullanılan salt sayısı
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashlenmiş Şifre:', hashedPassword);
        return hashedPassword;
    } catch (err) {
        console.error('Hata:', err);
    }
}
hashPassword("pasword here to hash");*/


