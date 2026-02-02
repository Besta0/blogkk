/**
 * Upload API Integration Tests
 * Tests file upload and deletion endpoints
 */

import request from 'supertest';
import { connectDatabases, disconnectDatabases, MySQLDataSource } from '../config/database';
import app from '../app';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import * as cloudinaryModule from '../config/cloudinary';

// Mock Cloudinary module
jest.mock('../config/cloudinary', () => ({
  isCloudinaryConfigured: jest.fn(),
  uploadToCloudinary: jest.fn(),
  deleteFromCloudinary: jest.fn(),
  uploadOptions: {
    profile: { folder: 'portfolio/profiles' },
    project: { folder: 'portfolio/projects' },
    blog: { folder: 'portfolio/blog' },
    general: { folder: 'portfolio/general' },
  },
}));

const mockedCloudinary = cloudinaryModule as jest.Mocked<typeof cloudinaryModule>;

describe('Upload API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await connectDatabases();

    const userRepo = MySQLDataSource.getRepository(User);
    
    // Create admin user
    const adminUser = userRepo.create({
      email: 'admin@test.com',
      password: 'AdminPass123!',
      role: 'admin',
    });
    await userRepo.save(adminUser);

    // Create regular user
    const regularUser = userRepo.create({
      email: 'user@test.com',
      password: 'UserPass123!',
      role: 'user',
    });
    await userRepo.save(regularUser);

    // Generate tokens
    adminToken = AuthService.generateAccessToken(adminUser);
    userToken = AuthService.generateAccessToken(regularUser);
  });

  afterAll(async () => {
    await disconnectDatabases();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/upload/status', () => {
    it('should return upload service status when configured', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);

      const response = await request(app)
        .get('/api/upload/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.configured).toBe(true);
      expect(response.body.data.maxFileSize).toBe(5 * 1024 * 1024);
      expect(response.body.data.allowedTypes).toContain('image/jpeg');
      expect(response.body.data.maxFiles).toBe(10);
    });

    it('should return not configured status when Cloudinary is not set up', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(false);

      const response = await request(app)
        .get('/api/upload/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.configured).toBe(false);
    });
  });

  describe('POST /api/upload/image', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 503 when Cloudinary is not configured', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(false);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CLOUDINARY_NOT_CONFIGURED');
    });

    it('should upload image successfully', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
      mockedCloudinary.uploadToCloudinary.mockResolvedValue({
        url: 'http://cloudinary.com/test.jpg',
        secureUrl: 'https://cloudinary.com/test.jpg',
        publicId: 'portfolio/general/test123',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 12345,
      });

      // Create a small valid JPEG buffer
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9
      ]);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', jpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBe('https://cloudinary.com/test.jpg');
      expect(response.body.data.publicId).toBe('portfolio/general/test123');
      expect(response.body.data.width).toBe(800);
      expect(response.body.data.height).toBe(600);
    });

    it('should reject invalid file types', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', Buffer.from('fake text data'), { filename: 'test.txt', contentType: 'text/plain' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('should return 400 when no file is uploaded', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_FILE_UPLOADED');
    });
  });

  describe('POST /api/upload/profile', () => {
    it('should upload profile image with correct type', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
      mockedCloudinary.uploadToCloudinary.mockResolvedValue({
        url: 'http://cloudinary.com/profile.jpg',
        secureUrl: 'https://cloudinary.com/profile.jpg',
        publicId: 'portfolio/profiles/avatar123',
        width: 400,
        height: 400,
        format: 'jpg',
        bytes: 8000,
      });

      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9
      ]);

      const response = await request(app)
        .post('/api/upload/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', jpegBuffer, { filename: 'avatar.jpg', contentType: 'image/jpeg' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.publicId).toContain('profiles');
      expect(mockedCloudinary.uploadToCloudinary).toHaveBeenCalledWith(
        expect.any(Buffer),
        'profile'
      );
    });
  });

  describe('POST /api/upload/project', () => {
    it('should upload project image with correct type', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
      mockedCloudinary.uploadToCloudinary.mockResolvedValue({
        url: 'http://cloudinary.com/project.jpg',
        secureUrl: 'https://cloudinary.com/project.jpg',
        publicId: 'portfolio/projects/proj123',
        width: 1200,
        height: 800,
        format: 'jpg',
        bytes: 50000,
      });

      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9
      ]);

      const response = await request(app)
        .post('/api/upload/project')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', jpegBuffer, { filename: 'project.jpg', contentType: 'image/jpeg' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockedCloudinary.uploadToCloudinary).toHaveBeenCalledWith(
        expect.any(Buffer),
        'project'
      );
    });
  });

  describe('POST /api/upload/images', () => {
    it('should upload multiple images successfully', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
      mockedCloudinary.uploadToCloudinary
        .mockResolvedValueOnce({
          url: 'http://cloudinary.com/img1.jpg',
          secureUrl: 'https://cloudinary.com/img1.jpg',
          publicId: 'portfolio/general/img1',
          width: 800,
          height: 600,
          format: 'jpg',
          bytes: 10000,
        })
        .mockResolvedValueOnce({
          url: 'http://cloudinary.com/img2.jpg',
          secureUrl: 'https://cloudinary.com/img2.jpg',
          publicId: 'portfolio/general/img2',
          width: 800,
          height: 600,
          format: 'jpg',
          bytes: 12000,
        });

      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9
      ]);

      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', jpegBuffer, { filename: 'img1.jpg', contentType: 'image/jpeg' })
        .attach('images', jpegBuffer, { filename: 'img2.jpg', contentType: 'image/jpeg' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
    });

    it('should return 400 when no files are uploaded', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);

      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_FILES_UPLOADED');
    });
  });

  describe('DELETE /api/upload/image/:publicId', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/upload/image/test123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .delete('/api/upload/image/test123')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should delete image successfully', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
      mockedCloudinary.deleteFromCloudinary.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/upload/image/test123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Image deleted successfully');
      expect(response.body.data.publicId).toBe('test123');
      expect(mockedCloudinary.deleteFromCloudinary).toHaveBeenCalledWith('test123');
    });

    it('should handle URL-encoded public IDs with slashes', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
      mockedCloudinary.deleteFromCloudinary.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/upload/image/portfolio%2Fgeneral%2Ftest123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockedCloudinary.deleteFromCloudinary).toHaveBeenCalledWith('portfolio/general/test123');
    });

    it('should return 404 when image not found', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
      mockedCloudinary.deleteFromCloudinary.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/upload/image/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DELETE_FAILED');
    });

    it('should return 503 when Cloudinary is not configured', async () => {
      mockedCloudinary.isCloudinaryConfigured.mockReturnValue(false);

      const response = await request(app)
        .delete('/api/upload/image/test123')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CLOUDINARY_NOT_CONFIGURED');
    });
  });
});

console.log('✅ Upload integration tests defined successfully');
