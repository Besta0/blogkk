import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';
import { User, BlogPost } from '../models';
import { AuthService } from '../services';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let userToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create admin user
  const adminUser = await User.create({
    email: 'admin@test.com',
    password: 'hashedpassword',
    role: 'admin',
  });
  adminToken = AuthService.generateAccessToken(adminUser);

  // Create regular user
  const regularUser = await User.create({
    email: 'user@test.com',
    password: 'hashedpassword',
    role: 'user',
  });
  userToken = AuthService.generateAccessToken(regularUser);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await BlogPost.deleteMany({});
});

describe('Blog API Integration Tests', () => {
  describe('POST /api/blog/posts', () => {
    it('should create a blog post when admin provides valid data', async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post. It needs to be at least 10 characters.',
        excerpt: 'This is a short excerpt for the blog post.',
        tags: ['test', 'blog'],
        published: false,
      };

      const response = await request(app)
        .post('/api/blog/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(postData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.slug).toBe('test-blog-post');
      expect(response.body.data.content).toBe(postData.content);
      expect(response.body.data.excerpt).toBe(postData.excerpt);
      expect(response.body.data.tags).toEqual(postData.tags);
      expect(response.body.data.published).toBe(false);
      expect(response.body.data.readTime).toBeGreaterThanOrEqual(1);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/blog/posts')
        .send({ title: 'Test', content: 'Test content', excerpt: 'Test excerpt' });

      expect(response.status).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post('/api/blog/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test', content: 'Test content', excerpt: 'Test excerpt' });

      expect(response.status).toBe(403);
    });

    it('should reject when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/blog/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test' });

      expect(response.status).toBe(422);
    });

    it('should generate unique slugs for duplicate titles', async () => {
      const postData = {
        title: 'Duplicate Title',
        content: 'This is the content of the first blog post.',
        excerpt: 'First excerpt here.',
      };

      // Create first post
      await request(app)
        .post('/api/blog/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(postData);

      // Create second post with same title
      const response = await request(app)
        .post('/api/blog/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(postData);

      expect(response.status).toBe(201);
      expect(response.body.data.slug).toBe('duplicate-title-1');
    });
  });

  describe('GET /api/blog/posts/published', () => {
    beforeEach(async () => {
      // Create some test posts
      await BlogPost.create([
        {
          title: 'Published Post 1',
          slug: 'published-post-1',
          content: 'Content for published post 1',
          excerpt: 'Excerpt for published post 1',
          tags: ['tag1'],
          published: true,
          publishedAt: new Date(),
        },
        {
          title: 'Published Post 2',
          slug: 'published-post-2',
          content: 'Content for published post 2',
          excerpt: 'Excerpt for published post 2',
          tags: ['tag2'],
          published: true,
          publishedAt: new Date(),
        },
        {
          title: 'Draft Post',
          slug: 'draft-post',
          content: 'Content for draft post',
          excerpt: 'Excerpt for draft post',
          tags: ['draft'],
          published: false,
        },
      ]);
    });

    it('should return only published posts', async () => {
      const response = await request(app).get('/api/blog/posts/published');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(2);
      expect(response.body.data.posts.every((p: { published: boolean }) => p.published)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by tag', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ tag: 'tag1' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].tags).toContain('tag1');
    });

    it('should search posts by title', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ search: 'Post 1' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].title).toBe('Published Post 1');
    });

    it('should search posts by excerpt', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ search: 'Excerpt for published post 2' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].title).toBe('Published Post 2');
    });

    it('should search posts case-insensitively', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ search: 'PUBLISHED' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(2);
    });

    it('should combine search and tag filters', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ search: 'Published', tag: 'tag1' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.posts[0].tags).toContain('tag1');
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ search: 'nonexistent query xyz' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should support sorting by different fields', async () => {
      const response = await request(app)
        .get('/api/blog/posts/published')
        .query({ sortBy: 'title', sortOrder: 'asc' });

      expect(response.status).toBe(200);
      expect(response.body.data.posts[0].title).toBe('Published Post 1');
    });
  });

  describe('GET /api/blog/posts/slug/:slug', () => {
    it('should return published post by slug', async () => {
      await BlogPost.create({
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content here',
        excerpt: 'Test excerpt here',
        published: true,
        publishedAt: new Date(),
      });

      const response = await request(app).get('/api/blog/posts/slug/test-post');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('test-post');
    });

    it('should return 404 for unpublished post', async () => {
      await BlogPost.create({
        title: 'Draft Post',
        slug: 'draft-post',
        content: 'Draft content here',
        excerpt: 'Draft excerpt here',
        published: false,
      });

      const response = await request(app).get('/api/blog/posts/slug/draft-post');

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app).get('/api/blog/posts/slug/non-existent');

      expect(response.status).toBe(404);
    });

    it('should increment views when accessing post', async () => {
      await BlogPost.create({
        title: 'View Test',
        slug: 'view-test',
        content: 'Content for view test',
        excerpt: 'Excerpt for view test',
        published: true,
        publishedAt: new Date(),
        views: 0,
      });

      const response = await request(app).get('/api/blog/posts/slug/view-test');

      expect(response.status).toBe(200);
      expect(response.body.data.views).toBe(1);
    });
  });

  describe('PUT /api/blog/posts/:id', () => {
    it('should update blog post', async () => {
      const post = await BlogPost.create({
        title: 'Original Title',
        slug: 'original-title',
        content: 'Original content here',
        excerpt: 'Original excerpt here',
        published: false,
      });

      const response = await request(app)
        .put(`/api/blog/posts/${post._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title', published: true });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.published).toBe(true);
      expect(response.body.data.publishedAt).toBeDefined();
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/blog/posts/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/blog/posts/:id', () => {
    it('should delete blog post', async () => {
      const post = await BlogPost.create({
        title: 'To Delete',
        slug: 'to-delete',
        content: 'Content to delete',
        excerpt: 'Excerpt to delete',
      });

      const response = await request(app)
        .delete(`/api/blog/posts/${post._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deletedPost = await BlogPost.findById(post._id);
      expect(deletedPost).toBeNull();
    });
  });

  describe('GET /api/blog/tags', () => {
    beforeEach(async () => {
      await BlogPost.create([
        {
          title: 'Post 1',
          slug: 'post-1',
          content: 'This is the content for post 1 with enough characters',
          excerpt: 'This is the excerpt for post 1',
          tags: ['javascript', 'react'],
          published: true,
          publishedAt: new Date(),
        },
        {
          title: 'Post 2',
          slug: 'post-2',
          content: 'This is the content for post 2 with enough characters',
          excerpt: 'This is the excerpt for post 2',
          tags: ['typescript', 'react'],
          published: true,
          publishedAt: new Date(),
        },
      ]);
    });

    it('should return all unique tags from published posts', async () => {
      const response = await request(app).get('/api/blog/tags');

      expect(response.status).toBe(200);
      expect(response.body.data.tags).toContain('javascript');
      expect(response.body.data.tags).toContain('typescript');
      expect(response.body.data.tags).toContain('react');
    });
  });

  describe('GET /api/blog/posts/recent', () => {
    beforeEach(async () => {
      const now = new Date();
      await BlogPost.create([
        {
          title: 'Recent Post 1',
          slug: 'recent-post-1',
          content: 'This is the content for recent post 1 with enough characters',
          excerpt: 'This is the excerpt for recent post 1',
          published: true,
          publishedAt: new Date(now.getTime() - 1000),
        },
        {
          title: 'Recent Post 2',
          slug: 'recent-post-2',
          content: 'This is the content for recent post 2 with enough characters',
          excerpt: 'This is the excerpt for recent post 2',
          published: true,
          publishedAt: now,
        },
      ]);
    });

    it('should return recent published posts', async () => {
      const response = await request(app).get('/api/blog/posts/recent');

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(2);
      // Should be sorted by publishedAt descending
      expect(response.body.data.posts[0].title).toBe('Recent Post 2');
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/blog/posts/recent')
        .query({ limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.posts).toHaveLength(1);
    });
  });
});
