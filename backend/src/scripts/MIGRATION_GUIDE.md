# MongoDB to MySQL Migration Guide

This guide explains how to use the migration script to transfer data from MongoDB to MySQL.

## Overview

The `migrate-to-mysql.ts` script migrates structured data from MongoDB to MySQL while preserving:
- All data integrity
- Password hashes (no re-hashing)
- Original timestamps (createdAt, updatedAt)
- Relationships between entities

## Prerequisites

1. Both MongoDB and MySQL databases must be accessible
2. Environment variables must be configured:
   - `MONGODB_URI` - MongoDB connection string
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection details

## What Gets Migrated

The script migrates the following entities from MongoDB to MySQL:

1. **Users** - User accounts with authentication data
2. **RefreshTokens** - JWT refresh tokens (linked to users)
3. **Profiles** - User profile information
4. **Projects** - Portfolio projects
5. **BlogPosts** - Blog articles
6. **ContactMessages** - Contact form submissions
7. **Newsletters** - Newsletter subscriptions

## What Stays in MongoDB

The following data remains in MongoDB (analytics and logs):
- PageViews
- ProjectInteractions
- FileMetadata
- SystemLogs

## Running the Migration

### Using npm script:
```bash
cd backend
npm run migrate
```

### Using ts-node directly:
```bash
cd backend
npx ts-node src/scripts/migrate-to-mysql.ts
```

## Migration Process

The script follows these steps:

1. **Connect** to both databases
2. **Migrate Users** first (required for foreign keys)
3. **Migrate RefreshTokens** (depends on users)
4. **Migrate other entities** (profiles, projects, blog posts, etc.)
5. **Generate report** with statistics and errors
6. **Disconnect** from databases

## ID Conversion

MongoDB ObjectIds are converted to UUIDs:
- Consistent mapping maintained throughout migration
- Foreign key relationships preserved
- Original IDs tracked for error reporting

## Error Handling

### Partial Failures
- Individual record failures don't stop the migration
- Failed records are logged in the error report
- Successfully migrated records are preserved

### Critical Failures
- If a critical error occurs, the script attempts rollback
- All migrated records are deleted
- Original MongoDB data remains untouched

## Migration Report

After completion, you'll see a detailed report:

```
============================================================
📊 MIGRATION REPORT
============================================================
Start Time: 2024-01-28T10:30:00.000Z
End Time: 2024-01-28T10:30:15.000Z
Duration: 15.23s
Status: ✅ SUCCESS

Entity Statistics:
------------------------------------------------------------
User:
  Total: 5
  Migrated: 5 (100.0%)
  Failed: 0
RefreshToken:
  Total: 10
  Migrated: 10 (100.0%)
  Failed: 0
...
============================================================
```

## Rollback

If migration fails critically:
1. Script automatically attempts rollback
2. Deletes all migrated MySQL records
3. MongoDB data remains unchanged
4. You can safely retry the migration

## Important Notes

### Password Preservation
- Password hashes are copied as-is (not re-hashed)
- Users can log in with existing passwords after migration

### Timestamp Preservation
- All timestamps (createdAt, updatedAt, etc.) are preserved
- Data history is maintained accurately

### Data Validation
- Unique constraints are enforced (emails, slugs, etc.)
- Foreign key relationships are validated
- Invalid data will cause individual record failures

## Troubleshooting

### Connection Errors
- Verify database credentials in `.env`
- Ensure both databases are running
- Check network connectivity

### Unique Constraint Violations
- May indicate duplicate data in MongoDB
- Check error report for specific records
- Clean up duplicates before retrying

### Foreign Key Errors
- Usually indicates missing user references
- Check that all users migrated successfully
- Review error report for details

## Post-Migration

After successful migration:

1. **Verify data** in MySQL database
2. **Test application** with new database
3. **Update services** to use TypeORM repositories
4. **Keep MongoDB** for analytics data
5. **Backup** both databases

## Safety

- Original MongoDB data is **never modified**
- Migration can be run multiple times (will create duplicates)
- Always backup databases before migration
- Test in development environment first

## Support

For issues or questions:
1. Check the error report for specific failures
2. Review MongoDB and MySQL logs
3. Verify environment configuration
4. Ensure all dependencies are installed
