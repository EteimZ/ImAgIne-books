const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const OpenAI = new require("openai");

const openai = new OpenAI.OpenAI({ apiKey: process.env.OPENAI_API_KEY})



const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);

    if (req.method === 'GET' && reqUrl.pathname === '/') {
        const filePath = path.join(__dirname, 'index.html');
        
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else if (req.method === 'POST' && reqUrl.pathname === '/hello') {

        let requestBody = '';

        req.on('data', chunk => {
            requestBody += chunk.toString();
        });

        req.on('end', async () => {
            let jsonData = {};
            try {
                jsonData = JSON.parse(requestBody);
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            const imageData = await generateImage(jsonData);
            res.end(JSON.stringify({ message: 'Hello, World!', receivedData: imageData }));
        });
    } else {
        // For other routes or methods, return a 404 Not Found
        res.writeHead(404);
        res.end('Not Found');
    }
});

async function generateImage(jsonData) {
    const image = await openai.images.generate({ prompt: jsonData.prompt, n:1, size: '256x256' });
  
    return image.data;
  }

const port = 4000; // Change the port number if needed
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
