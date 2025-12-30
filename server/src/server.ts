import mongoose from 'mongoose';
import app from './app';
import { config } from './config';
import { initGridFS } from './services';

const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ MongoDB connected successfully');

    // Initialize GridFS after MongoDB connection
    initGridFS();

    // Start Express server
    app.listen(config.port, () => {
      console.log(`✅ Server running on http://localhost:${config.port}`);
      console.log(`📁 Files stored in: MongoDB GridFS`);
      console.log(`📦 Max file size: ${config.maxFileSize / (1024 * 1024)}MB`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
