const http = require('http');


const server = http.createServer(function(req,res){
    console.log(req);
    console.log("Salut");
});

server.listen(3000);
