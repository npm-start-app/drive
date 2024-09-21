import Router from 'express'
const router = new Router()

import ParamsChecker from '../middlewares/paramsChecker.js'
import AuthChecker from '../middlewares/authMiddleware.js'

import Init from '../controllers/initController.js'

const initDriveCONF = { headers: ['drivetoken', 'profileid'], query: ['flag'] }

router.get('/drive', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, initDriveCONF),
 async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
 Init.drive)

export default router