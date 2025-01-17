require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const ERROR_RESPONSE = { 'error': 'invalid url' };
const dataBase = new Map();
const checkURL = /^http:\/\/([A-z])+.com$/;

app.post('/api/shorturl', (req, res) => {
  if (req.body.original_url && req.body.short_url) {
    if (!checkURL.test(req.body.original_url) || dataBase.get(req.body.short_url)) {
      res.send(ERROR_RESPONSE, "url");
      return
    }
    dataBase.set(req.body.short_url, req.body.original_url);
    res.status(200);
    res.send();
    return 
  }
  res.send(ERROR_RESPONSE);
  return
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
