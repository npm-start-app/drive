import { createClient } from 'redis';
import settings from '../settings.json' assert { type: "json" };

class AuthMiddleware {
    static #privateredis

    static async #privateredisConnection() {
        try {
            this.#privateredis = createClient({
                url: 'redis://default:NChjPZd1bToPVm1ZIBE0s9dUXxCaPhep@redis-18719.c258.us-east-1-4.ec2.redns.redis-cloud.com:18719'
            });

            // client.on('connect', () => {
            //     console.log('Successful connection to Redis');
            // });

            // client.on('error', (err) => {
            //     console.error('Redis connection error:', err);
            // });

            await this.#privateredis.connect()

            await this.#privateredis.ping();
        } catch (error) {
            return false
        }

        return true
    }

    static async #privateredisClose() {
        try {
            this.#privateredis.disconnect()
            this.#privateredis = null

            return true
        } catch (error) {
            this.#privateredis = null

            return false
        }
    }

    static async #privateregetValue(key) {
        let result

        try {
            result = JSON.parse(await this.#privateredis.get(key))
        } catch (error) {
            return false
        }

        return result
    }

    static async checkAuth(req, res, next, role) {
        if (!await this.#privateredisConnection()) {
            return res.status(500).json({
                status: false,
                result: 'Redis failure'
            })
        }

        let userProfile = await this.#privateregetValue(settings['profilePrefix'] + req['headers']['profileid'])
        if (!userProfile) {
            await this.#privateredisClose()

            return res.status(403).json({
                status: false,
                result: 'Auth failure'
            })
        }

        if (userProfile['driveToken'] !== req['headers']['drivetoken']) {
            await this.#privateredisClose()

            return res.status(403).json({
                status: false,
                result: 'Auth failure'
            })
        }

        await this.#privateredisClose()
        
        // try {
        //     this.#privateredis.disconnect()
        // } catch (error) {
        // }

        return next()
    }
}

export default AuthMiddleware