const mongoose = require('mongoose');
const Chat = require('./models/chat.js');

main()
    .then(() =>{
        console.log('Connected to MongoDB');
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/fakewhatsapp');
}

let allChats=[
    {
        from:"bhaskar",
        to:"Ayush",
        masg:"Hello Ayush",
        created_at:new Date()
    },
    {
        from:"Ayush",
        to:"bhaskar",
        masg:"Hello bhaskar",
        created_at:new Date()
    },
    {
        from:"Om",
        to:"vaibhav",
        masg:"Hello vaibhav",
        created_at:new Date()
    },
];

Chat.insertMany(allChats);
