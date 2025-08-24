const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse URL and remove query parameters
  let filePath = req.url.split('?')[0];
  
  // Handle root path
  if (filePath === '/') {
    filePath = '/index.html';
  }

  // Construct full file path
  const fullPath = path.join(DIST_DIR, filePath);

  // Get file extension
  const extname = String(path.extname(fullPath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found - for SPA, serve index.html for client-side routing
      if (extname === '' || extname === '.html') {
        const indexPath = path.join(DIST_DIR, 'index.html');
        fs.readFile(indexPath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
            return;
          }
          res.writeHead(200, { 
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache'
          });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(404);
        res.end('File not found');
      }
      return;
    }

    // Read and serve the file
    fs.readFile(fullPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading file: ${err.code}`);
        return;
      }

      // Set appropriate headers
      const headers = {
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      };

      // Disable caching for development
      if (extname === '.html' || extname === '.js' || extname === '.css') {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }

      res.writeHead(200, headers);
      res.end(content, 'utf-8');
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Levity Loyalty Server running at:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://127.0.0.1:${PORT}`);
  console.log(`\n📁 Serving files from: ${DIST_DIR}`);
  console.log(`\n🌐 Open your browser and navigate to the URL above`);
  console.log(`\n⏹️  Press Ctrl+C to stop the server`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
