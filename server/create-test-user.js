const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/dms');
    console.log('Connected to MongoDB');

    // Define User schema inline
    const userSchema = new mongoose.Schema({
      email: { type: String, unique: true, required: true, lowercase: true },
      password: { type: String, required: true },
      firstName: String,
      lastName: String,
      role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists: test@example.com');
      console.log('   Password: password123');
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'viewer'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\nYou can now log in with these credentials.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
