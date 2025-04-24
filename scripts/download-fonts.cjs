const fs = require("fs");
const path = require("path");
const https = require("https");

const FONTS = require("../fonts.json");
const FONT_PATH = path.join(process.cwd(), "fonts");

fs.mkdirSync(FONT_PATH, { recursive: true });

FONTS.forEach((font) => {
  console.log(`Downloading ${font.filename}...`);
  
  https.get(font.url, (res) => {
    const filePath = path.join(FONT_PATH, font.filename);
    const fileStream = fs.createWriteStream(filePath);
    
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
      console.log(`Downloaded ${font.filename} successfully.`);
    });
    
    fileStream.on('error', (err) => {
      console.error(`Error writing ${font.filename}:`, err);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${font.filename}:`, err);
  });
});
