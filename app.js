require('./connection/db');
const user = require('./model/user');
const hostel = require('./model/Hostel');
const room = require('./model/room');
const Message = require('./model/message');
const Review = require('./model/review');
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
const path = require('path');
const multer = require('multer');

var Image;
app.use("/images", express.static("images"))
var storage = multer.diskStorage({
    destination: "images",
    filename: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        Image = file.fieldname + "_" + Date.now() + ext;
        callback(null, Image);
    }
});

var imageFileFilter = (req, file, cb) => {
    if
        (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { return cb(newError("You can upload only image files!"), false); }
    cb(null, true);
};

var upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 1000000
    }
});


app.post('/upload', upload.single('imageFile'), (req, res) => {
    console.log(Image)
    res.send(Image)
})

app.post('/uploadimg', upload.single('files'), (req, res) => {
    res.send(JSON.stringify({
        filename: Image
    }))
})

// User Registration
app.post('/register', function (req, res) {
    var fullname = req.body.fullname;
    var email = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    var image = "image";
    var usertype = "buyer";
    var password = req.body.password;
    console.log(req.body);

    var userData = new user({
        fullname: fullname,
        email: email,
        phone: phone,
        address: address,
        image: image,
        usertype: usertype,
        password: password
    })
    user.findOne({
        email: email
    }).then(function (data) {
        if (data) {
            res.send(JSON.stringify('user_registred'));
            res.json({ msg: "user_exist" });
        }
        else {
            userData.save().then(function (data) {
                res.send(JSON.stringify('user_registred'));
                console.log('user already exist.!');
                res.json({ msg: "user_not_exist" })
            })

        }
    }).catch(function (e) {
        res.send(e);
    })

})



app.listen(8080)