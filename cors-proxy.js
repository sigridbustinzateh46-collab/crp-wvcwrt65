// cors-proxy.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use(async (req, res) => {
  try {
    const targetUrl = req.originalUrl.slice(1); // remove leading slash
    if (!targetUrl) {
      return res.status(400).send('No target URL specified');
    }

    const options = {
      method: req.method,
      headers: { ...req.headers },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    };

    delete options.headers.host;

    const response = await fetch(targetUrl, options);
    const data = await response.text();

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  }
});

app.options('/*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`CORS Proxy running on http://localhost:${PORT}`);
});
