const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('debug', true);

async function testConnection() {
  try {
    console.log("Connecting using MONGODB_URL:", process.env.MONGODB_URL);
    await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully!");
  } catch (err) {
    console.error("Connection failed with error:");
    console.error(err);
  } finally {
    process.exit(0);
  }
}

testConnection();
