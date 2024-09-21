import { readFile } from 'fs/promises';
import { checkFolderExistance, authorize } from '../drive.js';
import { toCMD } from '../another.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

class Init {
  static async drive(req, res, next, _return = true) {
    let parsedData
    let result

    const driveAuth = await authorize()
    if (!driveAuth) {
      return res.status(500).json({
        status: false,
        result: 'Server error 1'
      })
    }

    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      const data = await readFile(__dirname + '/../googleDrive_structure.json', 'utf8');

      parsedData = await JSON.parse(data);

      result = {}

      let _struc = async (fileId = 'root', _strucV = parsedData) => {
        let result = {}

        for (const struc in _strucV) {
          result[struc] = await checkFolderExistance(driveAuth, struc, fileId, req.query.flag)

          if (result[struc] === false) continue

          if (_strucV[struc] !== 1) {
            result[struc] = {
              files: await _struc(result[struc], _strucV[struc]),
              id: result[struc]
            }
          }
        }

        return result
      }

      result = await _struc()
    } catch (err) {
      console.error('File reading error:', err);
    }

    if (_return) {
      if (req.query.cmd) result = toCMD(result)

      return res.json({
        status: true,
        result: result
      })
    } else {
      return result
    }
  }
}

export default Init