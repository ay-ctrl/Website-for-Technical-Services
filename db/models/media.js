const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    filename: { type: String, required: true }, // Dosya adı
    contentType: { type: String, required: true }, // Dosya türü (image/jpeg, image/png, vb.)
    uploadDate: { type: Date, default: Date.now }, // Yükleme tarihi
    description: { type: String, required: false }, // Dosya açıklaması (isteğe bağlı)
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true } // GridFS'teki dosya ID'si
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model('Media', mediaSchema);


// to load media
/*const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

const url = 'mongodb://localhost:27017';
const dbName = 'mydatabase';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const conn = mongoose.connection;

conn.once('open', () => {
    console.log('Veritabanına bağlı');
    const bucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });

    // Örnek dosya yükleme
    const uploadStream = bucket.openUploadStream('sample.jpg', {
        contentType: 'image/jpeg'
    });
    fs.createReadStream(path.join(__dirname, 'sample.jpg')).pipe(uploadStream)
        .on('error', (error) => {
            console.error('Yükleme hatası:', error);
        })
        .on('finish', () => {
            console.log('Dosya başarıyla yüklendi');
        });
});
*/


