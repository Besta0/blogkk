/**
 * File Upload Property-Based Tests
 * **Feature: dynamic-portfolio-upgrade, Property 3: 文件上传存储一致性**
 * **Validates: Requirements 2.5**
 * 
 * Property 3: For any valid image file upload, File_Storage should successfully
 * store the file and return an accessible URL.
 */

import * as fc from 'fast-check';
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

describe('Property 3: File Upload Storage Consistency', () => {
  let adminToken: string;

  beforeAll(async () => {
    await connectDatabases();

    const userRepo = MySQLDataSource.getRepository(User);
    const adminUser = userRepo.create({
      email: 'admin@test.com',
      password: 'AdminPass123!',
      role: 'admin',
    });
    await userRepo.save(adminUser);

    adminToken = AuthService.generateAccessToken(adminUser);
  });

  afterAll(async () => {
    await disconnectDatabases();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCloudinary.isCloudinaryConfigured.mockReturnValue(true);
  });

  /**
   * Helper to create a valid JPEG buffer header
   * JPEG files start with FF D8 FF and end with FF D9
   */
  const createValidJpegBuffer = (size: number): Buffer => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const jpegFooter = Buffer.from([0xff, 0xd9]);
    const padding = Buffer.alloc(Math.max(0, size - jpegHeader.length - jpegFooter.length), 0x00);
    return Buffer.concat([jpegHeader, padding, jpegFooter]);
  };

  /**
   * Arbitrary for valid upload types
   */
  const uploadTypeArb = fc.constantFrom('profile', 'project', 'blog', 'general');

  /**
   * Arbitrary for valid image dimensions
   */
  const dimensionsArb = fc.record({
    width: fc.integer({ min: 1, max: 4096 }),
    height: fc.integer({ min: 1, max: 4096 }),
  });

  /**
   * Arbitrary for valid file sizes (in bytes, up to 5MB limit)
   */
  const fileSizeArb = fc.integer({ min: 100, max: 5 * 1024 * 1024 });

  /**
   * Arbitrary for valid image formats
   */
  const formatArb = fc.constantFrom('jpg', 'jpeg', 'png', 'webp', 'gif');

  /**
   * Arbitrary for valid public IDs
   */
  const publicIdArb = fc.stringMatching(/^[a-zA-Z0-9_/-]{1,100}$/);

  /**
   * Property 3.1: For any valid image upload, the response should contain a valid URL
   * 
   * This property verifies that when a valid image is uploaded:
   * - The response is successful (status 201)
   * - The response contains a valid HTTPS URL
   * - The response contains the publicId for future reference
   */
  it('should return valid URL for any valid image upload', async () => {
    await fc.assert(
      fc.asyncProperty(
        dimensionsArb,
        fileSizeArb,
        formatArb,
        publicIdArb,
        async ({ width, height }, bytes, format, publicId) => {
          // Setup mock to return consistent response based on input
          mockedCloudinary.uploadToCloudinary.mockResolvedValue({
            url: `http://cloudinary.com/${publicId}.${format}`,
            secureUrl: `https://cloudinary.com/${publicId}.${format}`,
            publicId: `portfolio/general/${publicId}`,
            width,
            height,
            format,
            bytes,
          });

          const jpegBuffer = createValidJpegBuffer(Math.min(bytes, 1000));

          const response = await request(app)
            .post('/api/upload/image')
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('image', jpegBuffer, { filename: `test.${format}`, contentType: `image/${format === 'jpg' ? 'jpeg' : format}` });

          // Property: Response should be successful
          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);

          // Property: Response should contain valid HTTPS URL
          expect(response.body.data.url).toMatch(/^https:\/\//);

          // Property: Response should contain publicId
          expect(response.body.data.publicId).toBeDefined();
          expect(typeof response.body.data.publicId).toBe('string');

          // Property: Response should contain dimensions
          expect(response.body.data.width).toBe(width);
          expect(response.body.data.height).toBe(height);

          // Property: Response should contain format
          expect(response.body.data.format).toBe(format);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.2: Upload response structure consistency
   * 
   * For any successful upload, the response structure should be consistent
   * and contain all required fields.
   */
  it('should maintain consistent response structure for all uploads', async () => {
    await fc.assert(
      fc.asyncProperty(
        uploadTypeArb,
        dimensionsArb,
        async (uploadType, { width, height }) => {
          const publicId = `portfolio/${uploadType}/test_${Date.now()}`;
          
          mockedCloudinary.uploadToCloudinary.mockResolvedValue({
            url: `http://cloudinary.com/${publicId}.jpg`,
            secureUrl: `https://cloudinary.com/${publicId}.jpg`,
            publicId,
            width,
            height,
            format: 'jpg',
            bytes: 12345,
          });

          const jpegBuffer = createValidJpegBuffer(100);
          
          // Map upload type to endpoint
          const endpoint = uploadType === 'general' ? '/api/upload/image' : `/api/upload/${uploadType}`;

          const response = await request(app)
            .post(endpoint)
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('image', jpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

          // Property: All successful uploads have consistent structure
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('success', true);
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('url');
          expect(response.body.data).toHaveProperty('publicId');
          expect(response.body.data).toHaveProperty('width');
          expect(response.body.data).toHaveProperty('height');
          expect(response.body.data).toHaveProperty('format');
          expect(response.body.data).toHaveProperty('bytes');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.3: Delete operation consistency
   * 
   * For any valid publicId, delete operation should return consistent response.
   */
  it('should handle delete operations consistently for any valid publicId', async () => {
    await fc.assert(
      fc.asyncProperty(
        publicIdArb,
        async (publicId) => {
          mockedCloudinary.deleteFromCloudinary.mockResolvedValue(true);

          const response = await request(app)
            .delete(`/api/upload/image/${encodeURIComponent(publicId)}`)
            .set('Authorization', `Bearer ${adminToken}`);

          // Property: Successful delete returns consistent structure
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('message');
          expect(response.body.data).toHaveProperty('publicId');
          
          // Property: Returned publicId matches the requested one
          expect(response.body.data.publicId).toBe(publicId);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.4: Upload-Delete round-trip consistency
   * 
   * For any uploaded file, the publicId returned can be used to delete it.
   */
  it('should support upload-delete round-trip for any valid image', async () => {
    await fc.assert(
      fc.asyncProperty(
        dimensionsArb,
        publicIdArb,
        async ({ width, height }, basePublicId) => {
          const publicId = `portfolio/general/${basePublicId}`;
          
          // Setup upload mock
          mockedCloudinary.uploadToCloudinary.mockResolvedValue({
            url: `http://cloudinary.com/${publicId}.jpg`,
            secureUrl: `https://cloudinary.com/${publicId}.jpg`,
            publicId,
            width,
            height,
            format: 'jpg',
            bytes: 12345,
          });

          // Setup delete mock
          mockedCloudinary.deleteFromCloudinary.mockResolvedValue(true);

          const jpegBuffer = createValidJpegBuffer(100);

          // Upload
          const uploadResponse = await request(app)
            .post('/api/upload/image')
            .set('Authorization', `Bearer ${adminToken}`)
            .attach('image', jpegBuffer, { filename: 'test.jpg', contentType: 'image/jpeg' });

          expect(uploadResponse.status).toBe(201);
          const uploadedPublicId = uploadResponse.body.data.publicId;

          // Delete using the returned publicId
          const deleteResponse = await request(app)
            .delete(`/api/upload/image/${encodeURIComponent(uploadedPublicId)}`)
            .set('Authorization', `Bearer ${adminToken}`);

          // Property: Round-trip should succeed
          expect(deleteResponse.status).toBe(200);
          expect(deleteResponse.body.success).toBe(true);
          
          // Property: Delete should be called with the correct publicId
          expect(mockedCloudinary.deleteFromCloudinary).toHaveBeenCalledWith(uploadedPublicId);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.5: Multiple file upload consistency
   * 
   * For any number of valid files (1-10), all should be uploaded successfully.
   */
  it('should handle multiple file uploads consistently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (fileCount) => {
          // Setup mock to return unique results for each file
          for (let i = 0; i < fileCount; i++) {
            mockedCloudinary.uploadToCloudinary.mockResolvedValueOnce({
              url: `http://cloudinary.com/img${i}.jpg`,
              secureUrl: `https://cloudinary.com/img${i}.jpg`,
              publicId: `portfolio/general/img${i}`,
              width: 800,
              height: 600,
              format: 'jpg',
              bytes: 10000 + i * 1000,
            });
          }

          const jpegBuffer = createValidJpegBuffer(100);

          let req = request(app)
            .post('/api/upload/images')
            .set('Authorization', `Bearer ${adminToken}`);

          // Attach multiple files
          for (let i = 0; i < fileCount; i++) {
            req = req.attach('images', jpegBuffer, { filename: `img${i}.jpg`, contentType: 'image/jpeg' });
          }

          const response = await req;

          // Property: Response should be successful
          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);

          // Property: All files should be in the response
          expect(response.body.data.images).toHaveLength(fileCount);
          expect(response.body.data.count).toBe(fileCount);

          // Property: Each uploaded file should have required fields
          response.body.data.images.forEach((img: { url: string; publicId: string; width: number; height: number }) => {
            expect(img).toHaveProperty('url');
            expect(img).toHaveProperty('publicId');
            expect(img).toHaveProperty('width');
            expect(img).toHaveProperty('height');
            expect(img.url).toMatch(/^https:\/\//);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

console.log('✅ File upload property-based tests defined successfully');
