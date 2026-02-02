/**
 * Admin Dashboard Page
 * Overview page with key metrics and quick actions
 */
import { useEffect, useState } from 'react';
import {
  Eye,
  Heart,
  FileText,
  FolderKanban,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { apiGet } from '../../api/client';
import type { AnalyticsSummary } from '../../api/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: typeof Eye;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className={`w-4 h-4 ${trendUp ? 'text-green-500' : 'text-red-500 rotate-180'}`}
              />
              <span
                className={`text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: typeof Eye;
  onClick?: () => void;
}

function QuickAction({ title, description, icon: Icon, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left w-full"
    >
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <ArrowUpRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiGet<AnalyticsSummary>('/analytics/summary');
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">仪表板</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          欢迎回来！这是您网站的概览。
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            {error} - 显示默认数据
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总访问量"
          value={analytics?.pageViews?.totalViews ? analytics.pageViews.totalViews.toLocaleString() : '0'}
          icon={Eye}
          trend="+12.5%"
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="独立访客"
          value={analytics?.pageViews?.uniqueVisitors ? analytics.pageViews.uniqueVisitors.toLocaleString() : '0'}
          icon={Users}
          trend="+8.2%"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="项目点赞"
          value={
            analytics?.projectStats ? 
            analytics.projectStats.reduce((sum, p) => sum + p.likes, 0).toLocaleString() : '0'
          }
          icon={Heart}
          trend="+15.3%"
          trendUp={true}
          color="purple"
        />
        <StatCard
          title="最近24小时"
          value={analytics?.realTime?.viewsLast24h ? analytics.realTime.viewsLast24h.toLocaleString() : '0'}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="添加新项目"
            description="创建一个新的作品集项目"
            icon={FolderKanban}
          />
          <QuickAction
            title="撰写博客"
            description="发布一篇新的博客文章"
            icon={FileText}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">热门页面</h2>
        <div className="space-y-3">
          {analytics?.pageViews?.topPages?.slice(0, 5).map((page, index) => (
            <div
              key={page.page}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                  {index + 1}
                </span>
                <span className="text-gray-800 dark:text-white">{page.page}</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {page.views ? page.views.toLocaleString() : '0'} 次访问
              </span>
            </div>
          )) || (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
