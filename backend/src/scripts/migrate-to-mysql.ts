import 'reflect-metadata';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { connectMySQL, connectMongoDB, disconnectDatabases } from '../config/database';
import { MySQLDataSource } from '../config/database';

// TypeORM Entities
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { Profile } from '../models/profile.model';
import { Project } from '../models/project.model';
import { BlogPost } from '../models/blogPost.model';
import { ContactMessage } from '../models/contactMessage.model';
import { Newsletter } from '../models/newsletter.model';

// Migration Error Interface
export interface MigrationError {
  phase: 'read' | 'transform' | 'write' | 'verify';
  entity: string;
  originalId: string;
  message: string;
  stack?: string;
}

// Migration Report Interface
export interface MigrationReport {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  success: boolean;
  entities: {
    [key: string]: {
      total: number;
      migrated: number;
      failed: number;
    };
  };
  errors: MigrationError[];
}

// Track migrated IDs for rollback
const migratedIds: { [entity: string]: string[] } = {
  User: [],
  RefreshToken: [],
  Profile: [],
  Project: [],
  BlogPost: [],
  ContactMessage: [],
  Newsletter: [],
};

/**
 * Rollback migration by deleting all migrated records
 */
async function rollbackMigration(report: MigrationReport): Promise<void> {
  console.log('\n🔄 Rolling back migration...');
  
  try {
    // Rollback in reverse order to respect foreign key constraints
    const entityNames = [
      'RefreshToken',
      'User',
      'Newsletter',
      'ContactMessage',
      'BlogPost',
      'Project',
      'Profile',
    ];
    
    for (const entityName of entityNames) {
      const ids = migratedIds[entityName];
      if (ids && ids.length > 0) {
        console.log(`   Rolling back ${ids.length} ${entityName} records...`);
        
        // Get the appropriate repository
        let repository;
        switch (entityName) {
          case 'User':
            repository = MySQLDataSource.getRepository(User);
            break;
          case 'RefreshToken':
            repository = MySQLDataSource.getRepository(RefreshToken);
            break;
          case 'Profile':
            repository = MySQLDataSource.getRepository(Profile);
            break;
          case 'Project':
            repository = MySQLDataSource.getRepository(Project);
            break;
          case 'BlogPost':
            repository = MySQLDataSource.getRepository(BlogPost);
            break;
          case 'ContactMessage':
            repository = MySQLDataSource.getRepository(ContactMessage);
            break;
          case 'Newsletter':
            repository = MySQLDataSource.getRepository(Newsletter);
            break;
          default:
            continue;
        }
        
        // Delete records one by one
        for (const id of ids) {
          await (repository as any).delete(id);
        }
      }
    }
    
    console.log('✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

/**
 * Generate and print migration report
 */
function printMigrationReport(report: MigrationReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION REPORT');
  console.log('='.repeat(60));
  console.log(`Start Time: ${report.startTime.toISOString()}`);
  console.log(`End Time: ${report.endTime?.toISOString() || 'N/A'}`);
  console.log(`Duration: ${report.duration ? (report.duration / 1000).toFixed(2) : 'N/A'}s`);
  console.log(`Status: ${report.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log('');
  
  console.log('Entity Statistics:');
  console.log('-'.repeat(60));
  
  for (const [entity, stats] of Object.entries(report.entities)) {
    const successRate = stats.total > 0 
      ? ((stats.migrated / stats.total) * 100).toFixed(1) 
      : '0.0';
    
    console.log(`${entity}:`);
    console.log(`  Total: ${stats.total}`);
    console.log(`  Migrated: ${stats.migrated} (${successRate}%)`);
    console.log(`  Failed: ${stats.failed}`);
  }
  
  if (report.errors.length > 0) {
    console.log('');
    console.log('Errors:');
    console.log('-'.repeat(60));
    
    for (const error of report.errors.slice(0, 10)) {
      console.log(`[${error.phase}] ${error.entity} (ID: ${error.originalId})`);
      console.log(`  ${error.message}`);
      if (error.stack) {
        console.log(`  ${error.stack.split('\n')[0]}`);
      }
    }
    
    if (report.errors.length > 10) {
      console.log(`... and ${report.errors.length - 10} more errors`);
    }
  }
  
  console.log('='.repeat(60));
}

// ID Mapping to track ObjectId -> UUID conversions
const idMapping = new Map<string, string>();

/**
 * Convert MongoDB ObjectId to UUID
 * Maintains consistent mapping for the same ObjectId
 */
export function objectIdToUUID(objectId: string | mongoose.Types.ObjectId): string {
  const idStr = objectId.toString();
  
  if (idMapping.has(idStr)) {
    return idMapping.get(idStr)!;
  }
  
  const uuid = uuidv4();
  idMapping.set(idStr, uuid);
  return uuid;
}

/**
 * Read data from MongoDB collection
 */
async function readMongoDBData<T>(
  collectionName: string,
  filter: Record<string, unknown> = {}
): Promise<T[]> {
  try {
    const collection = mongoose.connection.collection(collectionName);
    const data = await collection.find(filter).toArray();
    return data as T[];
  } catch (error) {
    console.error(`❌ Error reading from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Transform MongoDB document to TypeORM entity format
 * Converts ObjectId to UUID and adjusts field names
 */
export function transformDocument<T extends Record<string, any>>(
  doc: any,
  entityName: string
): Partial<T> {
  const transformed: any = {};
  
  // Convert _id to UUID
  if (doc._id) {
    transformed.id = objectIdToUUID(doc._id);
  }
  
  // Copy all other fields
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') continue;
    if (key === '__v') continue;
    
    // Handle Date fields
    if (value instanceof Date) {
      transformed[key] = value;
    }
    // Handle nested objects and arrays
    else if (typeof value === 'object' && value !== null) {
      transformed[key] = value;
    }
    // Handle primitive values
    else {
      transformed[key] = value;
    }
  }
  
  return transformed as Partial<T>;
}

/**
 * Migrate User entities from MongoDB to MySQL
 */
async function migrateUsers(report: MigrationReport): Promise<void> {
  console.log('👤 Migrating Users...');
  
  report.entities['User'] = { total: 0, migrated: 0, failed: 0 };
  
  try {
    // Read users from MongoDB
    const mongoUsers = await readMongoDBData<any>('users');
    report.entities['User'].total = mongoUsers.length;
    
    console.log(`   Found ${mongoUsers.length} users in MongoDB`);
    
    const userRepository = MySQLDataSource.getRepository(User);
    
    for (const mongoUser of mongoUsers) {
      try {
        // Transform MongoDB document to TypeORM entity
        const userData = transformDocument<User>(mongoUser, 'User');
        
        // Preserve password hash (don't re-hash)
        if (mongoUser.password) {
          userData.password = mongoUser.password;
        }
        
        // Preserve timestamps
        if (mongoUser.createdAt) {
          userData.createdAt = new Date(mongoUser.createdAt);
        }
        if (mongoUser.updatedAt) {
          userData.updatedAt = new Date(mongoUser.updatedAt);
        }
        
        // Create user entity without triggering password hashing
        const user = userRepository.create(userData);
        
        // Save without running BeforeInsert/BeforeUpdate hooks that would re-hash password
        await userRepository.save(user, { reload: false });
        
        // Track migrated ID for potential rollback
        migratedIds['User'].push(user.id);
        
        report.entities['User'].migrated++;
      } catch (error) {
        report.entities['User'].failed++;
        report.errors.push({
          phase: 'write',
          entity: 'User',
          originalId: mongoUser._id.toString(),
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
    
    console.log(`   ✅ Migrated ${report.entities['User'].migrated}/${report.entities['User'].total} users`);
  } catch (error) {
    console.error('   ❌ Error migrating users:', error);
    throw error;
  }
}

/**
 * Migrate Profile entities from MongoDB to MySQL
 */
async function migrateProfiles(report: MigrationReport): Promise<void> {
  console.log('👨‍💼 Migrating Profiles...');
  
  report.entities['Profile'] = { total: 0, migrated: 0, failed: 0 };
  
  try {
    const mongoProfiles = await readMongoDBData<any>('profiles');
    report.entities['Profile'].total = mongoProfiles.length;
    
    console.log(`   Found ${mongoProfiles.length} profiles in MongoDB`);
    
    const profileRepository = MySQLDataSource.getRepository(Profile);
    
    for (const mongoProfile of mongoProfiles) {
      try {
        const profileData = transformDocument<Profile>(mongoProfile, 'Profile');
        
        // Preserve timestamps
        if (mongoProfile.createdAt) {
          profileData.createdAt = new Date(mongoProfile.createdAt);
        }
        if (mongoProfile.updatedAt) {
          profileData.updatedAt = new Date(mongoProfile.updatedAt);
        }
        
        const profile = profileRepository.create(profileData);
        await profileRepository.save(profile);
        
        // Track migrated ID for potential rollback
        migratedIds['Profile'].push(profile.id);
        
        report.entities['Profile'].migrated++;
      } catch (error) {
        report.entities['Profile'].failed++;
        report.errors.push({
          phase: 'write',
          entity: 'Profile',
          originalId: mongoProfile._id.toString(),
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
    
    console.log(`   ✅ Migrated ${report.entities['Profile'].migrated}/${report.entities['Profile'].total} profiles`);
  } catch (error) {
    console.error('   ❌ Error migrating profiles:', error);
    throw error;
  }
}

/**
 * Migrate Project entities from MongoDB to MySQL
 */
async function migrateProjects(report: MigrationReport): Promise<void> {
  console.log('📁 Migrating Projects...');
  
  report.entities['Project'] = { total: 0, migrated: 0, failed: 0 };
  
  try {
    const mongoProjects = await readMongoDBData<any>('projects');
    report.entities['Project'].total = mongoProjects.length;
    
    console.log(`   Found ${mongoProjects.length} projects in MongoDB`);
    
    const projectRepository = MySQLDataSource.getRepository(Project);
    
    for (const mongoProject of mongoProjects) {
      try {
        const projectData = transformDocument<Project>(mongoProject, 'Project');
        
        // Preserve timestamps
        if (mongoProject.createdAt) {
          projectData.createdAt = new Date(mongoProject.createdAt);
        }
        if (mongoProject.updatedAt) {
          projectData.updatedAt = new Date(mongoProject.updatedAt);
        }
        
        const project = projectRepository.create(projectData);
        await projectRepository.save(project);
        
        // Track migrated ID for potential rollback
        migratedIds['Project'].push(project.id);
        
        report.entities['Project'].migrated++;
      } catch (error) {
        report.entities['Project'].failed++;
        report.errors.push({
          phase: 'write',
          entity: 'Project',
          originalId: mongoProject._id.toString(),
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
    
    console.log(`   ✅ Migrated ${report.entities['Project'].migrated}/${report.entities['Project'].total} projects`);
  } catch (error) {
    console.error('   ❌ Error migrating projects:', error);
    throw error;
  }
}

/**
 * Migrate BlogPost entities from MongoDB to MySQL
 */
async function migrateBlogPosts(report: MigrationReport): Promise<void> {
  console.log('📝 Migrating BlogPosts...');
  
  report.entities['BlogPost'] = { total: 0, migrated: 0, failed: 0 };
  
  try {
    const mongoPosts = await readMongoDBData<any>('blogposts');
    report.entities['BlogPost'].total = mongoPosts.length;
    
    console.log(`   Found ${mongoPosts.length} blog posts in MongoDB`);
    
    const blogRepository = MySQLDataSource.getRepository(BlogPost);
    
    for (const mongoPost of mongoPosts) {
      try {
        const postData = transformDocument<BlogPost>(mongoPost, 'BlogPost');
        
        // Preserve timestamps
        if (mongoPost.createdAt) {
          postData.createdAt = new Date(mongoPost.createdAt);
        }
        if (mongoPost.updatedAt) {
          postData.updatedAt = new Date(mongoPost.updatedAt);
        }
        if (mongoPost.publishedAt) {
          postData.publishedAt = new Date(mongoPost.publishedAt);
        }
        
        const post = blogRepository.create(postData);
        await blogRepository.save(post);
        
        // Track migrated ID for potential rollback
        migratedIds['BlogPost'].push(post.id);
        
        report.entities['BlogPost'].migrated++;
      } catch (error) {
        report.entities['BlogPost'].failed++;
        report.errors.push({
          phase: 'write',
          entity: 'BlogPost',
          originalId: mongoPost._id.toString(),
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
    
    console.log(`   ✅ Migrated ${report.entities['BlogPost'].migrated}/${report.entities['BlogPost'].total} blog posts`);
  } catch (error) {
    console.error('   ❌ Error migrating blog posts:', error);
    throw error;
  }
}

/**
 * Migrate ContactMessage entities from MongoDB to MySQL
 */
async function migrateContactMessages(report: MigrationReport): Promise<void> {
  console.log('📧 Migrating ContactMessages...');
  
  report.entities['ContactMessage'] = { total: 0, migrated: 0, failed: 0 };
  
  try {
    const mongoMessages = await readMongoDBData<any>('contactmessages');
    report.entities['ContactMessage'].total = mongoMessages.length;
    
    console.log(`   Found ${mongoMessages.length} contact messages in MongoDB`);
    
    const messageRepository = MySQLDataSource.getRepository(ContactMessage);
    
    for (const mongoMessage of mongoMessages) {
      try {
        const messageData = transformDocument<ContactMessage>(mongoMessage, 'ContactMessage');
        
        // Preserve timestamps
        if (mongoMessage.createdAt) {
          messageData.createdAt = new Date(mongoMessage.createdAt);
        }
        if (mongoMessage.updatedAt) {
          messageData.updatedAt = new Date(mongoMessage.updatedAt);
        }
        
        const message = messageRepository.create(messageData);
        await messageRepository.save(message);
        
        // Track migrated ID for potential rollback
        migratedIds['ContactMessage'].push(message.id);
        
        report.entities['ContactMessage'].migrated++;
      } catch (error) {
        report.entities['ContactMessage'].failed++;
        report.errors.push({
          phase: 'write',
          entity: 'ContactMessage',
          originalId: mongoMessage._id.toString(),
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
    
    console.log(`   ✅ Migrated ${report.entities['ContactMessage'].migrated}/${report.entities['ContactMessage'].total} contact messages`);
  } catch (error) {
    console.error('   ❌ Error migrating contact messages:', error);
    throw error;
  }
}

/**
 * Migrate Newsletter entities from MongoDB to MySQL
 */
async function migrateNewsletters(report: MigrationReport): Promise<void> {
  console.log('📰 Migrating Newsletters...');
  
  report.entities['Newsletter'] = { total: 0, migrated: 0, failed: 0 };
  
  try {
    const mongoNewsletters = await readMongoDBData<any>('newsletters');
    report.entities['Newsletter'].total = mongoNewsletters.length;
    
    console.log(`   Found ${mongoNewsletters.length} newsletter subscriptions in MongoDB`);
    
    const newsletterRepository = MySQLDataSource.getRepository(Newsletter);
    
    for (const mongoNewsletter of mongoNewsletters) {
      try {
        const newsletterData = transformDocument<Newsletter>(mongoNewsletter, 'Newsletter');
        
        // Preserve timestamps
        if (mongoNewsletter.createdAt) {
          newsletterData.createdAt = new Date(mongoNewsletter.createdAt);
        }
        if (mongoNewsletter.updatedAt) {
          newsletterData.updatedAt = new Date(mongoNewsletter.updatedAt);
        }
        if (mongoNewsletter.subscribedAt) {
          newsletterData.subscribedAt = new Date(mongoNewsletter.subscribedAt);
        }
        if (mongoNewsletter.unsubscribedAt) {
          newsletterData.unsubscribedAt = new Date(mongoNewsletter.unsubscribedAt);
        }
        
        const newsletter = newsletterRepository.create(newsletterData);
        await newsletterRepository.save(newsletter);
        
        // Track migrated ID for potential rollback
        migratedIds['Newsletter'].push(newsletter.id);
        
        report.entities['Newsletter'].migrated++;
      } catch (error) {
        report.entities['Newsletter'].failed++;
        report.errors.push({
          phase: 'write',
          entity: 'Newsletter',
          originalId: mongoNewsletter._id.toString(),
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
    
    console.log(`   ✅ Migrated ${report.entities['Newsletter'].migrated}/${report.entities['Newsletter'].total} newsletter subscriptions`);
  } catch (error) {
    console.error('   ❌ Error migrating newsletters:', error);
    throw error;
  }
}

/**
 * Migrate RefreshToken entities from MongoDB to MySQL
 */
async function migrateRefreshTokens(report: MigrationReport): Promise<void> {
  console.log('🔑 Migrating RefreshTokens...');
  
  report.entities['RefreshToken'] = { total: 0, migrated: 0, failed: 0 };
  
  try {
    // Read refresh tokens from MongoDB
    const mongoTokens = await readMongoDBData<any>('refreshtokens');
    report.entities['RefreshToken'].total = mongoTokens.length;
    
    console.log(`   Found ${mongoTokens.length} refresh tokens in MongoDB`);
    
    const tokenRepository = MySQLDataSource.getRepository(RefreshToken);
    
    for (const mongoToken of mongoTokens) {
      try {
        // Transform MongoDB document to TypeORM entity
        const tokenData = transformDocument<RefreshToken>(mongoToken, 'RefreshToken');
        
        // Convert userId reference from ObjectId to UUID
        if (mongoToken.user || mongoToken.userId) {
          const userObjectId = mongoToken.user || mongoToken.userId;
          tokenData.userId = objectIdToUUID(userObjectId);
        }
        
        // Preserve timestamps
        if (mongoToken.createdAt) {
          tokenData.createdAt = new Date(mongoToken.createdAt);
        }
        if (mongoToken.expiresAt) {
          tokenData.expiresAt = new Date(mongoToken.expiresAt);
        }
        
        // Create and save token
        const token = tokenRepository.create(tokenData);
        await tokenRepository.save(token);
        
        // Track migrated ID for potential rollback
        migratedIds['RefreshToken'].push(token.id);
        
        report.entities['RefreshToken'].migrated++;
      } catch (error) {
        report.entities['RefreshToken'].failed++;
        report.errors.push({
          phase: 'write',
          entity: 'RefreshToken',
          originalId: mongoToken._id.toString(),
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
    
    console.log(`   ✅ Migrated ${report.entities['RefreshToken'].migrated}/${report.entities['RefreshToken'].total} refresh tokens`);
  } catch (error) {
    console.error('   ❌ Error migrating refresh tokens:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
export async function migrateToMySQL(): Promise<MigrationReport> {
  const report: MigrationReport = {
    startTime: new Date(),
    success: false,
    entities: {},
    errors: [],
  };
  
  console.log('🚀 Starting migration from MongoDB to MySQL...\n');
  
  try {
    // Connect to both databases
    await connectMySQL();
    await connectMongoDB();
    
    console.log('✅ Connected to both databases\n');
    
    // Migrate users first (required for foreign key relationships)
    await migrateUsers(report);
    
    // Migrate refresh tokens (depends on users)
    await migrateRefreshTokens(report);
    
    // Migrate other entities (no dependencies)
    await migrateProfiles(report);
    await migrateProjects(report);
    await migrateBlogPosts(report);
    await migrateContactMessages(report);
    await migrateNewsletters(report);
    
    // Check if there were any errors
    const totalFailed = Object.values(report.entities).reduce(
      (sum, entity) => sum + entity.failed,
      0
    );
    
    if (totalFailed > 0) {
      console.log(`\n⚠️  Migration completed with ${totalFailed} errors`);
      report.success = false;
    } else {
      console.log('\n✅ All entities migrated successfully!');
      report.success = true;
    }
  } catch (error) {
    console.error('\n❌ Migration failed with critical error:', error);
    report.success = false;
    report.errors.push({
      phase: 'read',
      entity: 'general',
      originalId: 'N/A',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Attempt rollback on critical failure
    try {
      await rollbackMigration(report);
    } catch (rollbackError) {
      console.error('❌ Rollback also failed:', rollbackError);
    }
  } finally {
    report.endTime = new Date();
    report.duration = report.endTime.getTime() - report.startTime.getTime();
    
    // Print detailed report
    printMigrationReport(report);
    
    // Disconnect from databases
    await disconnectDatabases();
  }
  
  return report;
}

// Run migration if executed directly
if (require.main === module) {
  migrateToMySQL()
    .then((report) => {
      if (report.success) {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Migration failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}
