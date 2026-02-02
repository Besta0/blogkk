/**
 * Blog Manager Page
 * Admin page for managing blog posts with Markdown editor support
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  Clock,
  Tag,
  Menu,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  useAdminBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useBlogTags,
} from '../../api/hooks/useBlog';
import type { BlogPost } from '../../api/types';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  featuredImage: string;
}

const emptyFormData: BlogFormData = {
  title: '',
  content: '',
  excerpt: '',
  tags: [],
  published: false,
  featuredImage: '',
};

export default function BlogManager() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(undefined);
  const { data, isLoading, error } = useAdminBlogPosts({
    page,
    limit: 10,
    search: searchTerm || undefined,
    published: publishedFilter,
  });

  const { data: tagsData } = useBlogTags();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(emptyFormData);
  const [newTag, setNewTag] = useState('');

  // Status state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
    setShowPreview(false);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags,
      published: post.published,
      featuredImage: post.featuredImage || '',
    });
    setIsModalOpen(true);
    setShowPreview(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData(emptyFormData);
    setNewTag('');
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setSaveStatus('error');
      setSaveMessage('标题不能为空');
      return;
    }
    if (!formData.content.trim() || formData.content.length < 10) {
      setSaveStatus('error');
      setSaveMessage('内容至少需要10个字符');
      return;
    }
    if (!formData.excerpt.trim() || formData.excerpt.length < 10) {
      setSaveStatus('error');
      setSaveMessage('摘要至少需要10个字符');
      return;
    }

    setSaveStatus('saving');
    setSaveMessage('');

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        tags: formData.tags,
        published: formData.published,
        featuredImage: formData.featuredImage || undefined,
      };

      if (editingPost) {
        // Update existing post using its ID
        await updatePost.mutateAsync({ id: editingPost.id, data: postData });
        setSaveMessage('文章已更新');
      } else {
        await createPost.mutateAsync(postData);
        setSaveMessage('文章已创建');
      }

      setSaveStatus('success');
      setTimeout(() => {
        closeModal();
        setSaveStatus('idle');
      }, 1500);
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err instanceof Error ? err.message : '保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await updatePost.mutateAsync({
        id: post.id,
        data: { published: !post.published },
      });
    } catch (err) {
      console.error('Toggle publish failed:', err);
    }
  };

  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  }, [newTag, formData]);

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-200">加载博客文章失败: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">博客管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            管理您的博客文章 ({data?.total || 0} 篇文章)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建文章
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索文章标题或内容..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={publishedFilter === undefined ? 'all' : publishedFilter ? 'published' : 'draft'}
          onChange={(e) => {
            const val = e.target.value;
            setPublishedFilter(val === 'all' ? undefined : val === 'published');
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {data?.posts.map((post) => (
          <BlogPostCard
            key={post.id}
            post={post}
            onEdit={() => openEditModal(post)}
            onDelete={() => setDeleteConfirm(post.id)}
            onTogglePublish={() => handleTogglePublish(post)}
          />
        ))}
      </div>

      {data?.posts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? '没有找到匹配的文章' : '暂无文章，点击上方按钮创建'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 10 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            第 {page} 页 / 共 {Math.ceil(data.total / 10)} 页
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 10)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">确认删除</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">确定要删除这篇文章吗？此操作无法撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <BlogEditorModal
          isEditing={!!editingPost}
          formData={formData}
          setFormData={setFormData}
          newTag={newTag}
          setNewTag={setNewTag}
          addTag={addTag}
          removeTag={removeTag}
          onSave={handleSave}
          onClose={closeModal}
          saveStatus={saveStatus}
          saveMessage={saveMessage}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          existingTags={tagsData?.tags || []}
        />
      )}
    </div>
  );
}


// Blog Post Card Component
interface BlogPostCardProps {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

function BlogPostCard({ post, onEdit, onDelete, onTogglePublish }: BlogPostCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="md:w-48 h-32 md:h-auto bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                  {post.title}
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    post.published
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}
                >
                  {post.published ? '已发布' : '草稿'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                {post.excerpt}
              </p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 4 && (
                    <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                      +{post.tags.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime} 分钟阅读
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views} 次浏览
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={onTogglePublish}
                className={`p-2 rounded-lg transition-colors ${
                  post.published
                    ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                title={post.published ? '取消发布' : '发布'}
              >
                {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Blog Editor Modal Component
interface BlogEditorModalProps {
  isEditing: boolean;
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
  newTag: string;
  setNewTag: (value: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  onSave: () => void;
  onClose: () => void;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  saveMessage: string;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  existingTags: string[];
}

function BlogEditorModal({
  isEditing,
  formData,
  setFormData,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  onSave,
  onClose,
  saveStatus,
  saveMessage,
  showPreview,
  setShowPreview,
  existingTags,
}: BlogEditorModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Extract headings from markdown content
  useEffect(() => {
    if (!formData.content) return;

    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const extractedHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(formData.content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      extractedHeadings.push({ id, text, level });
    }

    setHeadings(extractedHeadings);
  }, [formData.content]);

  // Update active heading and scroll progress on scroll
  useEffect(() => {
    if (!contentRef.current || !showPreview) return;

    const content = contentRef.current;
    const contentTop = content.offsetTop;
    const contentHeight = content.scrollHeight;
    const viewportHeight = window.innerHeight;

    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY - contentTop;
      const progress = Math.max(0, Math.min(100, (scrollTop / (contentHeight - viewportHeight)) * 100));
      setScrollProgress(progress);

      // Find active heading
      let activeHeadingId = '';
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            activeHeadingId = heading.id;
          }
        }
      }

      if (activeHeadingId) {
        setActiveId(activeHeadingId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings, showPreview]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditing ? '编辑文章' : '新建文章'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showPreview
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showPreview ? '编辑' : '预览'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Status Message */}
          {saveStatus !== 'idle' && saveStatus !== 'saving' && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                saveStatus === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              }`}
            >
              {saveStatus === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {saveMessage}
            </div>
          )}

          {showPreview ? (
            /* Preview Mode */
            <div className="flex gap-6">
              {/* Main content */}
              <div ref={contentRef} className="flex-1 prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:text-gray-600 dark:prose-p:text-gray-300
                prose-a:text-blue-500 hover:prose-a:text-blue-600
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:text-emerald-700 dark:prose-code:text-emerald-400
                prose-code:bg-emerald-50 dark:prose-code:bg-gray-800
                prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-emerald-50 prose-pre:border prose-pre:border-emerald-200
                dark:prose-pre:bg-gray-900 dark:prose-pre:border-gray-700
                prose-pre:text-emerald-800 dark:prose-pre:text-gray-100
                prose-blockquote:border-blue-500
                prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-img:rounded-xl prose-img:shadow-lg
                prose-hr:border-gray-200 dark:prose-hr:border-gray-700
                prose-table:border-collapse
                prose-th:bg-gray-100 dark:prose-th:bg-gray-800
                prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700
                prose-th:px-4 prose-th:py-2
                prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
                prose-td:px-4 prose-td:py-2
                prose-ul:list-disc prose-ol:list-decimal
                prose-li:text-gray-600 dark:prose-li:text-gray-300
                prose-h2:before:content-none prose-h3:before:content-none
                prose-h2:scroll-mt-24 prose-h3:scroll-mt-24">
                <h1 className="text-2xl font-bold mb-4">{formData.title || '无标题'}</h1>
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="w-full max-h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-gray-600 dark:text-gray-400 italic mb-4">{formData.excerpt}</p>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h2: ({ node, ...props }) => (
                      <h2 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
                    ),
                    h5: ({ node, ...props }) => (
                      <h5 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
                    ),
                    h6: ({ node, ...props }) => (
                      <h6 {...props} id={props.children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')} />
                    ),
                  }}
                >
                  {formData.content}
                </ReactMarkdown>
              </div>

              {/* Table of Contents sidebar */}
              <div className="hidden lg:block w-72 sticky top-4 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-150 ease-out rounded"
                      style={{ width: `${scrollProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {Math.round(scrollProgress)}%
                  </p>
                </div>

                {/* TOC */}
                <nav className="glass rounded-2xl p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Menu className="w-4 h-4" />
                    目录
                  </h3>
                  <ul className="space-y-1">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <button
                          onClick={() => scrollToHeading(heading.id)}
                          className={`w-full text-left text-xs transition-all duration-200 hover:text-indigo-500 dark:hover:text-indigo-400 py-1 ${
                            activeId === heading.id
                              ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500 pl-2'
                              : `text-gray-600 dark:text-gray-400 ${
                                  heading.level === 2 ? 'ml-0' : heading.level === 3 ? 'ml-3' : 'ml-6'
                                }`
                          }`}
                        >
                          {heading.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文章标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入文章标题..."
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  封面图片
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="图片URL..."
                  />
                  {formData.featuredImage && (
                    <button
                      onClick={() => setFormData({ ...formData, featuredImage: '' })}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {formData.featuredImage && (
                  <div className="mt-2 relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={formData.featuredImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文章摘要 * <span className="text-gray-400 font-normal">({formData.excerpt.length}/500)</span>
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="简短描述文章内容..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文章内容 * <span className="text-gray-400 font-normal">(支持 Markdown 格式)</span>
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  {/* Markdown Toolbar */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                    <MarkdownButton
                      label="B"
                      title="粗体"
                      onClick={() => insertMarkdown('**', '**')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <MarkdownButton
                      label="I"
                      title="斜体"
                      onClick={() => insertMarkdown('*', '*')}
                      formData={formData}
                      setFormData={setFormData}
                      italic
                    />
                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <MarkdownButton
                      label="H1"
                      title="一级标题"
                      onClick={() => insertMarkdown('# ', '')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <MarkdownButton
                      label="H2"
                      title="二级标题"
                      onClick={() => insertMarkdown('## ', '')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <MarkdownButton
                      label="H3"
                      title="三级标题"
                      onClick={() => insertMarkdown('### ', '')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <MarkdownButton
                      label="<>"
                      title="代码"
                      onClick={() => insertMarkdown('`', '`')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <MarkdownButton
                      label="```"
                      title="代码块"
                      onClick={() => insertMarkdown('```\n', '\n```')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <MarkdownButton
                      label="🔗"
                      title="链接"
                      onClick={() => insertMarkdown('[', '](url)')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <MarkdownButton
                      label="🖼"
                      title="图片"
                      onClick={() => insertMarkdown('![alt](', ')')}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </div>
                  <textarea
                    id="content-editor"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none focus:outline-none font-mono text-sm"
                    placeholder="使用 Markdown 格式编写文章内容...

# 标题
## 二级标题

**粗体** 和 *斜体*

- 列表项
- 列表项

`代码` 和代码块：
```
代码块
```

[链接](https://example.com)
![图片](https://example.com/image.jpg)"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标签
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="添加标签..."
                    list="existing-tags"
                  />
                  <datalist id="existing-tags">
                    {existingTags.filter(t => !formData.tags.includes(t)).map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Published */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">立即发布</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  {formData.published ? '文章将对所有访问者可见' : '文章将保存为草稿，仅管理员可见'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? '保存更改' : '创建文章'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to insert markdown syntax
function insertMarkdown(before: string, after: string) {
  const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);

  const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
  
  // Update the textarea value
  textarea.value = newText;
  
  // Trigger change event
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);

  // Set cursor position
  textarea.focus();
  const newCursorPos = start + before.length + selectedText.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
}

// Markdown Toolbar Button
interface MarkdownButtonProps {
  label: string;
  title: string;
  onClick: () => void;
  formData: BlogFormData;
  setFormData: (data: BlogFormData) => void;
  italic?: boolean;
}

function MarkdownButton({ label, title, onClick, italic }: MarkdownButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded ${
        italic ? 'italic' : ''
      }`}
    >
      {label}
    </button>
  );
}
