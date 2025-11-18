import { Router } from 'express';
import { createEscrowController } from '../controllers/escrow/createEscrow';
import { getEscrowController } from '../controllers/escrow/getEscrow';
import { updateEscrowStatusController } from '../controllers/escrow/updateEscrowStatus';
import { releaseEscrowController } from '../controllers/escrow/releaseEscrow';
import { cancelEscrowController } from '../controllers/escrow/cancelEscrow';

export const escrowRoutes = Router();

escrowRoutes.post('/', createEscrowController);
escrowRoutes.get('/:id', getEscrowController);
escrowRoutes.patch('/:id/status', updateEscrowStatusController);
escrowRoutes.post('/:id/release', releaseEscrowController);
escrowRoutes.post('/:id/cancel', cancelEscrowController);

