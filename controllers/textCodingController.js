import { v4 as uuidv4 } from 'uuid'

class TextCodingController {
    static async code(req, res) {
        let uid = uuidv4()
        let _symbols = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789-+,.()/:;[] qwertyu'

        console.log(uid)

        return res.json({
            status: true
        })
    }
}

export default TextCodingController