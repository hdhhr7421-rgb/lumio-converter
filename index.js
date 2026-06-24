const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.send('Lumio Converter Online ✅');
});

app.post('/convert', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' });

  const inputPath  = req.file.path;
  const outputPath = inputPath + '.mp4';

  ffmpeg(inputPath)
    .outputOptions([
      '-c:v libx264',
      '-preset ultrafast',
      '-crf 23',
      '-c:a aac',
      '-b:a 128k',
      '-movflags +faststart',
      '-pix_fmt yuv420p'
    ])
    .save(outputPath)
    .on('end', () => {
      res.download(outputPath, 'video.mp4', () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error(err);
      fs.unlinkSync(inputPath);
      res.status(500).json({ error: err.message });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
