const express = require('express');
const router = express.Router();

router.get('/', async function(req, res, next) {
    const redis = require("redis");
    const client = redis.createClient({
        host: 'redis-10514.c60.us-west-1-2.ec2.cloud.redislabs.com',
        port: 10514,
        password: '7e9Ui1fX1YsdPy2vJyxI9vsV0Fb9qZ7J',
    })

    client.on('error', function (error) {
        console.error(error)
    })
    client.get('findItemsByKeywordsResponse', function (error, result) {
        if (error) {
            console.log(error);
            throw error;
        }
        console.log('GET result ->' + result);
        res.send(result);
    });
    await new Promise((r) => {
        setTimeout(r, 10000);
    redis.RedisClient.quit()
    })

    })

module.exports = router;