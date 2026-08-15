/**
 * اختبارات Authentication Functions
 *
 * يغطي الدوال الأساسية في authentication:
 * - bcrypt: تشفير كلمات المرور
 * - jwt: إنشاء والتحقق من التوكنات
 *
 * @module auth.test
 */

import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Functions - Auth Tests', () => {
  describe('bcrypt password hashing', () => {
    it('يجب أن يشفر كلمة المرور بنجاح', async () => {
      // Arrange
      const password = 'password123';
      const saltRounds = 10;

      // Act
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it('يجب أن يتحقق من كلمة المرور بنجاح', async () => {
      // Arrange
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      // Act
      const isValid = await bcrypt.compare(password, hashedPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('يجب أن يفشل التحقق مع كلمة مرور خاطئة', async () => {
      // Arrange
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 10);

      // Act
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('JWT token creation and verification', () => {
    const JWT_SECRET = 'test-secret-key';

    it('يجب أن ينشئ توكن JWT بنجاح', () => {
      // Arrange
      const payload = {
        userId: 1,
        username: 'testuser',
        role: 'admin',
      };

      // Act
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('يجب أن يتحقق من التوكن بنجاح', () => {
      // Arrange
      const payload = {
        userId: 1,
        username: 'testuser',
        role: 'admin',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      // Act
      const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;

      // Assert
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testuser');
      expect(decoded.role).toBe('admin');
    });

    it('يجب أن يفشل التحقق مع توكن غير صالح', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    it('يجب أن يفشل التحقق مع سر خاطئ', () => {
      // Arrange
      const payload = { userId: 1 };
      const token = jwt.sign(payload, JWT_SECRET);
      const wrongSecret = 'wrong-secret';

      // Act & Assert
      expect(() => {
        jwt.verify(token, wrongSecret);
      }).toThrow();
    });
  });
});
