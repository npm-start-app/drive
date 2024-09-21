import Router from 'express'
const router = new Router()

import ParamsChecker from '../middlewares/paramsChecker.js'
import AuthChecker from '../middlewares/authMiddleware.js'

import TextCodingController from '../controllers/textCodingController.js'

const codeCONF = { headers: ['drivetoken', 'profileid'] }

router.get('/code', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, codeCONF),
 async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
 TextCodingController.code)

export default router