import request from 'supertest';
import { connectDatabases, disconnectDatabases, MySQLDataSource } from '../config/database';
import app from '../app';
import { User, PageView, ProjectInteraction, Project } from '../models';
import { AuthService } from '../services';

let adminToken: string;
let userToken: string;
let testProjectId: string;

beforeAll(async () => {
  await connectDatabases();

  const userRepo = MySQLDataSource.getRepository(User);
  const projectRepo = MySQLDataSource.getRepository(Project);

  // Create admin user
  const adminUser = userRepo.create({
    email: 'admin@test.com',
    password: 'hashedpassword',
    role: 'admin',
  });
  await userRepo.save(adminUser);
  adminToken = AuthService.generateAccessToken(adminUser);

  // Create regular user
  const regularUser = userRepo.create({
    email: 'user@test.com',
    password: 'hashedpassword',
    role: 'user',
  });
  await userRepo.save(regularUser);
  userToken = AuthService.generateAccessToken(regularUser);

  // Create a test project
  const project = projectRepo.create({
    title: 'Test Project',
    description: 'A test project for analytics',
    technologies: ['TypeScript', 'Node.js'],
    images: [],
    featured: false,
  });
  await projectRepo.save(project);
  testProjectId = project.id;
});

afterAll(async () => {
  await disconnectDatabases();
});

beforeEach(async () => {
  await PageView.deleteMany({});
  await ProjectInteraction.deleteMany({});
});

