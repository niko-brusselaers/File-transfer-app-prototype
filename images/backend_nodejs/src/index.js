import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors())
const port = 4000;

mongoose.connect(process.env.MONGODB_URL);

const upload = multer({ dest: "uploads" })

const fileSchema = new mongoose.Schema({
  path: String,
  originalName: String,
})

const File = mongoose.model('File', fileSchema);


app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('File uploaded:', req.file);
  try {
    const fileData = {
      path: req.file.path,
      originalName: req.file.originalname,
    }
    const file = await File.create(fileData)

    const downloadUrl = `${req.headers.origin}/download/${file._id}`;

    res.json({ message: 'File uploaded!', downloadUrl });
  } catch (err) {
    console.error('Error uploading file:', err);
  }
});

app.get('/download/:filename', async (req, res) => {
  const file = await File.findById(req.params.filename);

  if (!file) {
    return res.json({ message: 'File not found!' });
  } else {
    res.download(file.path, file.originalName);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
