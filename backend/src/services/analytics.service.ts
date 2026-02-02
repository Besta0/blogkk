import { PageView, ProjectInteraction, IPageView, IProjectInteraction } from '../models/analytics.model';

export interface PageViewStats {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { page: string; count: number }[];
  viewsByDate: { date: string; count: number }[];
}

export interface ProjectStats {
  projectId: string;
  views: number;
  likes: number;
  shares: number;
}

export class AnalyticsService {
  // Record a page view
  static async recordPageView(data: {
    page: string;
    ip?: string;
    userAgent?: string;
    referrer?: string;
    sessionId?: string;
    country?: string;
  }): Promise<IPageView> {
    const pageView = new PageView(data);
    return pageView.save();
  }

  // Record a project interaction
  static async recordProjectInteraction(data: {
    projectId: string;
    type: 'view' | 'like' | 'share';
    ip?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<IProjectInteraction> {
    const interaction = new ProjectInteraction(data);
    return interaction.save();
  }

  // Check if user already liked a project
  static async hasLikedProject(projectId: string, ip: string): Promise<boolean> {
    const existing = await ProjectInteraction.findOne({
      projectId,
      type: 'like',
      ip,
    });
    return !!existing;
  }

  // Get page view statistics
  static async getPageViewStats(startDate?: Date, endDate?: Date): Promise<PageViewStats> {
    const query: Record<string, unknown> = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
    }

    const [totalViews, uniqueVisitors, topPages, viewsByDate] = await Promise.all([
      PageView.countDocuments(query),
      PageView.distinct('ip', query).then(ips => ips.length),
      PageView.aggregate([
        { $match: query },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { page: '$_id', count: 1, _id: 0 } },
      ]),
      PageView.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    return { totalViews, uniqueVisitors, topPages, viewsByDate };
  }

  // Get project statistics
  static async getProjectStats(projectId?: string): Promise<ProjectStats[]> {
    const match = projectId ? { projectId } : {};

    const stats = await ProjectInteraction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { projectId: '$projectId', type: '$type' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.projectId',
          interactions: {
            $push: { type: '$_id.type', count: '$count' },
          },
        },
      },
      {
        $project: {
          projectId: '$_id',
          _id: 0,
          interactions: 1,
        },
      },
    ]);

