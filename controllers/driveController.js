import { toCMD } from '../another.js'
import { listFiles, authorize, createFile, countFilesInFolder, getFile, getFolderFiles } from '../drive.js'
import Init from './initController.js'

class DriveController {
    static async getFileList(req, res) {
        const driveAuth = await authorize()
        if (!driveAuth) {
            return res.status(500).json({
                status: false,
                result: 'Server error'
            })
        }

        let pageSize = 20

        if (req.query.pageSize !== undefined) {
            pageSize = req.query.pageSize
        }

        let result = await listFiles(driveAuth, pageSize)
        if (!result) {
            return res.status(500).json({
                status: false,
                result: 'Server error'
            })
        }

        if (req.query.cmd) result = toCMD(result)

        return res.json({
            status: true,
            result
        })
    }

    static async createFile(req, res) {
        const { file } = req.files

        const { name, mimetype, data } = file

        if (!(name && mimetype && data)) {
            return res.status(500).json({
                status: false,
                result: 'Server error 1'
            })
        }

        const driveAuth = await authorize()
        if (!driveAuth) {
            return res.status(500).json({
                status: false,
                result: 'Server error 2'
            })
        }

        const result = await createFile(driveAuth, name, mimetype, data, (req.body.folderId === undefined) ? 'root' : req.body.folderId)
        if (!result) {
            return res.status(500).json({
                status: false,
                result: 'Server error 3'
            })
        }

        return res.json({
            status: true,
            result: result
        })
    }

    static async ping(req, res) {
        const driveAuth = await authorize()
        if (!driveAuth) {
            return res.status(500).json({
                status: false,
                result: 'Server error'
            })
        }

        return res.json({
            status: true
        })
    }

    static async checkStructure(req, res, next) {
        let result = await Init.drive(req, res, next, false)

        const driveAuth = await authorize()
        if (!driveAuth) {
            return res.status(500).json({
                status: false,
                result: 'Server error'
            })
        }

        const _fixed = ['id', 'count']

        let count = async (_result) => {
            for (const folder in _result) {
                if (!_fixed.includes(folder)) {
                    if (_result[folder] === false) {
                        continue
                    } else if (typeof _result[folder] === 'object' && !Array.isArray(_result[folder]) && _result[folder] !== null) {
                        if (_result[folder]['id'] !== undefined) {
                            _result[folder]['count'] = await countFilesInFolder(driveAuth, _result[folder]['id'])
                        }

                        await count(_result[folder])
                    } else {
                        _result[folder] = {
                            id: _result[folder],
                            count: await countFilesInFolder(driveAuth, _result[folder])
                        }
                    }
                }
            }

            return _result
        }

        result = await count(result)

        if (req.query.cmd) {
            result = toCMD(result)
        }

        return res.json({
            status: true,
            result: result
        })
    }

    static async getFile(req, res) {
        const driveAuth = await authorize()
        if (!driveAuth) {
            return res.status(500).json({
                status: false,
                result: 'Server error'
            })
        }

        const result = await getFile(driveAuth, req.query.fileId)

        return res.json({
            status: true,
            result: 'File successfully was sent',
            files: [result]
        })
    }

    static async getFolderFiles(req, res) {
        const driveAuth = await authorize()
        if (!driveAuth) {
            return res.status(500).json({
                status: false,
                result: 'Server error'
            })
        }

        const result = await getFolderFiles(driveAuth, req.query.folderId)

        return res.json({
            status: true,
            result: result
        })
    }
}

export default DriveController