describe('Analytics API Integration Tests', () => {
  describe('POST /api/analytics/view', () => {
    it('should record a page view with valid data', async () => {
      const response = await request(app)
        .post('/api/analytics/view')
        .send({ page: '/home' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();

      // Verify in database
      const pageViews = await PageView.find({});
      expect(pageViews).toHaveLength(1);
      expect(pageViews[0].page).toBe('/home');
    });

    it('should record page view with session ID', async () => {
      const response = await request(app)
        .post('/api/analytics/view')
        .send({ page: '/about', sessionId: 'test-session-123' });

      expect(response.status).toBe(201);

      const pageView = await PageView.findOne({ page: '/about' });
      expect(pageView?.sessionId).toBe('test-session-123');
    });

    it('should reject request without page', async () => {
      const response = await request(app)
        .post('/api/analytics/view')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid page value', async () => {
      const response = await request(app)
        .post('/api/analytics/view')
        .send({ page: 'x'.repeat(501) });

      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/analytics/interaction', () => {
    it('should record a project view interaction', async () => {
      const response = await request(app)
        .post('/api/analytics/interaction')
        .send({ projectId: testProjectId, type: 'view' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      const interactions = await ProjectInteraction.find({});
      expect(interactions).toHaveLength(1);
      expect(interactions[0].type).toBe('view');
    });

    it('should record a project like interaction', async () => {
      const response = await request(app)
        .post('/api/analytics/interaction')
        .send({ projectId: testProjectId, type: 'like' });

      expect(response.status).toBe(201);
    });

    it('should record a project share interaction', async () => {
      const response = await request(app)
        .post('/api/analytics/interaction')
        .send({ projectId: testProjectId, type: 'share' });

      expect(response.status).toBe(201);
    });

    it('should prevent duplicate likes from same IP', async () => {
      // First like
      await request(app)
        .post('/api/analytics/interaction')
        .send({ projectId: testProjectId, type: 'like' });

      // Second like from same IP
      const response = await request(app)
        .post('/api/analytics/interaction')
        .send({ projectId: testProjectId, type: 'like' });

      expect(response.status).toBe(409);
      expect(response.body.error.message).toBe('Already liked this project');
    });

    it('should reject request without projectId', async () => {
      const response = await request(app)
        .post('/api/analytics/interaction')
        .send({ type: 'view' });

      expect(response.status).toBe(400);
    });

    it('should reject invalid interaction type', async () => {
      const response = await request(app)
        .post('/api/analytics/interaction')
        .send({ projectId: testProjectId, type: 'invalid' });

      expect(response.status).toBe(422);
    });
  });

  describe('GET /api/analytics/stats (admin only)', () => {
    beforeEach(async () => {
      // Create some test page views
      await PageView.create([
        { page: '/home', ip: '192.168.1.1' },
        { page: '/home', ip: '192.168.1.2' },
        { page: '/about', ip: '192.168.1.1' },
        { page: '/projects', ip: '192.168.1.3' },
      ]);
    });

    it('should return page view statistics for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalViews).toBe(4);
      expect(response.body.data.uniqueVisitors).toBe(3);
      expect(response.body.data.topPages).toBeDefined();
      expect(response.body.data.viewsByDate).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/analytics/stats');

      expect(response.status).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/analytics/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should filter by date range', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .get('/api/analytics/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: yesterday.toISOString() });

      expect(response.status).toBe(200);
      expect(response.body.data.totalViews).toBe(4);
    });
  });

  describe('GET /api/analytics/projects (admin only)', () => {
    beforeEach(async () => {
      // Create some test interactions
      await ProjectInteraction.create([
        { projectId: testProjectId, type: 'view', ip: '192.168.1.1' },
        { projectId: testProjectId, type: 'view', ip: '192.168.1.2' },
        { projectId: testProjectId, type: 'like', ip: '192.168.1.1' },
        { projectId: testProjectId, type: 'share', ip: '192.168.1.1' },
      ]);
    });

    it('should return project statistics for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].views).toBe(2);
      expect(response.body.data[0].likes).toBe(1);
      expect(response.body.data[0].shares).toBe(1);
    });

    it('should filter by project ID', async () => {
      const response = await request(app)
        .get('/api/analytics/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ projectId: testProjectId });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/analytics/views (admin only)', () => {
    beforeEach(async () => {
      await PageView.create([
        { page: '/home', ip: '192.168.1.1' },
        { page: '/about', ip: '192.168.1.2' },
      ]);
    });

    it('should return recent page views for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/views')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.views).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/analytics/views')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.data.views).toHaveLength(1);
      expect(response.body.data.limit).toBe(1);
    });
  });

  describe('GET /api/analytics/realtime (admin only)', () => {
    it('should return real-time statistics for admin', async () => {
      // Create a recent page view
      await PageView.create({ page: '/home', ip: '192.168.1.1' });

      const response = await request(app)
        .get('/api/analytics/realtime')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.viewsLast24h).toBeDefined();
      expect(response.body.data.viewsLastHour).toBeDefined();
      expect(response.body.data.activePages).toBeDefined();
    });
  });

  describe('GET /api/analytics/export/pageviews (admin only)', () => {
    beforeEach(async () => {
      await PageView.create([
        { page: '/home', ip: '192.168.1.1', userAgent: 'Mozilla/5.0' },
        { page: '/about', ip: '192.168.1.2', referrer: 'https://google.com' },
      ]);
    });

    it('should export page views as CSV for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/export/pageviews')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('pageviews.csv');
      expect(response.text).toContain('ID,Page,IP,User Agent,Referrer,Country,Session ID,Created At');
      expect(response.text).toContain('/home');
      expect(response.text).toContain('/about');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/analytics/export/pageviews');
      expect(response.status).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/analytics/export/pageviews')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });

    it('should filter by date range', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .get('/api/analytics/export/pageviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: yesterday.toISOString() });

      expect(response.status).toBe(200);
      expect(response.text).toContain('/home');
    });
  });

  describe('GET /api/analytics/export/interactions (admin only)', () => {
    beforeEach(async () => {
      await ProjectInteraction.create([
        { projectId: testProjectId, type: 'view', ip: '192.168.1.1' },
        { projectId: testProjectId, type: 'like', ip: '192.168.1.2' },
      ]);
    });

    it('should export project interactions as CSV for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/export/interactions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('interactions.csv');
      expect(response.text).toContain('ID,Project ID,Type,IP,User Agent,Session ID,Created At');
      expect(response.text).toContain('view');
      expect(response.text).toContain('like');
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/analytics/export/interactions');
      expect(response.status).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/analytics/export/interactions')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/analytics/summary (admin only)', () => {
    beforeEach(async () => {
      await PageView.create([
        { page: '/home', ip: '192.168.1.1' },
        { page: '/about', ip: '192.168.1.2' },
      ]);
      await ProjectInteraction.create([
        { projectId: testProjectId, type: 'view', ip: '192.168.1.1' },
        { projectId: testProjectId, type: 'like', ip: '192.168.1.2' },
      ]);
    });

    it('should return aggregated statistics summary for admin', async () => {
      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pageViews).toBeDefined();
      expect(response.body.data.pageViews.totalViews).toBe(2);
      expect(response.body.data.projectStats).toBeDefined();
      expect(response.body.data.realTime).toBeDefined();
      expect(response.body.data.period).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/analytics/summary');
      expect(response.status).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(403);
    });

    it('should filter by date range', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: yesterday.toISOString() });

      expect(response.status).toBe(200);
      expect(response.body.data.period.startDate).toBeDefined();
    });
  });
});
