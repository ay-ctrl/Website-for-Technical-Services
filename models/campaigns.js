const mongoose = require('mongoose');

const campaginSchema = new mongoose.Schema({
    description: {type:String},
    imageURL: {type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports=mongoose.model('Campagin',campaginSchema);