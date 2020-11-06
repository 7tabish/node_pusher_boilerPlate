import mongoose from 'mongoose';
const messageSchema=mongoose.Schema({
    message:String,
    name:String,
    timestamp:String,
    recieved:Boolean
})


export default mongoose.model('messageModel',messageSchema)