import { promises as fs } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

import { PassThrough } from "stream";

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = join(cwd(), 'token.json');
const CREDENTIALS_PATH = join(cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
        access_token: client.credentials.access_token,
        expiry_date: client.credentials.expiry_date,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

function isTokenExpired(credentials) {
    const expiryDate = credentials.expiry_date || 0;
    return Date.now() >= expiryDate;
}

async function authorize() {
    let client

    try {
        client = await loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await saveCredentials(client);
        }
    } catch (error) {
        return false
    }

    return client;
}

async function createFile(authClient, name, mimetype, buffer, FolderId = 'root') {
    let response

    try {
        const drive = google.drive({ version: 'v3', auth: authClient })

        const fileMetadata = {
            name: name,
            parents: [FolderId]
        };
        const media = {
            mimeType: mimetype,
            body: new PassThrough().end(buffer),
        };

        response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
    } catch (error) {
        console.log(error)
        return false
    }

    return response['data']['id']
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient, pageSize = 20) {
    let files

    try {
        const drive = google.drive({ version: 'v3', auth: authClient });
        const res = await drive.files.list({
            pageSize: pageSize,
            fields: 'nextPageToken, files(id, name)',
        });
        files = res.data.files;
        if (files.length === 0) {
            console.log('No files found.');
            return [];
        }
    } catch (error) {
        return false
    }

    return files

    // console.log('Files:');
    // files.map((file) => {
    //     console.log(`${file.name} (${file.id})`);
    // });
}

async function checkFolderExistance(authClient, Folder, id, creation = false) {
    try {
        const drive = google.drive({ version: 'v3', auth: authClient });

        const response = await drive.files.list({
            q: `'${id}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
        });

        const folderExists = response.data.files.some(file => file.name === Folder);

        if (!folderExists) {
            if (creation) {
                const folder = await drive.files.create({
                    resource: {
                        name: Folder,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [id],
                    },
                    fields: 'id',
                });
                return folder.data.id
            } else {
                return false
            }
        } else {
            for (const file of response.data.files) {
                if (file.name === Folder) {
                    return file.id
                }
            }

            return false
        }
    } catch (error) {
        console.log(error)

        return false
    }
}

async function countFilesInFolder(authClient, FolderId) {
    try {
        const drive = google.drive({ version: 'v3', auth: authClient })

        const res = await drive.files.list({
            q: `'${FolderId}' in parents and trashed=false`,
            fields: 'files(name, mimeType)'
        })

        return res.data.files.length
    } catch (error) {
        console.log(error)

        return false
    }
}

async function getFile(authClient, fileId, res) {
    try {
        const drive = google.drive({ version: 'v3', auth: authClient })

        const name = await drive.files.get({ fileId, fields: 'name, mimeType' });

        const buffer = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });

        res.set({
            'Content-Type': name.data.mimeType,
            'Content-Disposition': `attachment; filename="${name.data.name}"`,
            'Access-Control-Expose-Headers': 'Content-Disposition, Content-Type'
        });

        buffer.data.pipe(res)

        return true
    } catch (error) {
        console.log(error)

        return false
    }
}

async function getFolderFiles(authClient, FolderId) {
    try {
        const drive = google.drive({ version: 'v3', auth: authClient })

        const res = await drive.files.list({
            q: `'${FolderId}' in parents`,
            fields: 'files(id, name, mimeType)'
        });

        return res.data.files
    } catch (error) {
        console.log(error)

        return false
    }
}

export {
    listFiles,
    authorize,
    createFile,
    checkFolderExistance,
    countFilesInFolder,
    getFile,
    getFolderFiles
}
