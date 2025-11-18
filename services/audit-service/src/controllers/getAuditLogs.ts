import { Request, Response } from 'express';
import { getAuditLogs } from '../database/audit';
import { logger } from '../utils/logger';

export const getAuditLogsController = async (req: Request, res: Response) => {
  try {
    const { user_id, action, entity_type, entity_id, limit, offset } = req.query;
    
    const logs = await getAuditLogs({
      user_id: user_id as string,
      action: action as string,
      entity_type: entity_type as string,
      entity_id: entity_id as string,
      limit: limit ? parseInt(limit as string) : 100,
      offset: offset ? parseInt(offset as string) : 0,
    });
    
    res.json(logs);
  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

