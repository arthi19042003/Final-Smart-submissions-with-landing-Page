const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  subject:String, message:String, from:String, to:String, status:String, relatedId:String
},{timestamps:true});
module.exports = mongoose.model('Message', messageSchema);
