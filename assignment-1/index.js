const http = require('http');

const server = http.createServer((req,res)=>{

    const url = req.url;
    const method = req.method;

    if(url === "/"){
        res.setHeader('Content-Type', 'text/html');
        res.write("<html>");
        res.write("<head><title>Salutare</title></head>");
        res.write("<body>");
        res.write("<h1>Hello!</h1>");
        res.write("<form action='/create-user' method='POST'> <input type='text' name='username' /> <input type='text' name='lastName' /> <input type='submit' value='create user' /> </form>");
        res.write("</body>");
        res.write("</html>");
        return res.end();
    }

    if(url === "/create-user" && method === "POST"){
        const body = [];

        req.on('data', (chunk)=>{
            body.push(chunk);
        });

        return req.on('end', ()=>{
            const parsedBody = Buffer.concat(body).toString();
            const data = parsedBody.split("&");
            const userName = data[0].split("=")[1];
            console.log("User created: ", userName);
            res.statusCode = 302;
            res.setHeader('Location', '/');
            return res.end();
        })
    }

    if(url === "/users"){
        res.setHeader('Content-Type', 'text/html');
        res.write("<html>");
        res.write("<head><title>Users page</title></head>");
        res.write("<body>");
        res.write("<ul><li>User 1</li></ul>");
        res.write("</body>");
        res.write("</html>");
        return res.end();
    }

});
server.listen(3000);
