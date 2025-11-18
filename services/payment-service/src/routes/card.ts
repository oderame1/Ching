import { Router } from 'express';
import { addCardController } from '../controllers/card/addCard';
import { getCardsController } from '../controllers/card/getCards';
import { deleteCardController } from '../controllers/card/deleteCard';
import { chargeCardController } from '../controllers/card/chargeCard';

export const cardRoutes = Router();

cardRoutes.post('/', addCardController);
cardRoutes.get('/', getCardsController);
cardRoutes.delete('/:id', deleteCardController);
cardRoutes.post('/charge', chargeCardController);

