const mongoose = require('mongoose');


// bu şema ilk sürümde kullanılmayacak
const commentSchema = new mongoose.Schema({
    comment: { type: String, required: true }, // Yorumun kendisi
    name: { type: String, required: true , default: "isimsiz"}, // Yorum yapan kişinin adı
    ip: { type: String, required: true },
    timestamp: { type: Date, default: Date.now } // Yorumun zamanı (varsayılan olarak şu anki zaman)
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

const Comment= mongoose.model('Comment', commentSchema);
module.exports=Comment;

// yayınlanmadan önce yorumun içeriği değerlendirilmeli

