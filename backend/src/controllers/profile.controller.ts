import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { IExperience, ISocial } from '../models/profile.model';
import { AuthRequest } from '../middleware';
import { ResponseUtil } from '../utils/response';

export class ProfileController {
  /**
   * Get public profile
   * GET /api/profile
   */
  static async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await ProfileService.getProfile();

      if (!profile) {
        ResponseUtil.notFound(res, 'Profile not found');
        return;
      }

      ResponseUtil.success(res, {
        id: profile._id,
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        avatar: profile.avatar,
        skills: profile.skills,
        experience: profile.experience,
        social: profile.social,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile (full update)
   * PUT /api/profile
   */
  static async updateProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, title, bio, avatar, skills, experience, social } = req.body;

      // Validate required fields for full update
      if (!name || !title || !bio || !avatar) {
        ResponseUtil.validationError(res, 'Name, title, bio, and avatar are required');
        return;
      }

      // Validate name length
      if (name.length < 2 || name.length > 100) {
        ResponseUtil.validationError(res, 'Name must be between 2 and 100 characters');
        return;
      }

      // Validate title length
      if (title.length > 200) {
        ResponseUtil.validationError(res, 'Title cannot exceed 200 characters');
        return;
      }

      // Validate bio length
      if (bio.length > 2000) {
        ResponseUtil.validationError(res, 'Bio cannot exceed 2000 characters');
        return;
      }

      // Validate skills array
      if (skills && !Array.isArray(skills)) {
        ResponseUtil.validationError(res, 'Skills must be an array');
        return;
      }

      if (skills && skills.length > 50) {
        ResponseUtil.validationError(res, 'Cannot have more than 50 skills');
        return;
      }

      // Validate experience array
      if (experience && !Array.isArray(experience)) {
        ResponseUtil.validationError(res, 'Experience must be an array');
        return;
      }

      const profile = await ProfileService.updateProfile({
        name,
        title,
        bio,
        avatar,
        skills: skills || [],
        experience: experience || [],
        social: social || {},
      });

      if (!profile) {
        ResponseUtil.notFound(res, 'Profile not found');
        return;
      }

      ResponseUtil.success(res, {
        id: profile._id,
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        avatar: profile.avatar,
        skills: profile.skills,
        experience: profile.experience,
        social: profile.social,
      });
    } catch (error) {
      // Handle Mongoose validation errors
      if (error instanceof Error && error.name === 'ValidationError') {
        ResponseUtil.validationError(res, error.message);
        return;
      }
      next(error);
    }
  }

  /**
   * Partial update profile
   * PATCH /api/profile
   */
  static async patchProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, title, bio, avatar, skills, experience, social } = req.body;

      // Validate name if provided
      if (name !== undefined) {
        if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
          ResponseUtil.validationError(res, 'Name must be between 2 and 100 characters');
          return;
        }
      }

      // Validate title if provided
      if (title !== undefined && title.length > 200) {
        ResponseUtil.validationError(res, 'Title cannot exceed 200 characters');
        return;
      }

      // Validate bio if provided
      if (bio !== undefined && bio.length > 2000) {
        ResponseUtil.validationError(res, 'Bio cannot exceed 2000 characters');
        return;
      }

      // Validate skills if provided
      if (skills !== undefined) {
        if (!Array.isArray(skills)) {
          ResponseUtil.validationError(res, 'Skills must be an array');
          return;
        }
        if (skills.length > 50) {
          ResponseUtil.validationError(res, 'Cannot have more than 50 skills');
          return;
        }
      }

      // Validate experience if provided
      if (experience !== undefined && !Array.isArray(experience)) {
        ResponseUtil.validationError(res, 'Experience must be an array');
        return;
      }

      const updateData: Partial<{
        name: string;
        title: string;
        bio: string;
        avatar: string;
        skills: string[];
        experience: IExperience[];
        social: ISocial;
      }> = {};
      if (name !== undefined) updateData.name = name;
      if (title !== undefined) updateData.title = title;
      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (skills !== undefined) updateData.skills = skills;
      if (experience !== undefined) updateData.experience = experience;
      if (social !== undefined) updateData.social = social;

      const profile = await ProfileService.updateProfile(updateData);

      if (!profile) {
        ResponseUtil.notFound(res, 'Profile not found. Create a profile first.');
        return;
      }

      ResponseUtil.success(res, {
        id: profile._id,
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        avatar: profile.avatar,
        skills: profile.skills,
        experience: profile.experience,
        social: profile.social,
      });
    } catch (error) {
      // Handle Mongoose validation errors
      if (error instanceof Error && error.name === 'ValidationError') {
        ResponseUtil.validationError(res, error.message);
        return;
      }
      next(error);
    }
  }
}
