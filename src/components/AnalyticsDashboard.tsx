import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Users,
  TrendingUp,
  Heart,
  Share2,
  Clock,
  Activity,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  PieChart,
} from 'lucide-react';
import {
  useAnalyticsSummary,
  useRealTimeStats,
  useProjectStats,
  useUserBehaviorStats,
  useInteractionTrends,
} from '../api/hooks/useAnalytics';
import { useProjects } from '../api/hooks/useProjects';
import type { ProjectStats, Project, UserBehaviorStats, InteractionTrend } from '../api/types';

// Stat card component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

const StatCard = ({ title, value, icon, trend, subtitle, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          <TrendingUp
            className={`w-4 h-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`}
          />
          <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs 上周</span>
        </div>
      )}
    </motion.div>
  );
};

// Simple bar chart component
interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  maxBars?: number;
  color?: string;
}

const SimpleBarChart = ({ data, maxBars = 7, color = 'bg-blue-500' }: BarChartProps) => {
  const displayData = data.slice(-maxBars);
  const maxValue = Math.max(...displayData.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {displayData.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={`w-full ${color} rounded-t-md min-h-[4px]`}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Stacked bar chart for interaction trends
interface StackedBarChartProps {
  data: InteractionTrend[];
  maxBars?: number;
}

const StackedBarChart = ({ data, maxBars = 7 }: StackedBarChartProps) => {
  const displayData = data.slice(-maxBars);
  const maxValue = Math.max(
    ...displayData.map((d) => d.views + d.likes + d.shares),
    1
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="flex items-end gap-2 h-32">
      {displayData.map((item, index) => {
        const total = item.views + item.likes + item.shares;
        const viewsHeight = (item.views / maxValue) * 100;
        const likesHeight = (item.likes / maxValue) * 100;
        const sharesHeight = (item.shares / maxValue) * 100;

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse" style={{ height: `${(total / maxValue) * 100}%`, minHeight: '4px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${viewsHeight > 0 ? (viewsHeight / (total / maxValue * 100)) * 100 : 0}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="w-full bg-blue-500 rounded-b-md"
                title={`浏览: ${item.views}`}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${likesHeight > 0 ? (likesHeight / (total / maxValue * 100)) * 100 : 0}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
                className="w-full bg-red-400"
                title={`点赞: ${item.likes}`}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${sharesHeight > 0 ? (sharesHeight / (total / maxValue * 100)) * 100 : 0}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                className="w-full bg-green-400 rounded-t-md"
                title={`分享: ${item.shares}`}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
              {formatDate(item.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
};


// Donut chart for device breakdown
interface DonutChartProps {
  data: Array<{ device: string; count: number }>;
}

const DonutChart = ({ data }: DonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
        暂无数据
      </div>
    );
  }

  const colors = {
    Desktop: '#3B82F6',
    Mobile: '#10B981',
    Tablet: '#F59E0B',
  };

  const icons = {
    Desktop: <Monitor className="w-4 h-4" />,
    Mobile: <Smartphone className="w-4 h-4" />,
    Tablet: <Tablet className="w-4 h-4" />,
  };

  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.count / total) * 100;
    const angle = (item.count / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: colors[item.device as keyof typeof colors] || '#6B7280',
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((segment, index) => {
            const startAngle = (segment.startAngle * Math.PI) / 180;
            const endAngle = (segment.endAngle * Math.PI) / 180;
            const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;

            const x1 = 50 + 40 * Math.cos(startAngle);
            const y1 = 50 + 40 * Math.sin(startAngle);
            const x2 = 50 + 40 * Math.cos(endAngle);
            const y2 = 50 + 40 * Math.sin(endAngle);

            return (
              <motion.path
                key={index}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={segment.color}
                className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" className="fill-white dark:fill-gray-900" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{total}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              {icons[segment.device as keyof typeof icons]}
              {segment.device}
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              {segment.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Hourly distribution chart
interface HourlyChartProps {
  data: Array<{ hour: number; views: number }>;
}

const HourlyChart = ({ data }: HourlyChartProps) => {
  // Fill in missing hours
  const fullData = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d.hour === i);
    return { hour: i, views: found?.views || 0 };
  });

  const maxViews = Math.max(...fullData.map((d) => d.views), 1);

  return (
    <div className="flex items-end gap-0.5 h-24">
      {fullData.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.views / maxViews) * 100}%` }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            className="w-full bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-sm min-h-[2px]"
            title={`${item.hour}:00 - ${item.views} 访问`}
          />
        </div>
      ))}
    </div>
  );
};

// Weekday distribution chart
interface WeekdayChartProps {
  data: Array<{ day: string; views: number }>;
}

const WeekdayChart = ({ data }: WeekdayChartProps) => {
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="w-8 text-xs text-gray-500 dark:text-gray-400">{item.day}</span>
          <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.views / maxViews) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            />
          </div>
          <span className="w-12 text-xs text-right text-gray-600 dark:text-gray-400">
            {item.views}
          </span>
        </div>
      ))}
    </div>
  );
};

// Popular projects ranking component
interface PopularProjectsProps {
  projectStats: ProjectStats[];
  projects: Project[];
}

const PopularProjectsRanking = ({ projectStats, projects }: PopularProjectsProps) => {
  const rankedProjects = useMemo(() => {
    return projectStats
      .map((stat) => {
        const project = projects.find((p) => p.id === stat.projectId);
        const totalEngagement = stat.views + stat.likes * 5 + stat.shares * 10;
        return {
          ...stat,
          project,
          totalEngagement,
        };
      })
      .filter((item) => item.project)
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 5);
  }, [projectStats, projects]);

  if (rankedProjects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        暂无项目数据
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rankedProjects.map((item, index) => (
        <motion.div
          key={item.projectId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/20 dark:hover:bg-white/10 transition-all"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
              index === 0
                ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                : index === 1
                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                : index === 2
                ? 'bg-gradient-to-br from-amber-600 to-amber-700'
                : 'bg-gray-500'
            }`}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {item.project?.title || '未知项目'}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {item.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {item.likes}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                {item.shares}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Top pages component
interface TopPagesProps {
  pages: Array<{ page: string; views: number }>;
}

const TopPages = ({ pages }: TopPagesProps) => {
  const maxViews = Math.max(...pages.map((p) => p.views), 1);

  return (
    <div className="space-y-3">
      {pages.slice(0, 5).map((page, index) => (
        <motion.div
          key={page.page}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
              {page.page}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {page.views}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(page.views / maxViews) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Top referrers component
interface TopReferrersProps {
  referrers: Array<{ referrer: string; count: number }>;
}

const TopReferrers = ({ referrers }: TopReferrersProps) => {
  if (!referrers || referrers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        暂无来源数据
      </div>
    );
  }

  const maxCount = Math.max(...referrers.map((r) => r.count), 1);

  const formatReferrer = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  return (
    <div className="space-y-3">
      {referrers.slice(0, 5).map((item, index) => (
        <motion.div
          key={item.referrer}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[70%] flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {formatReferrer(item.referrer)}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.count}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / maxCount) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};


// User behavior panel component
interface UserBehaviorPanelProps {
  behavior: UserBehaviorStats | undefined;
  isLoading: boolean;
}

const UserBehaviorPanel = ({ behavior, isLoading }: UserBehaviorPanelProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!behavior) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        暂无用户行为数据
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">总会话数</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {behavior.totalSessions.toLocaleString()}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">平均页面/会话</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {behavior.avgPagesPerSession.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Device breakdown */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          设备分布
        </h4>
        <DonutChart data={behavior.deviceBreakdown} />
      </div>

      {/* Hourly distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          24小时访问分布
        </h4>
        <HourlyChart data={behavior.hourlyDistribution} />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0:00</span>
          <span>6:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* Weekday distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          每周访问分布
        </h4>
        <WeekdayChart data={behavior.weekdayDistribution} />
      </div>
    </div>
  );
};

// Loading skeleton
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass rounded-2xl p-6">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="glass rounded-2xl p-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error display
interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => (
  <div className="text-center py-12 glass rounded-2xl">
    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      无法加载统计数据
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium hover:opacity-90 transition-opacity"
    >
      <RefreshCw className="w-4 h-4" />
      重试
    </button>
  </div>
);

// Main Analytics Dashboard component
const AnalyticsDashboard = () => {
  const [dateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'behavior' | 'projects'>('overview');

  // Fetch analytics data
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorData,
    refetch: refetchSummary,
  } = useAnalyticsSummary(dateRange);

  const { data: realTime, isLoading: realTimeLoading } = useRealTimeStats();
  const { data: projectStats } = useProjectStats();
  const { data: projectsData } = useProjects({ limit: 100 });
  const { data: behavior, isLoading: behaviorLoading } = useUserBehaviorStats(dateRange);
  const { data: trends } = useInteractionTrends(dateRange);

  const isLoading = summaryLoading || realTimeLoading;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!summary?.pageViews?.viewsByDate) return [];
    return summary.pageViews.viewsByDate.map((item) => ({
      label: formatDate(item.date),
      value: item.views,
    }));
  }, [summary?.pageViews?.viewsByDate]);

  if (isLoading) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            数据分析
          </h2>
          <DashboardSkeleton />
        </div>
      </section>
    );
  }

  if (summaryError) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            数据分析
          </h2>
          <ErrorDisplay
            message={
              summaryErrorData instanceof Error
                ? summaryErrorData.message
                : '请检查网络连接后重试'
            }
            onRetry={() => refetchSummary()}
          />
        </div>
      </section>
    );
  }

  const pageViews = summary?.pageViews;
  const realTimeData = realTime || summary?.realTime;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            数据分析
          </h2>
          <div className="flex items-center gap-2">
            {/* Tab buttons */}
            <div className="flex glass rounded-xl p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                概览
              </button>
              <button
                onClick={() => setActiveTab('behavior')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'behavior'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                用户行为
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'projects'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                项目分析
              </button>
            </div>
            <button
              onClick={() => refetchSummary()}
              className="p-2 rounded-lg glass hover:bg-white/20 dark:hover:bg-white/10 transition-all"
              title="刷新数据"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats overview cards - always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="总访问量"
            value={pageViews?.totalViews?.toLocaleString() || '0'}
            icon={<Eye className="w-6 h-6 text-white" />}
            color="blue"
          />
          <StatCard
            title="独立访客"
            value={pageViews?.uniqueVisitors?.toLocaleString() || '0'}
            icon={<Users className="w-6 h-6 text-white" />}
            color="green"
          />
          <StatCard
            title="24小时访问"
            value={realTimeData?.viewsLast24h?.toLocaleString() || '0'}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="purple"
          />
          <StatCard
            title="实时访问"
            value={realTimeData?.viewsLastHour?.toLocaleString() || '0'}
            subtitle="最近1小时"
            icon={<Activity className="w-6 h-6 text-white" />}
            color="amber"
          />
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <>
            {/* Charts and rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Page views chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    访问趋势
                  </h3>
                </div>
                {chartData.length > 0 ? (
                  <SimpleBarChart data={chartData} color="bg-gradient-to-t from-blue-500 to-cyan-400" />
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    暂无数据
                  </div>
                )}
              </motion.div>

              {/* Top pages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    热门页面
                  </h3>
                </div>
                {pageViews?.topPages && pageViews.topPages.length > 0 ? (
                  <TopPages pages={pageViews.topPages} />
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    暂无数据
                  </div>
                )}
              </motion.div>
            </div>

            {/* Real-time and referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active pages (real-time) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    实时活跃页面
                  </h3>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    最近1小时
                  </span>
                </div>
                {realTimeData?.activePages && realTimeData.activePages.length > 0 ? (
                  <TopPages pages={realTimeData.activePages} />
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    暂无实时数据
                  </div>
                )}
              </motion.div>

              {/* Top referrers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    流量来源
                  </h3>
                </div>
                <TopReferrers referrers={behavior?.topReferrers || []} />
              </motion.div>
            </div>
          </>
        )}

        {activeTab === 'behavior' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                用户行为分析
              </h3>
            </div>
            <UserBehaviorPanel behavior={behavior} isLoading={behaviorLoading} />
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular projects ranking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  热门项目排行
                </h3>
              </div>
              <PopularProjectsRanking
                projectStats={projectStats || summary?.projectStats || []}
                projects={projectsData?.projects || []}
              />
            </motion.div>

            {/* Interaction trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  互动趋势
                </h3>
              </div>
              {trends && trends.length > 0 ? (
                <>
                  <StackedBarChart data={trends} />
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      浏览
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-400 rounded" />
                      点赞
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-400 rounded" />
                      分享
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  暂无互动数据
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
