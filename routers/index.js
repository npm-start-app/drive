import Router from 'express'
import driveRouter from './driveRouter.js'
import codingRouter from './textCodingRouter.js'
import initRouter from './initRouter.js'

const router = new Router()

router.use('/drive', driveRouter)
router.use('/textCoding', codingRouter)
router.use('/init', initRouter)
router.get('/', async (req, res) => {
    return res.json({
        'status': true
    })
})

export default router