    return stats.map((s: { projectId: string; interactions: { type: string; count: number }[] }) => ({
      projectId: s.projectId,
      views: s.interactions.find((i: { type: string; count: number }) => i.type === 'view')?.count || 0,
      likes: s.interactions.find((i: { type: string; count: number }) => i.type === 'like')?.count || 0,
      shares: s.interactions.find((i: { type: string; count: number }) => i.type === 'share')?.count || 0,
    }));
  }

  // Get real-time statistics
  static async getRealTimeStats(): Promise<{
    viewsLast24h: number;
    viewsLastHour: number;
    activePages: { page: string; count: number }[];
  }> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const [viewsLast24h, viewsLastHour, activePages] = await Promise.all([
      PageView.countDocuments({ createdAt: { $gte: last24h } }),
      PageView.countDocuments({ createdAt: { $gte: lastHour } }),
      PageView.aggregate([
        { $match: { createdAt: { $gte: lastHour } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { page: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    return { viewsLast24h, viewsLastHour, activePages };
  }

  // Get page views with pagination
  static async getPageViews(page: number = 1, limit: number = 50): Promise<{
    views: IPageView[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const [views, total] = await Promise.all([
      PageView.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      PageView.countDocuments(),
    ]);

    return { views, total, page, limit };
  }

  // Export page views as CSV data
  static async exportPageViews(startDate?: Date, endDate?: Date): Promise<string> {
    const query: Record<string, unknown> = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
    }

    const pageViews = await PageView.find(query).sort({ createdAt: -1 });
    
    // Convert to CSV
    const header = 'ID,Page,IP,User Agent,Referrer,Country,Session ID,Created At';
    const rows = pageViews.map(pv => 
      `${pv._id},${pv.page || ''},${pv.ip || ''},${(pv.userAgent || '').replace(/,/g, ';')},${pv.referrer || ''},${pv.country || ''},${pv.sessionId || ''},${pv.createdAt?.toISOString() || ''}`
    );
    
    return [header, ...rows].join('\n');
  }

  // Export project interactions as CSV data
  static async exportInteractions(startDate?: Date, endDate?: Date): Promise<string> {
    const query: Record<string, unknown> = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
    }

    const interactions = await ProjectInteraction.find(query).sort({ createdAt: -1 });
    
    // Convert to CSV
    const header = 'ID,Project ID,Type,IP,User Agent,Session ID,Created At';
    const rows = interactions.map(i => 
      `${i._id},${i.projectId || ''},${i.type || ''},${i.ip || ''},${(i.userAgent || '').replace(/,/g, ';')},${i.sessionId || ''},${i.createdAt?.toISOString() || ''}`
    );
    
    return [header, ...rows].join('\n');
  }

  // Get summary statistics
  static async getSummary(startDate?: Date, endDate?: Date): Promise<{
    pageViews: PageViewStats;
    projectStats: ProjectStats[];
    realTime: { viewsLast24h: number; viewsLastHour: number; activePages: { page: string; count: number }[] };
    period: { startDate?: Date; endDate?: Date };
  }> {
    const [pageViews, projectStats, realTime] = await Promise.all([
      this.getPageViewStats(startDate, endDate),
      this.getProjectStats(),
      this.getRealTimeStats(),
    ]);

    return {
      pageViews,
      projectStats,
      realTime,
      period: { startDate, endDate },
    };
  }

  // Get user behavior statistics
  static async getUserBehaviorStats(startDate?: Date, endDate?: Date): Promise<{
    totalSessions: number;
    avgPagesPerSession: number;
    topReferrers: { referrer: string; count: number }[];
    deviceBreakdown: { device: string; count: number }[];
    hourlyDistribution: { hour: number; views: number }[];
    weekdayDistribution: { day: string; views: number }[];
  }> {
    const query: Record<string, unknown> = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
    }

    const [
      totalSessions,
      avgPagesPerSession,
      topReferrers,
      deviceBreakdown,
      hourlyDistribution,
      weekdayDistribution
    ] = await Promise.all([
      // Total unique sessions (using IP as session identifier)
      PageView.distinct('ip', query).then(ips => ips.length),
      
      // Average pages per session
      PageView.aggregate([
        { $match: query },
        { $group: { _id: '$ip', pageCount: { $sum: 1 } } },
        { $group: { _id: null, avgPages: { $avg: '$pageCount' } } }
      ]).then(result => result[0]?.avgPages || 0),
      
      // Top referrers
      PageView.aggregate([
        { $match: { ...query, referrer: { $exists: true, $nin: [null, ''] } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { referrer: '$_id', count: 1, _id: 0 } }
      ]),
      
      // Device breakdown (simplified based on user agent)
      PageView.aggregate([
        { $match: query },
        {
          $project: {
            device: {
              $cond: {
                if: { $regexMatch: { input: '$userAgent', regex: /Mobile|Android|iPhone/i } },
                then: 'Mobile',
                else: {
                  $cond: {
                    if: { $regexMatch: { input: '$userAgent', regex: /Tablet|iPad/i } },
                    then: 'Tablet',
                    else: 'Desktop'
                  }
                }
              }
            }
          }
        },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $project: { device: '$_id', count: 1, _id: 0 } }
      ]),
      
      // Hourly distribution
      PageView.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            views: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { hour: '$_id', views: 1, _id: 0 } }
      ]),
      
      // Weekday distribution
      PageView.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            views: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            day: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id', 1] }, then: 'Sunday' },
                  { case: { $eq: ['$_id', 2] }, then: 'Monday' },
                  { case: { $eq: ['$_id', 3] }, then: 'Tuesday' },
                  { case: { $eq: ['$_id', 4] }, then: 'Wednesday' },
                  { case: { $eq: ['$_id', 5] }, then: 'Thursday' },
                  { case: { $eq: ['$_id', 6] }, then: 'Friday' },
                  { case: { $eq: ['$_id', 7] }, then: 'Saturday' }
                ],
                default: 'Unknown'
              }
            },
            views: 1,
            _id: 0
          }
        }
      ])
    ]);

    return {
      totalSessions,
      avgPagesPerSession: Math.round(avgPagesPerSession * 100) / 100,
      topReferrers,
      deviceBreakdown,
      hourlyDistribution,
      weekdayDistribution
    };
  }

  // Get interaction trends - simplified version
  static async getInteractionTrends(startDate?: Date, endDate?: Date): Promise<{
    date: string;
    views: number;
    likes: number;
    shares: number;
  }[]> {
    const query: Record<string, unknown> = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) (query.createdAt as Record<string, Date>).$gte = startDate;
      if (endDate) (query.createdAt as Record<string, Date>).$lte = endDate;
    }

    // Get all interactions grouped by date and type
    const rawData = await ProjectInteraction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Process the data to create the final structure
    const dateMap = new Map<string, { views: number; likes: number; shares: number }>();
    
    rawData.forEach((item: { _id: { date: string; type: string }; count: number }) => {
      const date = item._id.date;
      const type = item._id.type;
      const count = item.count;
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { views: 0, likes: 0, shares: 0 });
      }
      
      const dateData = dateMap.get(date)!;
      if (type === 'view') dateData.views = count;
      else if (type === 'like') dateData.likes = count;
      else if (type === 'share') dateData.shares = count;
    });

    // Convert to array and sort by date
    const trends = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      views: data.views,
      likes: data.likes,
      shares: data.shares
    })).sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  }
}