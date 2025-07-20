import { Router } from 'express';
import createUser from '../controllers/userController/createUser';
import getUsers from '../controllers/userController/getUsers';
import getUserById from '../controllers/userController/getUserById';
import updateUser from '../controllers/userController/UpdateUser';
import deleteUser from '../controllers/userController/deleteUser';


const router = Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
