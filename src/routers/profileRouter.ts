import express from 'express';
import cors from 'cors';
const router = express.Router()
import * as ProfileController  from '../controllers/profileController'
import {passwordUpdate, profileUpdate, userChallengeStatistics} from '../controllers/profileController';
import { verifyToken } from '../middleware/auth';

router.use(cors({
  credentials : true
}));

router.get('/', verifyToken, ProfileController.userProfile);
router.patch('/', verifyToken, ProfileController.profileUpdate);
router.get('/history', verifyToken, ProfileController.userChallengeStatistics);
router.patch('/password', verifyToken, ProfileController.passwordUpdate);
router.patch('/phone', verifyToken, ProfileController.profileUpdate);
router.patch('/email', verifyToken, ProfileController.emailUpdate);

export = router
