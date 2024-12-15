const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    name: { type: String, required: true }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model('Issue', issueSchema);

// when uploading default values

/*const Issue = require('./issuesModel');

const defaultIssues = [
    { name: "Ekran kırıldı" },
    { name: "Pil sorunları" },
    { name: "Yazılım hataları" },
    { name: "Ses problemi" },
    { name: "Bağlantı sorunları" }
];

// Veritabanına eklemek için
Issue.insertMany(defaultIssues)
    .then(() => console.log('Sorunlar eklendi'))
    .catch(err => console.error('Sorun ekleme hatası:', err));
*/