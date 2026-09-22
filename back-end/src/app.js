// SECTION IMPORTS
const express = require('express');
const cors = require('cors');
const usageRoutes = require('./routes/usage.routes');

// SECTION APP SETUP
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', usageRoutes);

module.exports = app;