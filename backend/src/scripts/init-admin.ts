import 'reflect-metadata';
import '@dotenvx/dotenvx/config';
import { connectDatabases, disconnectDatabases, MySQLDataSource } from '../config/database';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';

async function initAdmin() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';

  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`📝 Args:`, process.argv);

  try {
    await connectDatabases();
    console.log('✅ Connected to databases');

    const userRepo = MySQLDataSource.getRepository(User);
    
    // Check if admin already exists
    const existingAdmin = await userRepo.findOne({ where: { email } });
    
    if (existingAdmin) {
      console.log(`ℹ️  Admin user already exists: ${email}`);
      console.log('   To update password, delete the user first or use password reset.');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = userRepo.create({
        email,
        password: hashedPassword,
        role: 'admin',
      });
      await userRepo.save(admin);
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    }
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  } finally {
    await disconnectDatabases();
    process.exit(0);
  }
}

console.log('🔐 Initializing admin user...');
console.log('   Usage: npm run init-admin [email] [password]');
console.log('');

initAdmin();
