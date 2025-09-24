const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Use the port from environment variable (required for Northflank)
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Handle all requests
app.use(async (req, res) => {
  try {
    const targetUrl = req.originalUrl.slice(1); // Remove leading slash

    if (!targetUrl) {
      return res.status(400).send('No target URL specified');
    }

    const options = {
      method: req.method,
      headers: { ...req.headers },
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    };

    delete options.headers.host; // Remove host to avoid header conflicts

    const response = await fetch(targetUrl, options);
    const data = await response.text();

    // Set CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  }
});

// Handle CORS preflight
app.options('/*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`CORS Proxy running on port ${PORT}`);
});
