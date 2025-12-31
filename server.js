require("dotenv").config();

const express = require('express');
const path = require('path');
const uploadRoute = require("./server/upload.js");
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home', {
    page: 'beranda',
    title: 'Beranda'
  });
});

app.get('/latihan', (req, res) => {
  res.render('latihan', {
    page: 'latihan',
    title: 'Latihan'
  });
});

app.get('/kalender', (req, res) => {
  res.render('kalender', {
    page: 'kalender',
    title: 'Kalender'
  });
});

app.get('/foto', (req, res) => {
  res.render('foto', {
    page: 'foto',
    title: 'Foto'
  });
});

app.get('/rekaman', (req, res) => {
  res.render('rekaman', {
    page: 'rekaman',
    title: 'Rekaman'
  });
});

app.use("/api", uploadRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
