import Router from 'express'
const router = new Router()

import ParamsChecker from '../middlewares/paramsChecker.js'
import AuthChecker from '../middlewares/authMiddleware.js'

import DriveController from '../controllers/driveController.js'

const getFileListCONF = { headers: ['drivetoken', 'profileid'] }
const createFileCONF = { headers: ['drivetoken', 'profileid'], files: ['file'] }
const checkStructureCONF = { headers: ['drivetoken', 'profileid'], query: ['flag'] }
const getFileCONF = { headers: ['drivetoken', 'profileid'], query: ['fileId'] }
const pingCONF = { headers: ['drivetoken', 'profileid'] }
const getFolderFilesCONF = { headers: ['drivetoken', 'profileid'], query: ['folderId'] }

const createFileChunkCONF = { headers: ['drivetoken', 'profileid']}
const createMainChunkCONF = { headers: ['drivetoken', 'profileid']}

router.get('/getFileList', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, getFileListCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.getFileList)

router.get('/getFile', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, getFileCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.getFile)

router.get('/ping', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, pingCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.ping)

router.get('/getFolderFiles', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, getFolderFilesCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.getFolderFiles)

router.get('/checkStructure', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, checkStructureCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.checkStructure)

router.post('/createFile', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, createFileCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.createFile)

router.post('/createFileChunk', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, createFileChunkCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.createFileChunk)

router.post('/createMainChunk', async (req, res, next) => await ParamsChecker.checkExistance(req, res, next, createMainChunkCONF),
    async (req, res, next) => await AuthChecker.checkAuth(req, res, next, 'Admin'),
    DriveController.createMainChunk)

export default router
