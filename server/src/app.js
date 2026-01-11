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

// Раздача статических файлов (должно быть после API маршрутов)
const distPath = path.join(__dirname, '..', 'dist');
console.log('Dist path:', distPath);
const fs = require('fs');
if (!fs.existsSync(distPath)) {
  console.error(`⚠️  Директория dist не найдена: ${distPath}`);
  console.error('Убедитесь, что клиент собран: cd client && npm run build');
} else {
  console.log('✅ Директория dist найдена');
}
app.use(express.static(distPath));

// Catch-all маршрут для SPA (должен быть последним)
app.get('/*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error(`⚠️  Файл index.html не найден: ${indexPath}`);
    return res.status(404).send('Client build not found. Please build the client first.');
  }
  res.sendFile(indexPath);
});

// const PORT = process.env.PORT || 3001;

// app.listen(PORT, () => console.log(`Сервер запушен на ${PORT}`));
module.exports = app;
