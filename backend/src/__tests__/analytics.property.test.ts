/**
 * Analytics System Property-Based Tests
 * **Feature: dynamic-portfolio-upgrade, Property 8: 统计数据收集和展示**
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 *
 * Property 8: For any user visit and behavior, Backend_API should accurately
 * record statistics data and provide real-time query and export functionality.
 */

import * as fc from 'fast-check';
import request from 'supertest';
import { connectDatabases, disconnectDatabases, MySQLDataSource } from '../config/database';
import app from '../app';
import { User, PageView, ProjectInteraction, Project } from '../models';
import { AuthService } from '../services';

describe('Property 8: Analytics Data Collection and Display', () => {
  let adminToken: string;
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

  /**
   * Arbitrary for valid page paths
   */
  const pagePathArb = fc.stringMatching(/^\/[a-z0-9\-\/]{0,50}$/).filter((s) => s.length > 0 && s.length <= 100);

  /**
   * Arbitrary for valid session IDs
   */
  const sessionIdArb = fc.stringMatching(/^[a-zA-Z0-9\-]{8,36}$/);

  /**
   * Arbitrary for valid interaction types
   */
  const interactionTypeArb = fc.constantFrom('view', 'like', 'share');

  /**
   * Arbitrary for valid IP addresses
   */
  const ipAddressArb = fc.tuple(
    fc.integer({ min: 1, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 1, max: 254 })
  ).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

  /**
   * Property 8.1: Page view recording consistency
   *
   * For any valid page path, the system should record the page view
   * and return a consistent response structure.
   * **Validates: Requirement 6.1**
   */
  it('should record page views consistently for any valid page path', async () => {
    await fc.assert(
      fc.asyncProperty(pagePathArb, sessionIdArb, async (page, sessionId) => {
        const response = await request(app)
          .post('/api/analytics/view')
          .send({ page, sessionId });

        // Property: Response should be successful
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);

        // Property: Response should contain an ID
        expect(response.body.data.id).toBeDefined();
        expect(typeof response.body.data.id).toBe('string');

        // Property: Page view should be persisted in database
        const savedView = await PageView.findById(response.body.data.id);
        expect(savedView).not.toBeNull();
        expect(savedView?.page).toBe(page);
        expect(savedView?.sessionId).toBe(sessionId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.2: Project interaction recording consistency
   *
   * For any valid interaction type (view, share), the system should
   * record the interaction and return a consistent response.
   * **Validates: Requirement 6.1**
   */
  it('should record project interactions consistently for view and share types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('view', 'share'),
        async (type) => {
          const response = await request(app)
            .post('/api/analytics/interaction')
            .send({ projectId: testProjectId, type });

          // Property: Response should be successful
          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);

          // Property: Response should contain an ID
          expect(response.body.data.id).toBeDefined();

          // Property: Interaction should be persisted in database
          const savedInteraction = await ProjectInteraction.findById(response.body.data.id);
          expect(savedInteraction).not.toBeNull();
          expect(savedInteraction?.type).toBe(type);
          expect(savedInteraction?.projectId.toString()).toBe(testProjectId);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.3: Statistics aggregation accuracy
   *
   * For any number of page views recorded, the statistics should
   * accurately reflect the total count and unique visitors.
   * **Validates: Requirement 6.2**
   */
  it('should accurately aggregate page view statistics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            page: pagePathArb,
            ip: ipAddressArb,
          }),
          { minLength: 1, maxLength: 20 }
        ),
        async (pageViews) => {
          // Clean database before each iteration
          await PageView.deleteMany({});

          // Record all page views
          for (const { page, ip } of pageViews) {
            await PageView.create({ page, ip });
          }

          // Get statistics
          const response = await request(app)
            .get('/api/analytics/stats')
            .set('Authorization', `Bearer ${adminToken}`);

          // Property: Response should be successful
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // Property: Total views should match recorded count
          expect(response.body.data.totalViews).toBe(pageViews.length);

          // Property: Unique visitors should be <= total views
          const uniqueIps = new Set(pageViews.map((pv) => pv.ip)).size;
          expect(response.body.data.uniqueVisitors).toBe(uniqueIps);

          // Property: Top pages should be defined
          expect(response.body.data.topPages).toBeDefined();
          expect(Array.isArray(response.body.data.topPages)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.4: Real-time statistics consistency
   *
   * For any recorded page views, real-time statistics should
   * accurately reflect recent activity.
   * **Validates: Requirement 6.3**
   */
  it('should provide accurate real-time statistics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (viewCount) => {
          // Clean database before each iteration
          await PageView.deleteMany({});

          // Record page views
          for (let i = 0; i < viewCount; i++) {
            await PageView.create({
              page: `/page-${i}`,
              ip: `192.168.1.${i + 1}`,
            });
          }

          // Get real-time statistics
          const response = await request(app)
            .get('/api/analytics/realtime')
            .set('Authorization', `Bearer ${adminToken}`);

          // Property: Response should be successful
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // Property: Views in last 24h should include our recorded views
          expect(response.body.data.viewsLast24h).toBeGreaterThanOrEqual(viewCount);

          // Property: Views in last hour should include our recorded views
          expect(response.body.data.viewsLastHour).toBeGreaterThanOrEqual(viewCount);

          // Property: Active pages should be defined
          expect(response.body.data.activePages).toBeDefined();
          expect(Array.isArray(response.body.data.activePages)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.5: CSV export format consistency
   *
   * For any recorded page views, the CSV export should contain
   * all records with proper formatting.
   * **Validates: Requirement 6.4**
   */
  it('should export page views as valid CSV format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(pagePathArb, { minLength: 1, maxLength: 10 }),
        async (pages) => {
          // Clean database before each iteration
          await PageView.deleteMany({});

          // Record page views
          for (const page of pages) {
            await PageView.create({
              page,
              ip: '192.168.1.1',
              userAgent: 'Mozilla/5.0',
            });
          }

          // Export as CSV
          const response = await request(app)
            .get('/api/analytics/export/pageviews')
            .set('Authorization', `Bearer ${adminToken}`);

          // Property: Response should be successful
          expect(response.status).toBe(200);

          // Property: Content type should be CSV
          expect(response.headers['content-type']).toContain('text/csv');

          // Property: Content disposition should indicate file download
          expect(response.headers['content-disposition']).toContain('pageviews.csv');

          // Property: CSV should contain header row
          expect(response.text).toContain('ID,Page,IP,User Agent,Referrer,Country,Session ID,Created At');

          // Property: CSV should contain all recorded pages
          for (const page of pages) {
            expect(response.text).toContain(page);
          }

          // Property: Number of data rows should match recorded count
          const lines = response.text.trim().split('\n');
          expect(lines.length).toBe(pages.length + 1); // +1 for header
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.6: Project interaction statistics accuracy
   *
   * For any combination of project interactions, the statistics
   * should accurately count each interaction type.
   * **Validates: Requirement 6.2, 6.5**
   */
  it('should accurately count project interactions by type', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          views: fc.integer({ min: 0, max: 10 }),
          likes: fc.integer({ min: 0, max: 5 }),
          shares: fc.integer({ min: 0, max: 5 }),
        }),
        async ({ views, likes, shares }) => {
          // Clean database before each iteration
          await ProjectInteraction.deleteMany({});

          // Record interactions with unique IPs
          for (let i = 0; i < views; i++) {
            await ProjectInteraction.create({
              projectId: testProjectId,
              type: 'view',
              ip: `10.0.0.${i + 1}`,
            });
          }
          for (let i = 0; i < likes; i++) {
            await ProjectInteraction.create({
              projectId: testProjectId,
              type: 'like',
              ip: `10.0.1.${i + 1}`,
            });
          }
          for (let i = 0; i < shares; i++) {
            await ProjectInteraction.create({
              projectId: testProjectId,
              type: 'share',
              ip: `10.0.2.${i + 1}`,
            });
          }

          // Get project statistics
          const response = await request(app)
            .get('/api/analytics/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .query({ projectId: testProjectId });

          // Property: Response should be successful
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // If there are any interactions, we should have stats
          if (views + likes + shares > 0) {
            expect(response.body.data).toHaveLength(1);
            const stats = response.body.data[0];

            // Property: Counts should match recorded interactions
            expect(stats.views).toBe(views);
            expect(stats.likes).toBe(likes);
            expect(stats.shares).toBe(shares);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.7: Statistics summary completeness
   *
   * For any recorded data, the summary endpoint should return
   * a complete aggregated view of all statistics.
   * **Validates: Requirement 6.2, 6.3, 6.5**
   */
  it('should provide complete statistics summary', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (dataCount) => {
          // Clean database before each iteration
          await PageView.deleteMany({});
          await ProjectInteraction.deleteMany({});

          // Record some page views and interactions
          for (let i = 0; i < dataCount; i++) {
            await PageView.create({
              page: `/summary-page-${i}`,
              ip: `172.16.0.${i + 1}`,
            });
            await ProjectInteraction.create({
              projectId: testProjectId,
              type: 'view',
              ip: `172.16.1.${i + 1}`,
            });
          }

          // Get summary
          const response = await request(app)
            .get('/api/analytics/summary')
            .set('Authorization', `Bearer ${adminToken}`);

          // Property: Response should be successful
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // Property: Summary should contain all required sections
          expect(response.body.data.pageViews).toBeDefined();
          expect(response.body.data.projectStats).toBeDefined();
          expect(response.body.data.realTime).toBeDefined();
          expect(response.body.data.period).toBeDefined();

          // Property: Page views section should have correct structure
          expect(response.body.data.pageViews.totalViews).toBeGreaterThanOrEqual(dataCount);
          expect(response.body.data.pageViews.uniqueVisitors).toBeDefined();
          expect(response.body.data.pageViews.topPages).toBeDefined();

          // Property: Real-time section should have correct structure
          expect(response.body.data.realTime.viewsLast24h).toBeDefined();
          expect(response.body.data.realTime.viewsLastHour).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.8: Pagination consistency for page views
   *
   * For any valid pagination parameters, the response should
   * correctly paginate the results.
   * **Validates: Requirement 6.2**
   */
  it('should correctly paginate page view results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 5, max: 15 }),
        fc.integer({ min: 1, max: 5 }),
        async (totalViews, limit) => {
          // Clean database before each iteration
          await PageView.deleteMany({});

          // Record page views
          for (let i = 0; i < totalViews; i++) {
            await PageView.create({
              page: `/paginated-${i}`,
              ip: `192.168.2.${(i % 254) + 1}`,
            });
          }

          // Get first page
          const response = await request(app)
            .get('/api/analytics/views')
            .set('Authorization', `Bearer ${adminToken}`)
            .query({ page: 1, limit });

          // Property: Response should be successful
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // Property: Pagination metadata should be correct
          expect(response.body.data.total).toBe(totalViews);
          expect(response.body.data.page).toBe(1);
          expect(response.body.data.limit).toBe(limit);

          // Property: Number of results should not exceed limit
          expect(response.body.data.views.length).toBeLessThanOrEqual(limit);

          // Property: If total > limit, we should have exactly limit results
          if (totalViews > limit) {
            expect(response.body.data.views.length).toBe(limit);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.9: Interaction export format consistency
   *
   * For any recorded interactions, the CSV export should contain
   * all records with proper formatting.
   * **Validates: Requirement 6.4**
   */
  it('should export project interactions as valid CSV format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(interactionTypeArb, { minLength: 1, maxLength: 10 }),
        async (types) => {
          // Clean database before each iteration
          await ProjectInteraction.deleteMany({});

          // Record interactions
          for (let i = 0; i < types.length; i++) {
            await ProjectInteraction.create({
              projectId: testProjectId,
              type: types[i],
              ip: `192.168.3.${i + 1}`,
            });
          }

          // Export as CSV
          const response = await request(app)
            .get('/api/analytics/export/interactions')
            .set('Authorization', `Bearer ${adminToken}`);

          // Property: Response should be successful
          expect(response.status).toBe(200);

          // Property: Content type should be CSV
          expect(response.headers['content-type']).toContain('text/csv');

          // Property: Content disposition should indicate file download
          expect(response.headers['content-disposition']).toContain('interactions.csv');

          // Property: CSV should contain header row
          expect(response.text).toContain('ID,Project ID,Type,IP,User Agent,Session ID,Created At');

          // Property: Number of data rows should match recorded count
          const lines = response.text.trim().split('\n');
          expect(lines.length).toBe(types.length + 1); // +1 for header
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.10: Date range filtering consistency
   *
   * For any valid date range, the statistics should only include
   * data within that range.
   * **Validates: Requirement 6.2**
   */
  it('should correctly filter statistics by date range', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (viewCount) => {
          // Clean database before each iteration
          await PageView.deleteMany({});

          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          // Record page views
          for (let i = 0; i < viewCount; i++) {
            await PageView.create({
              page: `/filtered-${i}`,
              ip: `192.168.4.${i + 1}`,
            });
          }

          // Get statistics with date filter
          const response = await request(app)
            .get('/api/analytics/stats')
            .set('Authorization', `Bearer ${adminToken}`)
            .query({ startDate: yesterday.toISOString() });

          // Property: Response should be successful
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // Property: Total views should include our recorded views
          expect(response.body.data.totalViews).toBeGreaterThanOrEqual(viewCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

console.log('✅ Analytics property-based tests defined successfully');
