const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const predictionLogSchema = new mongoose.Schema({
  city: String,
  weather: Object,
  aqi: Object,
  prediction: Object,
  user_input: Object,
  createdAt: { type: Date, default: Date.now }
});

const PredictionLog = mongoose.model('PredictionLog', predictionLogSchema);

const connectDB = async () => {
  try {
    console.log('Spinning up an internal local MongoDB server to bypass firewall...');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully (Local Memory Server Bypass)!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Starting without DB support.');
  }
};

module.exports = { connectDB, PredictionLog };
