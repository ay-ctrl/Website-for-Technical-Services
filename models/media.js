const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    description: {type:String},
    imageURL: {type: String },
    createdAt: { type: Date, default: Date.now }// GridFS'teki dosya ID'si
    
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


