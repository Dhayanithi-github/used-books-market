const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads folder
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err.message));

// Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Book Schema (simple for now)
const Book = mongoose.model('Book', new mongoose.Schema({
  title: String,
  author: String,
  price: Number,
  location: String,
  images: [String]
}, { timestamps: true }));

// Routes
app.get('/api/books', async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
});

app.post('/api/books', upload.array('images', 5), async (req, res) => {
  try {
    const images = req.files.map(file => 
      `http://localhost:5000/uploads/${file.filename}`
    );

    const book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      price: Number(req.body.price),
      location: req.body.location,
      images
    });

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Used Books API Running 📚'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));