/**
 * اختبارات Comments Router
 * Comments Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentsRouter } from '../../routers/comments';
import type { ResultSetHeader } from 'mysql2';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { TrpcContext } from '../../_core/context';

// Mock dependencies
vi.mock('../../tasks/comments');

describe('commentsRouter - getByEntity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يجلب التعليقات لكيان محدد', async () => {
    const { getCommentsByEntity } = await import('../../tasks/comments');
    vi.mocked(getCommentsByEntity).mockResolvedValue([
      {
        id: 1,
        entityType: 'appointment',
        entityId: 1,
        content: 'test comment',
        userId: 1,
        userName: 'test user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.getByEntity({
      entityType: 'appointment',
      entityId: 1,
    });

    expect(getCommentsByEntity).toHaveBeenCalledWith('appointment', 1);
    expect(result).toHaveLength(1);
  });

  it('يجب أن يتحقق من entityType صالح', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.getByEntity({
        entityType: 'invalid' as 'appointment' | 'lead' | 'offerLead' | 'campRegistration',
        entityId: 1,
      })
    ).rejects.toThrow();
  });

  it('يجب أن يتحقق من entityId رقم', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.getByEntity({
        entityType: 'appointment',
        entityId: 'invalid' as unknown as number,
      })
    ).rejects.toThrow();
  });
});

describe('commentsRouter - add', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يضيف تعليقاً جديداً', async () => {
    const { addComment } = await import('../../tasks/comments');
    vi.mocked(addComment).mockResolvedValue({ insertId: 1, affectedRows: 1 } as ResultSetHeader);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.add({
      entityType: 'appointment',
      entityId: 1,
      content: 'test comment',
    });

    expect(addComment).toHaveBeenCalledWith({
      entityType: 'appointment',
      entityId: 1,
      content: 'test comment',
      userId: 1,
      userName: 'test user',
    });
    expect(result).toBeDefined();
  });

  it('يجب أن يستخدم username عندما name غير متوفر', async () => {
    const { addComment } = await import('../../tasks/comments');
    vi.mocked(addComment).mockResolvedValue({ insertId: 1, affectedRows: 1 } as ResultSetHeader);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: null,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    });

    await caller.add({
      entityType: 'appointment',
      entityId: 1,
      content: 'test comment',
    });

    expect(addComment).toHaveBeenCalledWith({
      entityType: 'appointment',
      entityId: 1,
      content: 'test comment',
      userId: 1,
      userName: 'testuser',
    });
  });

  it('يجب أن يستخدم "مستخدم" عندما name و username غير متوفرين', async () => {
    const { addComment } = await import('../../tasks/comments');
    vi.mocked(addComment).mockResolvedValue({ insertId: 1, affectedRows: 1 } as ResultSetHeader);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await caller.add({
      entityType: 'appointment',
      entityId: 1,
      content: 'test comment',
    });

    expect(addComment).toHaveBeenCalledWith({
      entityType: 'appointment',
      entityId: 1,
      content: 'test comment',
      userId: 1,
      userName: 'test user',
    });
  });

  it('يجب أن يتحقق من أن المحتوى غير فارغ', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.add({
        entityType: 'appointment',
        entityId: 1,
        content: '',
      })
    ).rejects.toThrow();
  });

  it('يجب أن يتحقق من entityType صالح', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.add({
        entityType: 'invalid' as 'appointment' | 'lead' | 'offerLead' | 'campRegistration',
        entityId: 1,
        content: 'test comment',
      })
    ).rejects.toThrow();
  });
});

describe('commentsRouter - delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يحذف تعليقاً', async () => {
    const { deleteComment } = await import('../../tasks/comments');
    vi.mocked(deleteComment).mockResolvedValue({ success: true });

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.delete({
      commentId: 1,
    });

    expect(deleteComment).toHaveBeenCalledWith(1, 1, true);
    expect(result.success).toBe(true);
  });

  it('يجب أن يمرر isAdmin=true للمستخدمين الإداريين', async () => {
    const { deleteComment } = await import('../../tasks/comments');
    vi.mocked(deleteComment).mockResolvedValue({ success: true });

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await caller.delete({
      commentId: 1,
    });

    expect(deleteComment).toHaveBeenCalledWith(1, 1, true);
  });

  it('يجب أن يمرر isAdmin=false للمستخدمين غير الإداريين', async () => {
    const { deleteComment } = await import('../../tasks/comments');
    vi.mocked(deleteComment).mockResolvedValue({ success: true });

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'user',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });

    await caller.delete({
      commentId: 1,
    });

    expect(deleteComment).toHaveBeenCalledWith(1, 1, false);
  });

  it('يجب أن يتحقق من commentId رقم', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.delete({
        commentId: 'invalid' as unknown as number,
      })
    ).rejects.toThrow();
  });
});

describe('commentsRouter - getCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يجلب عدد التعليقات لكيان محدد', async () => {
    const { getCommentCount } = await import('../../tasks/comments');
    vi.mocked(getCommentCount).mockResolvedValue(5);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.getCount({
      entityType: 'appointment',
      entityId: 1,
    });

    expect(getCommentCount).toHaveBeenCalledWith('appointment', 1);
    expect(result).toBe(5);
  });

  it('يجب أن يتحقق من entityType صالح', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.getCount({
        entityType: 'invalid' as 'appointment' | 'lead' | 'offerLead' | 'campRegistration',
        entityId: 1,
      })
    ).rejects.toThrow();
  });

  it('يجب أن يتحقق من entityId رقم', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.getCount({
        entityType: 'appointment',
        entityId: 'invalid' as unknown as number,
      })
    ).rejects.toThrow();
  });
});

describe('commentsRouter - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يتعامل مع أنواع الكيانات المختلفة', async () => {
    const { getCommentsByEntity } = await import('../../tasks/comments');
    vi.mocked(getCommentsByEntity).mockResolvedValue([]);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const entityTypes = ['appointment', 'lead', 'offerLead', 'campRegistration'] as const;

    for (const entityType of entityTypes) {
      await caller.getByEntity({
        entityType,
        entityId: 1,
      });
      expect(getCommentsByEntity).toHaveBeenCalledWith(entityType, 1);
    }
  });

  it('يجب أن يتعامل مع محتوى طويل', async () => {
    const { addComment } = await import('../../tasks/comments');
    vi.mocked(addComment).mockResolvedValue({ insertId: 1, affectedRows: 1 } as ResultSetHeader);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const longContent = 'a'.repeat(1000);

    await expect(
      caller.add({
        entityType: 'appointment',
        entityId: 1,
        content: longContent,
      })
    ).resolves.toBeDefined();
  });

  it('يجب أن يتعامل مع entityId صفر', async () => {
    const { getCommentsByEntity } = await import('../../tasks/comments');
    vi.mocked(getCommentsByEntity).mockResolvedValue([]);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.getByEntity({
      entityType: 'appointment',
      entityId: 0,
    });

    expect(result).toEqual([]);
  });

  it('يجب أن يتعامل مع entityId سالب', async () => {
    const { getCommentsByEntity } = await import('../../tasks/comments');
    vi.mocked(getCommentsByEntity).mockResolvedValue([]);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = commentsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: {
        id: 1,
        role: 'admin',
        name: 'test user',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed',
        openId: 'open123',
        loginMethod: 'email',
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.getByEntity({
      entityType: 'appointment',
      entityId: -1,
    });

    expect(result).toEqual([]);
  });
});
