import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Correct write concern format
    w: 'majority',
};

mongoose.connect(process.env.MONGODB_URL, options);


const upload = multer({ dest: "uploads" })
const router = express.Router();


const fileSchema = new mongoose.Schema({
    path: String,
    type: String,
    originalName: String,
})

const File = mongoose.model('File', fileSchema);


router.post('/upload', upload.single('file'), async (req, res) => {
    console.log('File uploaded:', req.file);
    try {
        const fileData = {
            path: req.file.path,
            originalName: req.file.originalname,
        }
        const file = await File.create(fileData)

        const downloadUrl = `http://${req.headers.host}/download/${file._id}`;

        res.json({ message: 'File uploaded!', downloadUrl });
    } catch (err) {
        console.error('Error uploading file:', err);
    }
});

router.get('/download/:filename', async (req, res) => {
    const file = await File.findById(req.params.filename);

    if (!file) {
        return res.json({ message: 'File not found!' });
    } else {
        console.log(file.path);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.status(200).sendFile(path.resolve(file.path))
    }
});

export default router;