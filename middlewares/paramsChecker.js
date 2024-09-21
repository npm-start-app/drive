import { fileTypeFromBuffer } from 'file-type';
import { v4 as uuidv4 } from 'uuid';

class ParamsChecker {
    static allowedFiles = {
        'jpg': [],
        'png': [],
        'cfb': ['doc'],
        'docx': [],
        'pdf': []
    }

    static async checkExistance(req, res, next, conf) {
        try {
            for (const config in conf) {
                for (const param of conf[config]) {
                    if (!req[config][param]) {
                        return res.status(403).json({
                            status: false,
                            result: 'ParamsError'
                        })
                    } else if (typeof req[config][param] === 'string' && (req[config][param] === 'false' || req[config][param] === 'true')){
                        req[config][param] = (req[config][param] === 'false') ? false : true
                    }

                    if (config === 'files') {
                        let result = await fileTypeFromBuffer(req[config][param]['data'])

                        // console.log(result.mime, result.ext)

                        let ext

                        if (!this.allowedFiles[result.ext]) {
                            return res.status(403).json({
                                status: false,
                                result: result.ext + ' - isnt supported'
                            })
                        } else {
                            ext = req[config][param].name.substring(req[config][param].name.lastIndexOf('.') + 1)

                            if (this.allowedFiles[result.ext].length !== 0) {
                                if (!this.allowedFiles[result.ext].includes(ext)) {
                                    return res.status(403).json({
                                        status: false,
                                        result: ext + ' - isnt supported'
                                    })
                                }
                            } else {
                                if (ext !== result.ext) {
                                    return res.status(403).json({
                                        status: false,
                                        result: ext + ' - isnt supported'
                                    })
                                }
                            }
                        }

                        req[config][param].mimetype = result.mime
                        req[config][param].name = uuidv4() + '.' + ext
                    }
                }
            }
        } catch (error) {
            return res.status(403).json({
                status: false,
                result: 'ParamsError'
            })
        }

        return next()
    }
}

export default ParamsChecker