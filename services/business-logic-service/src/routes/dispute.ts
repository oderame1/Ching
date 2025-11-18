import { Router } from 'express';
import { createDisputeController } from '../controllers/dispute/createDispute';
import { getDisputeController } from '../controllers/dispute/getDispute';
import { updateDisputeController } from '../controllers/dispute/updateDispute';
import { resolveDisputeController } from '../controllers/dispute/resolveDispute';

export const disputeRoutes = Router();

disputeRoutes.post('/', createDisputeController);
disputeRoutes.get('/:id', getDisputeController);
disputeRoutes.patch('/:id', updateDisputeController);
disputeRoutes.post('/:id/resolve', resolveDisputeController);

