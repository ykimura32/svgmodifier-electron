const http = require('http');
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express()
app.use(express());
app.use(cors());
app.use(bodyParser.json());
const router = express.Router();
const fs = require('fs');
const fetch = require('electron-fetch');
const path = require('path');       
const os = require("os");
const { use } = require('builder-util');

const server = http.createServer(app);
//server.listen(port);
//console.debug('Server listening on port ' + port);
const platform = os.platform();
let platformOS = platform == 'darwin' ? "MacOS" : "Windows";
console.log('User home dir: '+ os.homedir());
console.log('Platform: '+ platformOS);

router.get('/OS', (req,res) => {
  res.status(200).json({ homeDir: os.homedir(), platform: platformOS });
});

// Serve the HTML file
router.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});


// Handle the POST request
router.post('/fixSvg', (req, res) => {
  console.log(req.body);
  console.log({message: "data received"});
// Get the source and destination folders from the request body
  const { sourceFolder, destinationFolder } = req.body;
  console.log("source file: ",sourceFolder);
  const sourceFolderUrl = `file://${sourceFolder}`;
  const destFolderUrl = `file://${destinationFolder}`;
  const msg = [];
  let sourceFolderExists = false;
  let destFolderExists = false;

  fs.access(sourceFolder, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(400).json({ error: `${sourceFolder} Source folder does not exist.` });
      msg.push("Source folder does not exist.");
      return;
    } else {
      sourceFolderExists = true;

      fs.access(destinationFolder, fs.constants.F_OK, (err) => {
        if (err) {
          res.status(400).json({ error: `${destinationFolder} Destination folder does not exist.` });
          msg.push("Destination folder does not exist.");
          return;
        } else {
          destFolderExists = true;
          // Get a list of all files in the source folder
          const files = fs.readdirSync(sourceFolder);

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
          }
      });

    }
  });

});


app.use('/', router);

app.listen(process.env.port || 3000);

console.log('Web Server is listening at port '+ (process.env.port || 3000));

