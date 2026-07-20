/**
 * اختبارات Audit Logs Router
 * Audit Logs Router Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuditLog, auditLogsRouter } from '../../routers/auditLogs';
import { getDb } from '../../database/db';
import { auditLogs } from '../../../drizzle/schema';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { TrpcContext } from '../../_core/context';

// Mock dependencies
vi.mock('../../database/db');
vi.mock('../../_core/logger');

describe('createAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن ينشئ سجل تدقيق جديد', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    await createAuditLog({
      entityType: 'lead',
      entityId: 1,
      action: 'create',
      oldValue: null,
      newValue: '{"name":"test"}',
      userId: 1,
      userName: 'test user',
      notes: 'test note',
    });

    expect(mockDb.insert).toHaveBeenCalledWith(auditLogs);
    expect(mockDb.values).toHaveBeenCalledWith({
      entityType: 'lead',
      entityId: 1,
      action: 'create',
      oldValue: null,
      newValue: '{"name":"test"}',
      userId: 1,
      userName: 'test user',
      notes: 'test note',
    });
  });

  it('يجب أن يتعامل مع قيم null بشكل صحيح', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    await createAuditLog({
      entityType: 'lead',
      entityId: 1,
      action: 'create',
    });

    expect(mockDb.values).toHaveBeenCalledWith({
      entityType: 'lead',
      entityId: 1,
      action: 'create',
      oldValue: null,
      newValue: null,
      userId: null,
      userName: null,
      notes: null,
    });
  });

  it('يجب أن يرجع بدون قيمة عندما db غير متاح', async () => {
    vi.mocked(getDb).mockResolvedValue(null);

    const result = await createAuditLog({
      entityType: 'lead',
      entityId: 1,
      action: 'create',
    });

    expect(result).toBeUndefined();
  });
});

describe('auditLogsRouter - getByEntity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يجلب سجلات التدقيق لكيان محدد', async () => {
    const mockLogs = [
      {
        id: 1,
        entityType: 'lead',
        entityId: 1,
        action: 'create',
        oldValue: null,
        newValue: '{"name":"test"}',
        userId: 1,
        userName: 'test user',
        notes: null,
        createdAt: new Date(),
      },
    ];
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockLogs),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.getByEntity({
      entityType: 'lead',
      entityId: 1,
    });

    expect(result).toEqual(mockLogs);
  });

  it('يجب أن يرجع مصفوفة فارغة عندما db غير متاح', async () => {
    vi.mocked(getDb).mockResolvedValue(null);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.getByEntity({
      entityType: 'lead',
      entityId: 1,
    });

    expect(result).toEqual([]);
  });

  it('يجب أن يتحقق من المدخلات', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    // Test with invalid entityType type (string is required)
    await expect(
      caller.getByEntity({
        entityType: 123 as unknown as string,
        entityId: 1,
      })
    ).rejects.toThrow();
  });
});

describe('auditLogsRouter - listPaginated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يجلب سجلات التدقيق مع pagination', async () => {
    const mockLogs = [
      {
        id: 1,
        entityType: 'lead',
        entityId: 1,
        action: 'create',
        oldValue: null,
        newValue: '{"name":"test"}',
        userId: 1,
        userName: 'test user',
        notes: null,
        createdAt: new Date(),
      },
    ];
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue(mockLogs),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.listPaginated({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      logs: mockLogs,
      total: 0,
    });
  });

  it('يجب أن يطبق فلاتر entityType', async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await caller.listPaginated({
      page: 1,
      limit: 10,
      entityType: 'lead',
    });

    expect(mockDb.where).toHaveBeenCalled();
  });

  it('يجب أن يطبق فلاتر action', async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await caller.listPaginated({
      page: 1,
      limit: 10,
      action: 'create',
    });

    expect(mockDb.where).toHaveBeenCalled();
  });

  it('يجب أن يطبق فلاتر userId', async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await caller.listPaginated({
      page: 1,
      limit: 10,
      userId: 1,
    });

    expect(mockDb.where).toHaveBeenCalled();
  });

  it('يجب أن يرجع { logs: [], total: 0 } عندما db غير متاح', async () => {
    vi.mocked(getDb).mockResolvedValue(null);

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.listPaginated({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      logs: [],
      total: 0,
    });
  });

  it('يجب أن يستخدم القيم الافتراضية للمدخلات', async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.listPaginated({});

    expect(result).toBeDefined();
  });

  it('يجب أن يتحقق من page >= 1', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.listPaginated({
        page: 0,
        limit: 10,
      })
    ).rejects.toThrow();
  });

  it('يجب أن يتحقق من limit بين 1 و 500', async () => {
    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await expect(
      caller.listPaginated({
        page: 1,
        limit: 0,
      })
    ).rejects.toThrow();

    await expect(
      caller.listPaginated({
        page: 1,
        limit: 501,
      })
    ).rejects.toThrow();
  });
});

describe('auditLogsRouter - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يتعامل مع سجلات متعددة لنفس الكيان', async () => {
    const mockLogs = [
      { id: 1, entityType: 'lead', entityId: 1, action: 'create', createdAt: new Date() },
      { id: 2, entityType: 'lead', entityId: 1, action: 'update', createdAt: new Date() },
    ];
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(mockLogs),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    const result = await caller.getByEntity({
      entityType: 'lead',
      entityId: 1,
    });

    expect(result).toHaveLength(2);
  });

  it('يجب أن يرتب السجلات حسب التاريخ تنازلياً', async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await caller.listPaginated({
      page: 1,
      limit: 10,
    });

    expect(mockDb.orderBy).toHaveBeenCalled();
  });

  it('يجب أن يحسب offset بشكل صحيح', async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(getDb).mockImplementation(() => Promise.resolve(mockDb as unknown as typeof getDb extends (...args: unknown[]) => infer R ? R : never));

    const mockReq: CreateExpressContextOptions['req'] = {
      headers: {},
      get: vi.fn(),
    } as unknown as CreateExpressContextOptions['req'];
    
    const mockRes: CreateExpressContextOptions['res'] = {
      headers: {},
      getHeader: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as CreateExpressContextOptions['res'];

    const caller = auditLogsRouter.createCaller({
      req: mockReq,
      res: mockRes,
      user: { 
        id: 1, 
        role: 'admin',
        name: 'test user',
        openId: null,
        username: 'testuser',
        password: 'hashed',
        email: 'test@example.com',
        loginMethod: null,
        isActive: 'yes',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: null,
      },
    } as TrpcContext);

    await caller.listPaginated({
      page: 3,
      limit: 20,
    });

    expect(mockDb.offset).toHaveBeenCalledWith(40);
  });
});
