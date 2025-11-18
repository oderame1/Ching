import { Router } from 'express';
import { transferController } from '../controllers/transfer/transfer';
import { refundController } from '../controllers/transfer/refund';
import { getTransactionController } from '../controllers/transfer/getTransaction';

export const transferRoutes = Router();

transferRoutes.post('/', transferController);
transferRoutes.post('/refund', refundController);
transferRoutes.get('/:id', getTransactionController);

