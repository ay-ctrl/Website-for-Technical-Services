const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    description: {type:String},
    imageURL: {type: String },
    createdAt: { type: Date, default: Date.now }// GridFS'teki dosya ID'si
});

module.exports = mongoose.model('Media', mediaSchema);
