import { Request, Response } from 'express';
import { getAuditLogById } from '../database/audit';
import { logger } from '../utils/logger';

export const getAuditLogByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const log = await getAuditLogById(id);
    
    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    
    res.json(log);
  } catch (error) {
    logger.error('Get audit log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

