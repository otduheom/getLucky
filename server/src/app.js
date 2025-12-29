const express = require('express');
const path = require('path');
const serverConfig = require('./configs/serverConfig');
const apiRouter = require('./routes/apiRouter');
require('dotenv').config();

const app = express();

// Регистрация

serverConfig(app);

app.use('/api', apiRouter);

app.get('/api/cookie', (req, res) => {
  res
    .cookie('test', 'info', {
      maxAge: 1000 * 60 * 60 * 60,
      httpOnly: true,
    })
    .send('done');
});

app.delete('/api/cookie', (req, res) => {
  res.clearCookie('test').send('ok');
});

app.get('/api/my-cookie', (req, res) => {
  console.log('req.cookies', req.cookies);
  res.send('done');
});

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// const PORT = process.env.PORT || 3001;

// app.listen(PORT, () => console.log(`Сервер запушен на ${PORT}`));
module.exports = app;
