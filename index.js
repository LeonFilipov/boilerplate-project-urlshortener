require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const ERROR_RESPONSE = { error: 'invalid url' };
const dataBase = new Map();
const checkURL = /^(http|https):\/\/$/;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url; // La URL enviada

  if (!originalUrl) {
    return res.json({ error: 'URL is required' });
  }
  
  let hostname;
  try {
    const urlObject = new URL(originalUrl);
    hostname = urlObject.hostname;
    if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
      return res.json(ERROR_RESPONSE);
    }
  } catch (error) {
    return res.json(ERROR_RESPONSE);
  }
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json(ERROR_RESPONSE);
    }

    const id = dataBase.size;
    dataBase.set(id.toString(), originalUrl);
    res.json({ original_url: originalUrl, short_url: id });
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  if (dataBase.get(req.params.id)) {
    res.redirect(dataBase.get(req.params.id));
  } else {
    res.send({ "error": "invalid short_url" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
