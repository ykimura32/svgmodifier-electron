const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
  });
  win.loadFile("./index.html");
};

app.whenReady().then(() => {
  createWindow();
});

const http = require('http');
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("express"));
const fs = require('fs');
const path = require('path');
app.set('port', process.env.PORT || 3000);
const port = app.get('port');

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Handle the POST request
  app.post('/fixSvg', (req, res) => {
// Get the source and destination folders from the request body
    const { sourceFolder, destinationFolder } = req.body;

    if (!fs.existsSync(sourceFolder)) {
        res.status(400).json({ error: 'Source folder does not exist.' });
        return;
    }
    if (!fs.existsSync(destinationFolder)) {
        res.status(400).json({ error: 'Destination folder does not exist.' });
        return;
    }
    
    // Get a list of all files in the source folder
    const files = fs.readdirSync(sourceFolder);
    const msg = [];
  // Loop through all the files
    files.forEach(file => {
    // Check if the file is an SVG file
      if (path.extname(file) === '.svg') {
        // Read the contents of the file
        const filePath = path.join(sourceFolder, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        
        // Check if the file already contains the line of code
        if (fileContents.includes('<?xml version=\"1.0\" encoding=\"UTF-8\"?>')) {
            console.log(`${file} already contains the line of code.`);
            msg.push(`${file} already contains the line of code.`);
        } else {
            // Add the line of code to the file contents
            const newContents = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n${fileContents}`;

            // Write the modified file to the destination folder
            const newFilePath = path.join(destinationFolder, file);
            fs.writeFileSync(newFilePath, newContents, 'utf8');

            console.log(`${file} modified and copied to ${destinationFolder}.`);
            msg.push(`${file} modified and copied to ${destinationFolder}.`);
        }
      }
    });
    // Send a response to the client
    res.json({ ok: 'Success', files: files, msg: msg });
});

const server = http.createServer(app);
server.listen(port);
console.debug('Server listening on port ' + port);
