import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import createUser from '../controllers/userController/createUser';
import getUsers from '../controllers/userController/getUsers';
import getUserById from '../controllers/userController/getUserById';
import updateUser from '../controllers/userController/UpdateUser';
import deleteUser from '../controllers/userController/deleteUser';
import loginUser from '../controllers/userController/loginUser';

const router = Router();

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer?: Buffer;
}

interface MulterCallback {
    (error: Error | null, destination: string): void;
}

interface MulterFilenameCallback {
    (error: Error | null, filename: string): void;
}

const storage = multer.diskStorage({
    destination: (req: Express.Request, file: MulterFile, cb: MulterCallback) => {
        cb(null, 'uploads/');
    },
    filename: (req: Express.Request, file: MulterFile, cb: MulterFilenameCallback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});
const upload = multer({ storage });

router.post('/', upload.single('profileImage'), createUser);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);

export default router;
