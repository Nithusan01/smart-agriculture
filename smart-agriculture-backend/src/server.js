const app  = require("./app")
const {testConnection,syncDatabase} = require("./config/db")
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// Start server
  app.listen(PORT, async () => {
  await testConnection();
  await syncDatabase();
  console.log(`Server is running on port ${PORT}`);

});