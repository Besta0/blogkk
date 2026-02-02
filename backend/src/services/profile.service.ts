import { MySQLDataSource } from '../config/database';
import { Profile, IExperience, ISocial } from '../models/profile.model';

export class ProfileService {
  private static get repository() {
    return MySQLDataSource.getRepository(Profile);
  }

  static async getProfile(): Promise<Profile | null> {
    const profiles = await this.repository.find({ take: 1 });
    return profiles[0] || null;
  }

  static async createOrUpdateProfile(data: {
    name: string;
    title: string;
    bio: string;
    avatar: string;
    skills?: string[];
    experience?: IExperience[];
    social?: ISocial;
  }): Promise<Profile> {
    let profile = await this.getProfile();

    if (profile) {
      Object.assign(profile, data);
    } else {
      profile = this.repository.create(data);
    }

    return this.repository.save(profile);
  }

  static async updateProfile(data: Partial<{
    name: string;
    title: string;
    bio: string;
    avatar: string;
    skills: string[];
    experience: IExperience[];
    social: ISocial;
  }>): Promise<Profile | null> {
    const profile = await this.getProfile();
    if (!profile) {
      return null;
    }

    // Merge social links if provided
    if (data.social && profile.social) {
      data.social = { ...profile.social, ...data.social };
    }

    Object.assign(profile, data);
    return this.repository.save(profile);
  }
}
