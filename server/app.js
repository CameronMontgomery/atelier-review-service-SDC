require("dotenv").config();
const morgan = require('morgan');
const express = require('express');
const mountRoutes = require('./routes')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.DEV) {
  app.use(morgan('dev'));
}

// Mounts routes via function returned in routes/index.js
mountRoutes(app)

// Route for Loader.io Verification
app.get('/loaderio-d71a4a0b09f4605ceb47e30636f12c67', (req, res) => {
  res.send('loaderio-d71a4a0b09f4605ceb47e30636f12c67')
})

app.get('*', (req, res) => {
  res.status(404).send('Resource not found')
})


module.exports = app;