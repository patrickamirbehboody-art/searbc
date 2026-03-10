// Simple proxy server for local development
// Run this alongside Vite if you hit CORS issues: node server.js
// Then change VITE_API_BASE in .env.local to http://localhost:3001/airtable

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
app.use(cors());

app.use('/airtable', createProxyMiddleware({
  target: 'https://api.airtable.com',
  changeOrigin: true,
  pathRewrite: { '^/airtable': '' },
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward Authorization header
      const auth = req.headers['authorization'];
      if (auth) proxyReq.setHeader('Authorization', auth);
    }
  }
}));

app.listen(3001, () => {
  console.log('Proxy running at http://localhost:3001');
});
