/**
 * 前端界面测试 - 关于、项目、博客部分
 * 测试这三个部分是否正确渲染到前端界面
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock framer-motion completely
vi.mock('framer-motion', () => {
  const createMockComponent = (tag: string) => {
    return ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      // Filter out framer-motion specific props
      const filteredProps: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(props)) {
        if (!['variants', 'initial', 'animate', 'exit', 'whileHover', 'whileTap', 'transition', 'layout', 'style'].includes(key)) {
          filteredProps[key] = value
        }
      }
      const Tag = tag as keyof JSX.IntrinsicElements
      return <Tag {...filteredProps}>{children}</Tag>
    }
  }

  return {
    motion: {
      div: createMockComponent('div'),
      h2: createMockComponent('h2'),
      p: createMockComponent('p'),
      span: createMockComponent('span'),
      a: createMockComponent('a'),
      article: createMockComponent('article'),
      form: createMockComponent('form'),
      button: createMockComponent('button'),
      img: createMockComponent('img'),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    useInView: () => true,
  }
})

// Mock LazyImage component
vi.mock('../components/LazyImage', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} data-testid="lazy-image" />
  ),
}))

// Mock MagneticButton component
vi.mock('../components/MagneticButton', () => ({
  default: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

// Mock ShareButton component
vi.mock('../components/ShareButton', () => ({
  default: () => <button data-testid="share-button">分享</button>,
}))

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

// Mock API hooks
vi.mock('../api/hooks/useProjects', () => ({
  useProjects: () => ({
    data: {
      projects: [
        {
          _id: '1',
          title: '测试项目1',
          description: '这是测试项目1的描述内容',
          technologies: ['React', 'TypeScript'],
          images: ['https://example.com/img1.jpg'],
          githubUrl: 'https://github.com/test/project1',
          liveUrl: 'https://project1.com',
          featured: true,
          likes: 10,
          views: 100,
          shares: 5,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useTechnologies: () => ({
    data: { technologies: ['React', 'Vue', 'Node.js'] },
    isLoading: false,
  }),
  useLikeProject: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useShareProject: () => ({
    mutate: vi.fn(),
  }),
  useRecordProjectView: () => ({
    mutate: vi.fn(),
  }),
}))

vi.mock('../api/hooks/useBlog', () => ({
  useBlogPosts: () => ({
    data: {
      posts: [
        {
          _id: '1',
          title: '测试博客文章1',
          slug: 'test-blog-1',
          excerpt: '这是测试博客文章1的摘要',
          content: '这是测试博客文章1的内容',
          tags: ['React', '教程'],
          published: true,
          featuredImage: 'https://example.com/blog1.jpg',
          readTime: 5,
          views: 100,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          publishedAt: '2024-01-01',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useBlogTags: () => ({
    data: { tags: ['React', 'JavaScript', '教程'] },
    isLoading: false,
  }),
}))

vi.mock('../api/hooks/useProfile', () => ({
  useProfile: () => ({
    data: {
      name: '测试用户',
      title: '全栈开发者',
      bio: '这是测试简介，描述用户的背景和技能。',
      avatar: 'https://example.com/avatar.jpg',
      skills: ['React', 'TypeScript', 'Node.js'],
      socialLinks: {},
    },
    isLoading: false,
    isError: false,
  }),
}))

// Import components after mocks
import AboutSection from '../components/AboutSection'
import ProjectsSection from '../components/ProjectsSection'
import BlogSection from '../components/BlogSection'

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })
}

// Wrapper component with QueryClientProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('前端界面测试 - 关于、项目、博客部分', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AboutSection - 关于部分', () => {
    it('应该渲染关于部分的 section 元素', () => {
      render(
        <TestWrapper>
          <AboutSection />
        </TestWrapper>
      )

      const section = document.getElementById('about')
      expect(section).toBeInTheDocument()
      expect(section?.tagName.toLowerCase()).toBe('section')
    })

    it('应该包含关于我的标题', async () => {
      render(
        <TestWrapper>
          <AboutSection />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/关于我/i)).toBeInTheDocument()
      })
    })
  })

  describe('ProjectsSection - 项目部分', () => {
    it('应该渲染项目部分的 section 元素', () => {
      render(
        <TestWrapper>
          <ProjectsSection />
        </TestWrapper>
      )

      const section = document.getElementById('projects')
      expect(section).toBeInTheDocument()
      expect(section?.tagName.toLowerCase()).toBe('section')
    })

    it('应该显示精选项目标题', async () => {
      render(
        <TestWrapper>
          <ProjectsSection />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/精选项目/i)).toBeInTheDocument()
      })
    })

    it('应该显示项目数据', async () => {
      render(
        <TestWrapper>
          <ProjectsSection />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('测试项目1')).toBeInTheDocument()
      })
    })

    it('应该显示技术筛选按钮', async () => {
      render(
        <TestWrapper>
          <ProjectsSection />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('全部')).toBeInTheDocument()
      })
    })
  })

  describe('BlogSection - 博客部分', () => {
    it('应该渲染博客部分的 section 元素', () => {
      render(
        <TestWrapper>
          <BlogSection />
        </TestWrapper>
      )

      const section = document.getElementById('blog')
      expect(section).toBeInTheDocument()
      expect(section?.tagName.toLowerCase()).toBe('section')
    })

    it('应该显示技术博客标题', async () => {
      render(
        <TestWrapper>
          <BlogSection />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/技术博客/i)).toBeInTheDocument()
      })
    })

    it('应该显示博客文章', async () => {
      render(
        <TestWrapper>
          <BlogSection />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('测试博客文章1')).toBeInTheDocument()
      })
    })

    it('应该显示搜索框', async () => {
      render(
        <TestWrapper>
          <BlogSection />
        </TestWrapper>
      )

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/搜索文章/i)
        expect(searchInput).toBeInTheDocument()
      })
    })
  })

  describe('页面锚点导航测试', () => {
    it('所有部分都应该有正确的锚点 ID', () => {
      const { rerender } = render(
        <TestWrapper>
          <AboutSection />
        </TestWrapper>
      )
      expect(document.getElementById('about')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <ProjectsSection />
        </TestWrapper>
      )
      expect(document.getElementById('projects')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <BlogSection />
        </TestWrapper>
      )
      expect(document.getElementById('blog')).toBeInTheDocument()
    })
  })
})
