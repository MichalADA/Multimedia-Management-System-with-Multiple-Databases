const express = require('express');
const mongoose = require('mongoose');
const { sequelize } = require('./config/database');
const Redis = require('redis');
const Media = require('./models/mongoMedia');
const { User } = require('./models/postgresUser');
const cors = require('cors');

// Inicjalizacja Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Połączenie z MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Połączenie z PostgreSQL - już zdefiniowane w config/database.js
sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    // Synchronizacja modeli z bazą danych
    return sequelize.sync({ force: false });
  })
  .then(() => console.log('PostgreSQL models synchronized'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Połączenie z Redis
const redisClient = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// Testowa trasa dla MongoDB
app.get('/mongo-test', async (req, res) => {
  try {
    const testMedia = new Media({
      title: 'Test Media',
      type: 'test',
      filePath: '/test/path.txt',
      fileSize: 1024,
      mimeType: 'text/plain'
    });
    await testMedia.save();
    const mediaCount = await Media.countDocuments();
    res.json({ 
      message: 'MongoDB connection successful',
      testMedia,
      totalDocuments: mediaCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Testowa trasa dla PostgreSQL
app.get('/postgres-test', async (req, res) => {
  try {
    const testUser = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    const userCount = await User.count();
    res.json({ 
      message: 'PostgreSQL connection successful',
      testUser,
      totalUsers: userCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Testowa trasa dla Redis
app.get('/redis-test', async (req, res) => {
  try {
    const testKey = 'test:key';
    const testValue = `Redis test value: ${Date.now()}`;
    await redisClient.set(testKey, testValue);
    const retrievedValue = await redisClient.get(testKey);
    res.json({ 
      message: 'Redis connection successful',
      testKey,
      testValue,
      retrievedValue
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Testowa trasa dla wszystkich baz danych
app.get('/test-all', async (req, res) => {
  try {
    // Test MongoDB
    const mediaCount = await Media.countDocuments();
    
    // Test PostgreSQL
    const userCount = await User.count();
    
    // Test Redis
    const testKey = 'test:all';
    const testValue = `Combined test at ${Date.now()}`;
    await redisClient.set(testKey, testValue);
    const retrievedValue = await redisClient.get(testKey);
    
    res.json({
      mongodb: {
        status: 'Connected',
        documentsCount: mediaCount
      },
      postgres: {
        status: 'Connected',
        usersCount: userCount
      },
      redis: {
        status: 'Connected',
        testKey,
        testValue: retrievedValue
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});