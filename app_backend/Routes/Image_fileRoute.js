const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const path = require('path')
const userModel = mongoose.model('userModel')
const multer = require('multer');

global.__basedir = path.resolve(__dirname, '..');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__basedir, 'Images'))
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true)
        } else {
            cb(null, false);
            return res.status(400).json({ error: "File types allowed are .jpeg, .png, .jpg" });
        }
    }
});

router.post("/api/user/:id/uploadProfilePic", upload.single('file'), async (req, res) => {
    try {
        const userId = req.params.id;
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a image' })
        }
        const imagePath = req.file.filename;

        await userModel.findByIdAndUpdate(userId, { profilepicture: imagePath });

        res.json({ "fileName": req.file.filename });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Some error occured' });
    }
})

router.post("/uploadFile", upload.single('file'), function (req, res) {
    res.json({ "fileName": req.file.filename });
});

const downloadFile = (req, res) => {
    const fileName = req.params.filename;
    const path = __basedir + "/Images/";

    res.download(path + fileName, (error) => {
        if (error) {
            res.status(500).send({ msg: "File cannot be downloaded ", error: error.message });
        }
    })
}
router.get("/files/:filename", downloadFile);

module.exports = router;