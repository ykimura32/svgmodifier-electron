const http = require('http');
const express = require("express");
const app = express();
app.use(express.json());
//app.use(express.static());
const router = express.Router();
const fs = require('fs');
const path = require('path');       
const os = require("os");

//const server = http.createServer(app);
//server.listen(port);
//console.debug('Server listening on port ' + port);
const platform = os.platform();
let platformOS = platform == 'darwin' ? "MacOS" : "Windows";

router.get('/OS', (req,res) => {
  res.status(200).json({ homeDir: os.homedir(), platform: platformOS });
});

// Serve the HTML file
router.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Handle the POST request
//  app.post('/fixSvg', (req, res) => {
router.post('/fixSvg', (req, res) => {
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

app.use('/', router);

app.listen(process.env.port || 3000);
console.log('User home dir: '+ os.homedir());
console.log('Platform: '+ platformOS);

console.log('Web Server is listening at port '+ (process.env.port || 3000));

