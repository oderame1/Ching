import { Router } from 'express';
import { checkFraudController } from '../controllers/checkFraud';
import { addToBlacklistController } from '../controllers/addToBlacklist';
import { getBlacklistController } from '../controllers/getBlacklist';
import { removeFromBlacklistController } from '../controllers/removeFromBlacklist';

export const fraudRoutes = Router();

fraudRoutes.post('/check', checkFraudController);
fraudRoutes.post('/blacklist', addToBlacklistController);
fraudRoutes.get('/blacklist', getBlacklistController);
fraudRoutes.delete('/blacklist/:id', removeFromBlacklistController);

