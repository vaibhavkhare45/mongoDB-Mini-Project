const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Chat = require('./models/chat.js');
const methodOverride = require('method-override');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


main()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

// Function to validate and clean ObjectId
function cleanObjectId(id) {
    if (typeof id === 'string') {
        id = id.trim(); // Remove leading and trailing spaces
        if (mongoose.Types.ObjectId.isValid(id)) {
            return id;
        }
    }
    throw new Error('Invalid ObjectId');
}

//Index route
app.get('/chats', async (req, res) => {
    let chats = await Chat.find();
    // console.log(chats);
    res.render("index.ejs", { chats });
});

//New route
app.get('/chats/new', (req, res) => {
    res.render("new.ejs");
});

//Create route
app.post("/chats", async (req, res) => {
    let { from, to, masg } = req.body;
    let newChat = new Chat({
        from: from,
        to: to,
        masg: masg,
        created_at: new Date()
    });

    newChat.save().then((res) => {
        console.log("Chat saved");
    }).catch((err) => {
        console.log(err);
    });
    res.redirect("/chats");
});

//Edit route
app.get('/chats/:id/edit', async (req, res) => {
    try {
        let { id } = req.params;
        const cleanedId = cleanObjectId(id);
        let chat = await Chat.findById(cleanedId);
        res.render("edit.ejs", { chat });
    } catch (error) {
        console.error('Error fetching chat:', error.message);
        res.status(400).send('Invalid Chat ID');
    }
});

//Update route
app.put("/chats/:id", async (req, res) => {
    try {
        let { id } = req.params;
        const cleanedId = cleanObjectId(id);
        let { masg: newMasg } = req.body;
        let updatedChat = await Chat.findByIdAndUpdate(cleanedId,
            { masg: newMasg },
            { runValidators: true, new: true }
        );
        console.log(updatedChat);
        res.redirect("/chats");
    } catch (error) {
        console.error('Error updating chat:', error.message);
        res.status(400).send('Invalid Chat ID');
    }
});

//Delete route
app.delete("/chats/:id", async (req, res) => {
    try {
        let { id } = req.params;
        const cleanedId = cleanObjectId(id);
        let deletedChat = await Chat.findByIdAndDelete(cleanedId);
        console.log(deletedChat);
        res.redirect("/chats");
    } catch (error) {
        console.error('Error deleting chat:', error.message);
        res.status(400).send('Invalid Chat ID');
    }
});

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(8080, () => {
    console.log('Server is running on port 8080');
});