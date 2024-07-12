require("dotenv").config();
const multer = require("multer");
const multerS3 = require("multer-s3");
const storage = multer.memoryStorage();
const AWS = require("aws-sdk");
const moment = require("moment");
const shortid = require("shortid");

let space = new AWS.S3({
    //Get the endpoint from the DO website for your space
    endpoint: "sgp1.vultrobjects.com",
    useAccelerateEndpoint: false,
    //Create a credential using DO Spaces API key (https://cloud.digitalocean.com/account/api/tokens)
    credentials: new AWS.Credentials(
        process.env.ACCESS_KEY_ID,
        process.env.SECRET_ACCESS_KEY,
        null
    ),
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
    }
};

const upload = multer({
    fileFilter,
    storage: multerS3({
        acl: "public-read",
        s3: space,
        bucket: "s3auto",
        contentType: function(req, file, cb) {
            cb(null, file.mimetype);
        },
        key: function(req, file, cb) {
            cb(null, `${req.body.dir}/${shortid.generate()}-${file.originalname}`);
        },
    }),
});



module.exports = {
    upload,
    space
};