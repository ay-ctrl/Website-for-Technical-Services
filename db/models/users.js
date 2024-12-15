const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Kullanıcı adı
    password: { type: String, required: true }, // Şifre
    email:    {type: String, required: true},
    phoneNumber: {type: String, required: true}
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

// Şifreyi kaydetmeden önce hashleme
userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

// Şifre doğrulama methodu
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// to save a user
/*const User = require('./userSchema');

async function registerUser(username, password) {
    try {
        const user = new User({ username, password });
        await user.save();
        console.log('Kullanıcı başarıyla kaydedildi');
    } catch (err) {
        console.error('Kullanıcı kaydı hatası:', err);
    }
}

// Kullanıcı girişi
registerUser('exampleUser', 'examplePassword');
*/ 

/*const User = require('./userSchema');

async function loginUser(username, password) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw new Error('Kullanıcı bulunamadı');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Geçersiz şifre');
        }
        console.log('Giriş başarılı');
    } catch (err) {
        console.error('Giriş hatası:', err);
    }
}

// Örnek kullanıcı giriş yapma
loginUser('exampleUser', 'examplePassword');
*/