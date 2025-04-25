import express from 'express';
import nodeHtmlToImagePkg from 'node-html-to-image';
const nodeHtmlToImage = nodeHtmlToImagePkg.default ?? nodeHtmlToImagePkg;

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = 3000;

// 讀取字體並轉 Base64
const fontPath = path.join(__dirname, 'fonts', 'MonoLisaStatic-ExtraBoldItalic.ttf');
const fontData = await fs.readFile(fontPath, 'base64');
const fontDataUrl = `data:font/truetype;base64,${fontData}`;

// 讀入模板並注入 fontDataUrl
let template = await fs.readFile(
  path.join(__dirname, 'card-template.html'),
  'utf8'
);
template = template.replace(/{{fontDataUrl}}/g, fontDataUrl);

app.get('/card', async (req, res) => {
  const {
    primary     = '#FF7E5F',
    secondary   = '',
    textColor   = '#FFFFFF',
    author      = 'By JerryScript',
    repo        = 'awesome-project',
    domain      = 'General',   // 新增 domain
    serial      = '000',       // 新增 serial
    star        = '0',
    add         = '+0',
    lang        = 'Python',
    forks       = '0',
    handle      = '@JerryScript'
  } = req.query;

  // 替換所有 Mustache 變數
  const html = template
    .replace(/{{primary}}/g,      primary)
    .replace(/{{secondary}}/g,    secondary)
    .replace(/{{textColor}}/g,    textColor)
    .replace(/{{author}}/g,       author)
    .replace(/{{repo}}/g,         repo)
    .replace(/{{domain}}/g,       domain)
    .replace(/{{serial}}/g,       serial)
    .replace(/{{star}}/g,         star)
    .replace(/{{add}}/g,          add)
    .replace(/{{lang}}/g,         lang)
    .replace(/{{forks}}/g,        forks)
    .replace(/{{handle}}/g,       handle);

  try {
    const buffer = await nodeHtmlToImage({
      html,
      selector: '.card',
      puppeteerArgs: {
        defaultViewport: {
          width: 360,
          height: 450,
          deviceScaleFactor: 3
        }
      },
      quality: 100,
      type: 'png',
      encoding: 'binary'
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="card.png"');
    res.end(buffer, 'binary');
  } catch (err) {
    console.error(err);
    res.status(500).send('Image generation failed.');
  }
});

app.listen(PORT, () => {
  console.log(`⇢ http://localhost:${PORT}/card`);
});