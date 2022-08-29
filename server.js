const app = require('./app');

if (process.env.ENVIRONMENT === 'prod') {
    const greenlock = require('greenlock-express');
    greenlock
        .init({
            packageRoot: __dirname,
            maintainerEmail: "chaoticsoftwares@gmail.com",
            configDir: '../certs/greenlock.d',
            cluster: false
        })
        .serve(app);
} else {
    const fs = require('fs');
    const https = require('https');
    const http = require('http');
    var path = require('path');
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer({
        key: fs.readFileSync(path.resolve('../certs/key.pem')),
        cert: fs.readFileSync(path.resolve('../certs/cert.pem')),
        passphrase: process.env.PASSPHRASE
    }, app);
    httpServer.listen(80, () => {
        console.log('HTTP Server running on port 80');
    });
    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
}

