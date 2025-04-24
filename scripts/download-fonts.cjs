const fs = require("fs");
const path = require("path");
const https = require("https");

const FONTS = require("../fonts.json");
const FONT_PATH = path.join(process.cwd(), "fonts");

fs.mkdirSync(path.dirname(FONT_PATH), { recursive: true });

FONTS.forEach((font) => {
  https.get(font.url, (res) => {
    const fileStream = fs.createWriteStream(
      path.join(FONT_PATH, font.filename)
    );
    res.pipe(fileStream);
  });
});
