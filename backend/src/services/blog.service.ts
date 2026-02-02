import { MySQLDataSource } from '../config/database';
import { BlogPost } from '../models/blogPost.model';
import { Like, Not, IsNull } from 'typeorm';

export interface BlogQuery {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
  published?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class BlogService {
  private static get repository() {
    return MySQLDataSource.getRepository(BlogPost);
  }

  static async getPosts(query: BlogQuery = {}): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, tag, search, published, sortBy = 'publishedAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('post');

    if (published !== undefined) {
      queryBuilder.andWhere('post.published = :published', { published });
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title LIKE :search OR post.excerpt LIKE :search OR post.content LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (tag) {
      // For simple-json, we need to search within the JSON string
      queryBuilder.andWhere('post.tags LIKE :tag', { tag: `%"${tag}"%` });
    }

    queryBuilder
      .orderBy(`post.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPublishedPosts(query: BlogQuery = {}): Promise<{
    posts: BlogPost[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getPosts({ ...query, published: true });
  }

  static async getPostById(id: string): Promise<BlogPost | null> {
    return this.repository.findOne({ where: { id } });
  }

  static async getPostBySlug(slug: string, publishedOnly: boolean = true): Promise<BlogPost | null> {
    const where: { slug: string; published?: boolean } = { slug };
    if (publishedOnly) {
      where.published = true;
    }
    return this.repository.findOne({ where });
  }

  static async createPost(data: {
    title: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    tags?: string[];
    published?: boolean;
  }): Promise<BlogPost> {
    // Generate slug from title
    let slug = this.generateSlug(data.title);
    
    // Check for duplicate slugs
    let counter = 0;
    let existingPost = await this.repository.findOne({ where: { slug } });
    while (existingPost) {
      counter++;
      slug = `${this.generateSlug(data.title)}-${counter}`;
      existingPost = await this.repository.findOne({ where: { slug } });
    }

    const post = this.repository.create({
      ...data,
      slug,
      publishedAt: data.published ? new Date() : undefined,
    });

    return this.repository.save(post);
  }

  static async updatePost(id: string, data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    coverImage: string;
    tags: string[];
    published: boolean;
  }>): Promise<BlogPost | null> {
    const post = await this.getPostById(id);
    if (!post) {
      return null;
    }

    // Set publishedAt when publishing for the first time
    if (data.published && !post.published) {
      (data as { publishedAt?: Date }).publishedAt = new Date();
    }

    Object.assign(post, data);
    return this.repository.save(post);
  }

  static async deletePost(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  static async incrementViews(id: string): Promise<void> {
    await this.repository.increment({ id }, 'views', 1);
  }

  static async getAllTags(): Promise<string[]> {
    const posts = await this.repository.find({
      where: { published: true },
      select: ['tags'],
    });

    const tagSet = new Set<string>();
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  }

  static async getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
    return this.repository.find({
      where: { published: true },
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
