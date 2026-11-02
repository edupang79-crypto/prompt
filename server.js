// Railway 등에서 워크북 정적 파일을 제공하는 의존성 없는 Node 서버
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const FILES = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/robots.txt': ['robots.txt', 'text/plain; charset=utf-8'],
};

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('ok'); }
  const hit = FILES[url.pathname];
  if (!hit || (req.method !== 'GET' && req.method !== 'HEAD')) {
    res.writeHead(302, { Location: '/' }); return res.end();
  }
  fs.readFile(path.join(ROOT, hit[0]), (err, data) => {
    if (err) { res.writeHead(500); return res.end('error'); }
    res.writeHead(200, {
      'Content-Type': hit[1],
      'Cache-Control': hit[0] === 'index.html' ? 'no-cache' : 'public, max-age=300',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}).listen(PORT, () => console.log('워크북 서버 실행: 포트 ' + PORT));
