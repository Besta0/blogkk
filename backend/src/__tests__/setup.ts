import 'reflect-metadata';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MySQLDataSource, connectMySQL, disconnectMySQL, connectMongoDB, disconnectMongoDB } from '../config/database';
import { User, Profile, Project, BlogPost, ContactMessage, Newsletter, RefreshToken } from '../models';
import bcrypt from 'bcryptjs';

// Set test environment
process.env.NODE_ENV = 'test';

let mongoServer: MongoMemoryServer;

/**
 * Setup databases before all tests
 */
export async function setupTestDatabases(): Promise<void> {
  // Connect to SQLite (in-memory) for MySQL tests
  await connectMySQL();
  
  // Connect to MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}

/**
 * Teardown databases after all tests
 */
export async function teardownTestDatabases(): Promise<void> {
  // Disconnect from SQLite
  await disconnectMySQL();
  
  // Disconnect from MongoDB Memory Server
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Clear all MySQL tables
 */
export async function clearMySQLTables(): Promise<void> {
  if (MySQLDataSource.isInitialized) {
    const entities = MySQLDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = MySQLDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
}

/**
 * Clear all MongoDB collections
 */
export async function clearMongoDBCollections(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

/**
 * Clear all data from both databases
 */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    clearMySQLTables(),
    clearMongoDBCollections(),
  ]);
}

/**
 * Create a test user
 */
export async function createTestUser(data?: Partial<User>): Promise<User> {
  const userRepo = MySQLDataSource.getRepository(User);
  const hashedPassword = await bcrypt.hash(data?.password || 'password123', 10);
  
  const user = userRepo.create({
    email: data?.email || 'test@example.com',
    password: hashedPassword,
    role: data?.role || 'user',
    ...data,
  });
  
  return await userRepo.save(user);
}

/**
 * Create a test admin user
 */
export async function createTestAdmin(data?: Partial<User>): Promise<User> {
  return createTestUser({ ...data, role: 'admin' });
}

/**
 * Create a test profile
 */
export async function createTestProfile(data?: Partial<Profile>): Promise<Profile> {
  const profileRepo = MySQLDataSource.getRepository(Profile);
  
  const profile = profileRepo.create({
    name: data?.name || 'Test User',
    title: data?.title || 'Test Developer',
    bio: data?.bio || 'Test bio',
    avatar: data?.avatar || 'https://example.com/avatar.jpg',
    skills: data?.skills || ['JavaScript', 'TypeScript'],
    experience: data?.experience || [],
    social: data?.social || {},
    ...data,
  });
  
  return await profileRepo.save(profile);
}

/**
 * Create a test project
 */
export async function createTestProject(data?: Partial<Project>): Promise<Project> {
  const projectRepo = MySQLDataSource.getRepository(Project);
  
  const project = projectRepo.create({
    title: data?.title || 'Test Project',
    description: data?.description || 'Test description',
    technologies: data?.technologies || ['React', 'Node.js'],
    images: data?.images || [],
    featured: data?.featured ?? false,
    likes: data?.likes ?? 0,
    views: data?.views ?? 0,
    ...data,
  });
  
  return await projectRepo.save(project);
}

/**
 * Create a test blog post
 */
export async function createTestBlogPost(data?: Partial<BlogPost>): Promise<BlogPost> {
  const blogRepo = MySQLDataSource.getRepository(BlogPost);
  
  const post = blogRepo.create({
    title: data?.title || 'Test Blog Post',
    slug: data?.slug || 'test-blog-post',
    content: data?.content || 'Test content',
    excerpt: data?.excerpt || 'Test excerpt',
    tags: data?.tags || ['test'],
    published: data?.published ?? true,
    publishedAt: data?.publishedAt || new Date(),
    views: data?.views ?? 0,
    readTime: data?.readTime ?? 5,
    ...data,
  });
  
  return await blogRepo.save(post);
}

/**
 * Create a test contact message
 */
export async function createTestContactMessage(data?: Partial<ContactMessage>): Promise<ContactMessage> {
  const contactRepo = MySQLDataSource.getRepository(ContactMessage);
  
  const message = contactRepo.create({
    name: data?.name || 'Test User',
    email: data?.email || 'test@example.com',
    subject: data?.subject || 'Test Subject',
    message: data?.message || 'Test message',
    read: data?.read ?? false,
    replied: data?.replied ?? false,
    ...data,
  });
  
  return await contactRepo.save(message);
}

/**
 * Create a test newsletter subscription
 */
export async function createTestNewsletter(data?: Partial<Newsletter>): Promise<Newsletter> {
  const newsletterRepo = MySQLDataSource.getRepository(Newsletter);
  
  const newsletter = newsletterRepo.create({
    email: data?.email || 'test@example.com',
    subscribed: data?.subscribed ?? true,
    subscribedAt: data?.subscribedAt || new Date(),
    ...data,
  });
  
  return await newsletterRepo.save(newsletter);
}

/**
 * Create a test refresh token
 */
export async function createTestRefreshToken(userId: string, data?: Partial<RefreshToken>): Promise<RefreshToken> {
  const tokenRepo = MySQLDataSource.getRepository(RefreshToken);
  
  const token = tokenRepo.create({
    token: data?.token || 'test-refresh-token',
    userId,
    expiresAt: data?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: data?.revoked ?? false,
    ...data,
  });
  
  return await tokenRepo.save(token);
}

/**
 * Wait for a specified amount of time (useful for async operations)
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get database connection status
 */
export function getTestDatabaseStatus(): { mysql: boolean; mongodb: boolean } {
  return {
    mysql: MySQLDataSource.isInitialized,
    mongodb: mongoose.connection.readyState === 1,
  };
}

// Export for use in tests
export { MySQLDataSource, mongoServer };
