const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true }, // Yorumun kendisi
    name: { type: String, required: true , default: "no-name"}, // Yorum yapan kişinin adı
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

