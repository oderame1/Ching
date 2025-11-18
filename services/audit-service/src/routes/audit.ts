import { Router } from 'express';
import { getAuditLogsController } from '../controllers/getAuditLogs';
import { getAuditLogByIdController } from '../controllers/getAuditLogById';

export const auditRoutes = Router();

auditRoutes.get('/', getAuditLogsController);
auditRoutes.get('/:id', getAuditLogByIdController);

