const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://8.208.53.133:8000',
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 Proxying:', req.method, req.url);
      },
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err);
        res.status(500).send('Proxy Error');
      }
    })
  );
};