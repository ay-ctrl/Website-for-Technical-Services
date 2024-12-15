const express = require('express');
const mongoose= require('mongoose');
const app = express();
const cors = require('cors');
app.use(express.json());

const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Frontend adresi
    methods: ['GET', 'POST'], // İzin verilen HTTP metodları
    allowedHeaders: ['Content-Type'], // İzin verilen başlıklar
};

app.use(cors(corsOptions)); // CORS'u etkinleştir

app.post("/api/users",(req,res)=>{
    console.log(req.body);
    res.send("Data recieved to the server "+JSON.stringify(req.body));
});

app.get("/api/users",(req,res)=>{
    console.log("aaaaa");
    res.send("ayse");
});

app.get("/",(req,res)=>{
    res.send("hello from api server day");
});


mongoose.connect("mongodb+srv://moonloversin:Wg0RBqGNubEaOiAg@backend.cnmfb.mongodb.net/NODE-API?retryWrites=true&w=majority&appName=Backend").then(()=>{
    console.log("Connected to database :)");
    app.listen(3000, ()=>{
        console.log("Server is running on port 3000");
    });
}).catch(()=>{
    console.log("Connection failed :(");
});