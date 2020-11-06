import express from 'express';
import mongoose from 'mongoose';
import messageModel from './schema/messagesSchema.js';
import Pusher from 'pusher';

const app=express()
const PORT = process.env.PORT || 4000

//midlewares
app.use(express.json());

app.use((req, res, next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*')
    next();
})


//connect to db
const userName=''
const databaseName=''
const dbConnectionUrl=`mongodb+srv://${userName}:vdfbKGogaOAhAY3F@whatsappcluster.t5mfj.mongodb.net/${databaseName}?retryWrites=true&w=majority`
mongoose.connect(dbConnectionUrl,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});


//you may replace these credentials with the code provid on your pusher account
const pusher = new Pusher({
    appId: "pusherApiId",
    key: "pusherKey",
    secret: "pusherSecret",
    cluster: "clusterName",
    useTLS: true
  });


const db=mongoose.connection;
db.once("open",()=>{
    console.log('db connected !');
    const msgCollection=db.collection("messagemodels");
    const changeStream=msgCollection.watch();

    changeStream.on("change",change=>{

        if (change.operationType=="insert"){

            const messageDetails=change.fullDocument;
            pusher.trigger("messages","inserted",
            {
                _id:messageDetails._id,
                name:messageDetails.user,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                recieved:messageDetails.recieved
            })//end trigger
        }//end if
        else{
            console.log('Error while triggering pusher');
        }
    
    })//end change stream
})


  

//end points
app.get('/',(req,res)=>
messageModel.find()
.then(allMsgs=>res.status(200).send(allMsgs))
.catch(error=>res.send(500).send(error))
)

app.post('/new/message',(req,res)=>{
    const msgBody=req.body;
    messageModel.create(msgBody)
    .then(newMsg=>res.status(201).send(newMsg))
    .catch(err=>res.status(500).send(err));
})

//listening
app.listen(PORT,()=>console.log(`API running  on ${PORT}`))