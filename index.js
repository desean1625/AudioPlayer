
const { URL } = require('url');
const path = require('path');
const fs = require('fs');

const http = require('http');
const https = require('https');

const express = require('express');
const compression = require('compression');

const { CLIENT_DN, ISSUER_DN, PORT, MP_API_URL, TLS } = require('./config.js');

const BASE_URL = `http://localhost:${PORT}`;

//const externals = require('./externals.json');

const version = require('./package.json').version;

const webpackMiddleware = createWebpackMiddleware();

function toVendorPath(p) {
  return p.replace(/^\.?\/?node_modules\//, 'vendor/');
}

//const scriptURLs = externals.scripts.map(toVendorPath);
// stylesheetURLs = externals.stylesheets.map(toVendorPath);

function createWebpackMiddleware() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode
    const webpack = require('webpack');
    const middleware = require('webpack-dev-middleware');
    const compiler = webpack(require('./webpack.config.js'));
    return middleware(compiler, {});
  } else {
    return express.static(path.join(__dirname, 'dist'));
  }
}

function createProxy({ server }) {
  // Reverse proxy the API
  let proxyTarget = MP_API_URL;

  for (let i = 2; i<process.argv.length; i++) {
    const arg = process.argv[i];
    const sep = arg.indexOf('=');
    const key = (sep === -1) ? arg : arg.slice(0,sep);
    const value = (sep === -1) ? ((i+1 < process.argv.length) ? process.argv[i+1] : undefined) : arg.slice(sep+1);
    if (key === '--proxy' && value) {
      proxyTarget = value;
    }
  }

  if (!proxyTarget) {
    return undefined;
  }

  let proxyURL;
  try {
    proxyURL = new URL(proxyTarget);
  } catch (e) {
    console.error('Malformed proxy URL "%s": %s', proxyTarget, e.message);
    return undefined;
  }

  if (proxyURL.protocol !== 'http:' && proxyURL.protocol !== 'https:') {
    console.error('Unsupported proxy URL protocol "%s"', proxyURL.protocol);
    return undefined;
  }

  const target = proxyURL.toString();

  const httpProxy = require('http-proxy');

  const Agent = proxyURL.protocol === 'https:' ? https.Agent : http.Agent;
  const agent = new Agent({
    keepAlive: true,
    ...(proxyURL.protocol === 'https:' ? TLS : {})
  });

  const proxy = httpProxy.createProxyServer({
    target,
    agent,
    ws: true,
    changeOrigin: true,
    protocolRewrite: true,
    hostRewrite: true,
    secure: false,
  });

  proxy.on('error', (err, req, res) => {
    console.error(err);
    if (res) {
      if (res.setHeader) {
        res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      }
      if (res.writeHead) {
        res.writeHead(500);
      }
      if (res.write) {
        res.write(err.message);
      }
      if (res.end) {
        res.end();
      }
    }
  });

  server.on('upgrade', (req, socket, head) => {
    if (!req.url.startsWith('/ws')) {
      return;
    }
    console.log('Forwarding websocket to "%s"', target);
    const headers = proxyURL.protocol !== 'https:' ? {
        'X-Client-Verify': 'SUCCESS',
        'X-Client-Subject': CLIENT_DN,
        'X-Client-Issuer': ISSUER_DN,
    } : {};
    proxy.ws(req, socket, head, { headers });
  });

  if (proxyURL.protocol !== 'https:') {
    proxy.on('proxyReq', function(proxyReq, req, res, options) {
      proxyReq.setHeader('X-Client-Verify', 'SUCCESS');
      proxyReq.setHeader('X-Client-Subject', CLIENT_DN);
      proxyReq.setHeader('X-Client-Issuer', ISSUER_DN);
    });
  }
  return { proxy, target };
}

function configureApp(app, proxy) {
  app.set('view engine', 'ejs');
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  if (process.env.NODE_ENV === 'production') {
    app.use(function (req, res, next) {
      if (req.headers['x-client-verify'] !== 'SUCCESS') {
        res.type('text').status(403).send('Forbidden');
      } else {
        next();
      }
    });
  }
  app.use(compression());

  if (proxy) {
    console.log('Proxying API calls and WebSocket connections to "%s"', proxy.target);
    app.use('/api', (req, res, next) => {
      req.url = '/api' + req.url;
      proxy.proxy.web(req, res);
    });
  } else {
    app.use('/api', (req, res, next) => {
      res.type('text').status(404).send('Not found');
    });
  }
  app.use(express.static(path.join(__dirname, 'test')));
  app.use('/dist', webpackMiddleware);

  app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

  app.get('/build.json', (req, res) => {
    res.type('json').send({
      version,
      timestamp: new Date().toISOString()
    })
  });

  app.use(function (req, res, next) {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/ws') &&
      req.accepts('html') &&
      (req.path === '/' || req.path.match(/\/[^.\/]+\/?$/))
    ) {
      let host = req.headers['x-forwarded-host'] || req.headers['host'];
      host = host.split(/\s*,\s*/)[0];
      if (host.match(/:(80|443)$/)) {
        host = req.hostname;
      }
      const baseUrl = `${req.protocol}://${host}/${req.baseUrl}`;
      res.render('index', { baseUrl,  version });
    } else {
      next();
    }
  });

  return app;
}

function run({ port, checkProxy, useMockApi }) {
  const app = express();
  const server = http.createServer(app);
  const proxy = checkProxy ? createProxy({ server }) : undefined;

  configureApp(app, proxy);

  server.listen(port, () => console.log(`listening on port ${port}`));
}

let options = { port: PORT, checkProxy: process.env.NODE_ENV !== 'production' };

run(options);
