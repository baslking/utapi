require 

const { UtapiClient } = require('.');

const config = {
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    localCache: {
        host: '127.0.0.1',
        port: 6379
    },
    metrics:["buckets"]
}
const c = new UtapiClient(config);

// The second argument to `pushMetric` is a hexadecimal string Request Unique
// Identifier used for logging.
//c.pushMetric('createBucket', '3d534b1511e5630e68f0', { bucket: 'demo' });

c.pushMetric('putObject', '3d534b1511e5630e68f0', {
    bucket: 'demo',
    userId: 'Me',
    accountId: 'blabla',
    newByteLength: 1024,
    oldByteLength: null,
});

c.pushMetric('putObject', '3d534b1511e5630e68f0', {
    bucket: 'demo',
    userId: 'Me',
    accountId: 'blabla',
    newByteLength: 1024,
    oldByteLength: 256,
});


function intervalFunc() {
 c.pushMetric('putObject', '3d534b1511e5630e68f0', {
    bucket: 'demo',
    userId: 'Me',
    accountId: 'blabla',
    newByteLength: Math.floor(Math.random()*1024*1024),
    oldByteLength: null,
});
}setInterval(intervalFunc, 1500);


// c.pushMetric('multiObjectDelete', '3d534b1511e5630e68f0', {
//     bucket: 'demo',
//     userId: 'Me',
//     accountId: 'blabla',
//     byteLength: 1024345,
//     numberOfObjects: 999,
// });
