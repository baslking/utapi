import assert from 'assert';
import fs from 'fs';
import path from 'path';

/**
 * Reads from a config file and returns the content as a config object
 */
class Config {
    constructor() {
        /*
         * By default, the config file is "config.json" at the root.
         * It can be overridden using the UTAPI_CONFIG_FILE environment var.
         */
        this._basePath = path.resolve(__dirname, '..');
        this.path = `${this._basePath}/config.json`;
        if (process.env.UTAPI_CONFIG_FILE !== undefined) {
            this.path = process.env.UTAPI_CONFIG_FILE;
        }

        // Read config automatically
        this._getConfig();
    }

    _getConfig() {
        let config;
        try {
            const data = fs.readFileSync(this.path, { encoding: 'utf-8' });
            config = JSON.parse(data);
        } catch (err) {
            throw new Error(`could not parse config file: ${err.message}`);
        }

        this.port = 9500;
        if (config.port !== undefined) {
            assert(Number.isInteger(config.port) && config.port > 0,
                   'bad config: port must be a positive integer');
            this.port = config.port;
        }

        this.workers = 10;
        if (config.workers !== undefined) {
            assert(Number.isInteger(config.workers) && config.workers > 0,
                   'bad config: workers must be a positive integer');
            this.workers = config.workers;
        }

        this.log = { logLevel: 'debug', dumpLevel: 'error' };
        if (config.log !== undefined) {
            if (config.log.logLevel !== undefined) {
                assert(typeof config.log.logLevel === 'string',
                       'bad config: log.logLevel must be a string');
                this.log.logLevel = config.log.logLevel;
            }
            if (config.log.dumpLevel !== undefined) {
                assert(typeof config.log.dumpLevel === 'string',
                        'bad config: log.dumpLevel must be a string');
                this.log.dumpLevel = config.log.dumpLevel;
            }
        }

        this.redis = { host: '127.0.0.1', port: 6379 };
        if (config.redis) {
            assert(typeof config.redis.host === 'string',
                'bad config: redis.host must be a string');
            assert(typeof config.redis.port === 'number',
                'bad config: redis.port must be a number');
            this.redis.host = config.redis.host;
            this.redis.port = config.redis.port;
        }

        if (config.certFilePaths) {
            assert(typeof config.certFilePaths === 'object' &&
                typeof config.certFilePaths.key === 'string' &&
                typeof config.certFilePaths.cert === 'string' && ((
                    config.certFilePaths.ca &&
                    typeof config.certFilePaths.ca === 'string') ||
                    !config.certFilePaths.ca)
               );
        }
        const { key, cert, ca } = config.certFilePaths ?
            config.certFilePaths : {};
        if (key && cert) {
            const keypath = (key[0] === '/') ? key : `${this._basePath}/${key}`;
            const certpath = (cert[0] === '/') ?
                cert : `${this._basePath}/${cert}`;
            let capath = undefined;
            if (ca) {
                capath = (ca[0] === '/') ? ca : `${this._basePath}/${ca}`;
                assert.doesNotThrow(() =>
                    fs.accessSync(capath, fs.F_OK | fs.R_OK),
                    `File not found or unreachable: ${capath}`);
            }
            assert.doesNotThrow(() =>
                fs.accessSync(keypath, fs.F_OK | fs.R_OK),
                `File not found or unreachable: ${keypath}`);
            assert.doesNotThrow(() =>
                fs.accessSync(certpath, fs.F_OK | fs.R_OK),
                `File not found or unreachable: ${certpath}`);
            this.https = {
                cert: fs.readFileSync(certpath, 'ascii'),
                key: fs.readFileSync(keypath, 'ascii'),
                ca: ca ? fs.readFileSync(capath, 'ascii') : undefined,
            };
            this.httpsPath = {
                ca: capath,
                cert: certpath,
            };
        } else if (key || cert) {
            throw new Error('bad config: both certFilePaths.key and ' +
                'certFilePaths.cert must be defined');
        }

        return config;
    }
}

export default new Config();