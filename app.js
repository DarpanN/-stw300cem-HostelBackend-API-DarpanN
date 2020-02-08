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




//User Login For Web
app.post("/login22", async function (req, res) {

    const User = await user.checkCrediantialsDb(req.body.email,
        req.body.password)
    const token = await User.generateAuthToken()
    res.send({ token: token, User: User })
    console.log(User);
})

//User Login For Android
app.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    console.log(req.body);

    user.find({
        email: email,
        password: password

    }).then(function (logindata) {

        if (logindata) {
            console.log(logindata)
            res.send(JSON.stringify(logindata));
        }
        else {
            res.send(JSON.stringify('invalid_login'))
        }
    }).catch(function (e) {
        res.send(e)
    })
})



//Select User
app.get('/users', auth, function (req, res) {
    res.send(req.user);
})

// Profile Update
app.post('/updateuser/:id', function (req, res) {
    var fullname = req.body.fullname;
    var email = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    var image = req.body.image;
    var uid = req.params.id;
    console.log(req.body);
    user.updateOne({ _id: new ObjectID(uid) },
        {
            $set: {
                fullname: fullname,
                email: email,
                phone: phone,
                address: address,
                image: image
            }
        }).then(function () {
            console.log('Success')
            res.send(JSON.stringify('profile_updated'));
        }).catch(function () {
            console.log('error')
        })

})


// For User Logout
app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//For Add hostel
app.post('/addhostel', function (req, res) {
    var hostelname = req.body.hostelname;
    var hosteltype = req.body.hosteltype;
    var email = req.body.email;
    var address = req.body.address;
    var phone = req.body.phone;
    var description = req.body.description;
    var image = req.body.image;

    var HostelData = new hostel({
        hostelname: hostelname,
        hosteltype: hosteltype,
        email: email,
        address: address,
        phone: phone,
        description: description,
        image: image
    })
    hostel.findOne({
        hostelname: hostelname
    }).then(function (data) {
        if (data) {
            res.json({ msg: "hostel_exist" });
        }
        else {
            HostelData.save().then(function (data) {
                res.json({ msg: "hostel_not_exist" })
            })

        }
    }).catch(function (e) {
        res.send(e);
    })

})



app.listen(8080)
