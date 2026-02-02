import { MySQLDataSource } from '../../config/database';
import { AuthService } from '../auth.service';
import { User } from '../../models';

describe('AuthService', () => {
  let userRepository: ReturnType<typeof MySQLDataSource.getRepository<User>>;

  beforeEach(async () => {
    userRepository = MySQLDataSource.getRepository(User);
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', async () => {
      const user = userRepository.create({
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
      });
      await userRepository.save(user);

      const token = AuthService.generateAccessToken(user);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid token', async () => {
      const user = userRepository.create({
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
      });
      await userRepository.save(user);

      const token = AuthService.generateAccessToken(user);
      const payload = AuthService.verifyAccessToken(token);
      
      expect(payload.email).toBe('test@example.com');
      expect(payload.role).toBe('admin');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        AuthService.verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const user = userRepository.create({
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
      });
      await userRepository.save(user);

      const result = await AuthService.login('test@example.com', 'password123');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.user.email).toBe('test@example.com');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
      }
    });

    it('should return null for invalid email', async () => {
      const result = await AuthService.login('nonexistent@example.com', 'password123');
      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      const user = userRepository.create({
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
      });
      await userRepository.save(user);

      const result = await AuthService.login('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });
});
