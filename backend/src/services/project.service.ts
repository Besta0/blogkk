import { MySQLDataSource } from '../config/database';
import { Project } from '../models/project.model';
import { Like, FindOptionsWhere } from 'typeorm';

export interface ProjectQuery {
  page?: number;
  limit?: number;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class ProjectService {
  private static get repository() {
    return MySQLDataSource.getRepository(Project);
  }

  static async getProjects(query: ProjectQuery = {}): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, featured, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Project> = {};
    
    if (featured !== undefined) {
      where.featured = featured;
    }

    const queryBuilder = this.repository.createQueryBuilder('project');

    if (featured !== undefined) {
      queryBuilder.andWhere('project.featured = :featured', { featured });
    }

    if (search) {
      queryBuilder.andWhere(
        '(project.title LIKE :search OR project.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy(`project.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [projects, total] = await queryBuilder.getManyAndCount();

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getProjectById(id: string): Promise<Project | null> {
    return this.repository.findOne({ where: { id } });
  }

  static async createProject(data: {
    title: string;
    description: string;
    technologies: string[];
    images?: string[];
    githubUrl?: string;
    liveUrl?: string;
    featured?: boolean;
  }): Promise<Project> {
    const project = this.repository.create(data);
    return this.repository.save(project);
  }

  static async updateProject(id: string, data: Partial<{
    title: string;
    description: string;
    technologies: string[];
    images: string[];
    githubUrl: string;
    liveUrl: string;
    featured: boolean;
  }>): Promise<Project | null> {
    const project = await this.getProjectById(id);
    if (!project) {
      return null;
    }

    Object.assign(project, data);
    return this.repository.save(project);
  }

  static async deleteProject(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  static async incrementViews(id: string): Promise<void> {
    await this.repository.increment({ id }, 'views', 1);
  }

  static async incrementLikes(id: string): Promise<Project | null> {
    const project = await this.repository.findOne({ where: { id } });
    if (!project) return null;
    
    project.likes += 1;
    return this.repository.save(project);
  }

  static async getFeaturedProjects(limit: number = 6): Promise<Project[]> {
    return this.repository.find({
      where: { featured: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  static async incrementShares(id: string): Promise<Project | null> {
    const project = await this.repository.findOne({ where: { id } });
    if (!project) return null;
    
    project.shares += 1;
    return this.repository.save(project);
  }

  static async getAllTechnologies(): Promise<string[]> {
    const projects = await this.repository.find({
      select: ['technologies'],
    });

    const allTechnologies = new Set<string>();
    projects.forEach(project => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => allTechnologies.add(tech));
      }
    });

    return Array.from(allTechnologies).sort();
  }
}
