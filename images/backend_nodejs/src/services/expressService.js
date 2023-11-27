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

// POST endpoint, upload file to uploads/ directory
router.post('/upload', upload.single('file'), async (req, res) => {
    // try to create file in database to store file meta data
    try {
        const fileData = {
            path: req.file.path,
            originalName: req.file.originalname,
        }
        const file = await File.create(fileData)

        const downloadUrl = `http://${req.headers.host}/download/${file._id}`;

        res.json({ message: 'File uploaded!', downloadUrl });
    } catch (err) {
        // if error, log error
        console.error('Error uploading file:', err);
    }
});

// GET endpoint, download file from uploads/ directory
router.get('/download/:filename', async (req, res) => {
    // try to find file data from database
    const file = await File.findById(req.params.filename);
    // if file not found, return error
    if (!file) {
        return res.json({ message: 'File not found!' });
    } else {
        // if file found, send file to client        
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.status(200).sendFile(path.resolve(file.path))
    }
});

export default router;