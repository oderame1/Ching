import { Router } from 'express';
import { getWalletController } from '../controllers/wallet/getWallet';
import { createWalletController } from '../controllers/wallet/createWallet';
import { depositController } from '../controllers/wallet/deposit';
import { withdrawController } from '../controllers/wallet/withdraw';

export const walletRoutes = Router();

walletRoutes.get('/', getWalletController);
walletRoutes.post('/', createWalletController);
walletRoutes.post('/deposit', depositController);
walletRoutes.post('/withdraw', withdrawController);

