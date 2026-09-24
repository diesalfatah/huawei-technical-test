// SECTION IMPORTS
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const usageRoutes = require('./routes/usage.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

// SECTION APP SETUP
const app = express();

app.use(helmet());
app.use(cors({origin: true, credentials: true}));
app.use(express.json());
app.use(morgan('dev'));

// Auth routes → POST /api/auth/login , GET /api/auth/me
app.use('/api/auth', authRoutes);
// Usage routes → /api/usage
app.use('/api', usageRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;