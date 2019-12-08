const fs = require('fs');

// ideea generala este ca clientul trimite un request la server si serverul trimite un response la client
const request = (req, res) => {
    const url = req.url;
    const method = req.method;

    if (url === "/") {
        res.write('<html>');
        res.write('<head><title>Salutare din home page</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"/> <input type="submit" value="Send"/></form></body>');
        res.write('</html>');
        return res.end();
    }

    if (url === "/message" && method === "POST") {
        const body = [];
        // se poate modifica o variabila constanta daca folosesti push
        // nu se poate reasigna o valoare unei variabile constante;
        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split("=")[1];
            fs.writeFile("message.txt", message, (err) => {
                // console.log(parsedBody);
                // res.writeHead(302, {});
                res.statusCode = 302;
                res.setHeader("Location", "/");
                return res.end();
            });

        });
        

    }

    res.setHeader('Content-Type', 'text/html');
    res.write('<html>');
    res.write('<body><h1>Salutare din node app 1</h1></body>');
    res.write('</html>');
    res.end();
    // process.exit();
};

module.exports = request;