// src/server.js
require('./config/env');
const app = require('./app');
const { startJobs } = require('./jobs');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startJobs();
});