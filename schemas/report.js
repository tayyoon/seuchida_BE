const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    
    createdAt: String,
    userId: String,
    content: String
});

module.exports = mongoose.model('Reports',reportSchema);