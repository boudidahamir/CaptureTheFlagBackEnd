const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();

// Enable CORS for specific origin
app.use(cors({
  origin: 'http://localhost:5000', // Replace with your frontend's URL
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/auth-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
