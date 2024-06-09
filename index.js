const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Chat = require('./models/chat.js');
const methodOverride = require('method-override');
const ExpressError = require('./ExpressError');


main()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));




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
app.get('/chats',
    AsyncWrap(async (req, res) => {
        let chats = await Chat.find();
    res.render("index.ejs", { chats });
})
);

//New route
app.get('/chats/new', (req, res) => {
    // throw new ExpressError( 404,'Page Not Found');
    res.render("new.ejs");
});

//Create route
app.post("/chats", 
    AsyncWrap(async (req, res, next) => {
    let { from, to, masg } = req.body;
    let newChat = new Chat({
        from: from,
        to: to,
        masg: masg,
        created_at: new Date()
    });

    await newChat.save();
    res.redirect("/chats");
   })
);

//AsyncWrap
function AsyncWrap(fn){
return function(req, res, next){
    fn(req, res, next).catch((error) => next(error));
};
}

//New - Show route
app.get('/chats/:id',
    AsyncWrap (async (req, res, next) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    if (!chat) {
     next(new ExpressError(404, 'Chat Not Found'));
    }
    res.render("edit.ejs", { chat });
})
);

//Edit route
app.get('/chats/:id/edit',
    AsyncWrap(async (req, res) => {
        let { id } = req.params;
        const cleanedId = cleanObjectId(id);
        let chat = await Chat.findById(cleanedId);
        res.render("edit.ejs", { chat });
    })
);

//Update route
app.put("/chats/:id", 
    AsyncWrap(async (req, res) => {
        let { id } = req.params;
        const cleanedId = cleanObjectId(id);
        let { masg: newMasg } = req.body;
        let updatedChat = await Chat.findByIdAndUpdate(cleanedId,
            { masg: newMasg },
            { runValidators: true, new: true }
        );
        console.log(updatedChat);
        res.redirect("/chats");
    })
);

//Delete route
app.delete("/chats/:id", 
    AsyncWrap(async (req, res) => {
        let { id } = req.params;
        const cleanedId = cleanObjectId(id);
        let deletedChat = await Chat.findByIdAndDelete(cleanedId);
        console.log(deletedChat);
        res.redirect("/chats");
    })
);

app.get('/', (req, res) => {
    res.send('Hello World');
});


//Error handiling middleware that prints the error name 
const handleValidationError = (err) => {
    console.log("Validation Error. Plesae check your input");
    console.dir(err.message);
    return err;
};

app.use((err, req,res,next)=>{
    console.log(err.name);
    if(err.name === "validationError"){
      err = handleValidationError(err);
    }
    next(err);
});

//Error handiling middleware
app.use((err, req, res, next) => {
    let { status = 500, message = 'Not Found' } = err;
    res.status(status).send(message);
});


app.listen(8080, () => {
    console.log('Server is running on port 8080');
});