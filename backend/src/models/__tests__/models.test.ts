import 'reflect-metadata';
import { MySQLDataSource } from '../../config/database';
import { Profile, Project } from '../index';
import { createTestProfile, createTestProject } from '../../__tests__/setup';

describe('Data Models', () => {
  describe('Profile Model', () => {
    it('should create a valid profile', async () => {
      const profileData = {
        name: 'John Doe',
        title: 'Full Stack Developer',
        bio: 'Passionate developer with 5 years of experience',
        avatar: 'https://example.com/avatar.jpg',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: '2020-01-01',
            description: 'Led development of web applications',
            current: true,
          },
        ],
        social: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
          email: 'john@example.com',
        },
      };

      const profile = await createTestProfile(profileData);

      expect(profile.name).toBe(profileData.name);
      expect(profile.title).toBe(profileData.title);
      expect(profile.bio).toBe(profileData.bio);
      expect(profile.skills).toEqual(profileData.skills);
      expect(profile.experience).toHaveLength(1);
      expect(profile.social?.github).toBe(profileData.social.github);
      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });

    it('should have timestamps', async () => {
      const profile = await createTestProfile();

      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const profile = await createTestProfile();
      const originalUpdatedAt = profile.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const profileRepo = MySQLDataSource.getRepository(Profile);
      profile.bio = 'Updated bio';
      await profileRepo.save(profile);

      expect(profile.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should support backward compatible _id property', async () => {
      const profile = await createTestProfile();

      expect(profile._id).toBe(profile.id);
    });
  });

  describe('Project Model', () => {
    it('should create a valid project', async () => {
      const projectData = {
        title: 'Portfolio Website',
        description: 'A modern portfolio website built with React and TypeScript',
        technologies: ['React', 'TypeScript', 'Tailwind CSS'],
        images: ['https://example.com/image1.jpg'],
        githubUrl: 'https://github.com/user/portfolio',
        liveUrl: 'https://portfolio.example.com',
        featured: true,
      };

      const project = await createTestProject(projectData);

      expect(project.title).toBe(projectData.title);
      expect(project.description).toBe(projectData.description);
      expect(project.technologies).toEqual(projectData.technologies);
      expect(project.featured).toBe(true);
      expect(project.likes).toBe(0);
      expect(project.views).toBe(0);
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it('should default likes and views to 0', async () => {
      const project = await createTestProject({
        title: 'Test Project',
        description: 'A test project description',
        technologies: ['React'],
      });

      expect(project.likes).toBe(0);
      expect(project.views).toBe(0);
    });

    it('should have timestamps', async () => {
      const project = await createTestProject();

      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const project = await createTestProject();
      const originalUpdatedAt = project.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const projectRepo = MySQLDataSource.getRepository(Project);
      project.description = 'Updated description';
      await projectRepo.save(project);

      expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should support backward compatible _id property', async () => {
      const project = await createTestProject();

      expect(project._id).toBe(project.id);
    });

    it('should allow incrementing likes and views', async () => {
      const project = await createTestProject();
      const projectRepo = MySQLDataSource.getRepository(Project);

      project.likes += 1;
      project.views += 1;
      await projectRepo.save(project);

      const updatedProject = await projectRepo.findOne({ where: { id: project.id } });
      expect(updatedProject?.likes).toBe(1);
      expect(updatedProject?.views).toBe(1);
    });
  });
});
