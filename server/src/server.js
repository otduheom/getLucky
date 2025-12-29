
const express = require('express');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, (err) => {
  if (err) {
    console.log('error', err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
