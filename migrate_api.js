const fs = require('fs');
const path = require('path');

// 1. Update server.js modifying the endpoint definitions
let serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
const endpoints = ['projects', 'services', 'inquiries', 'banners', 'team', 'settings'];
endpoints.forEach(ep => {
  serverContent = serverContent.replace(new RegExp(`app\\.get\\('/${ep}`, 'g'), `app.get('/api/${ep}`);
  serverContent = serverContent.replace(new RegExp(`app\\.post\\('/${ep}`, 'g'), `app.post('/api/${ep}`);
  serverContent = serverContent.replace(new RegExp(`app\\.put\\('/${ep}`, 'g'), `app.put('/api/${ep}`);
  serverContent = serverContent.replace(new RegExp(`app\\.delete\\('/${ep}`, 'g'), `app.delete('/api/${ep}`);
});
fs.writeFileSync(path.join(__dirname, 'server.js'), serverContent, 'utf8');

// 2. Update React components
function replaceInReactFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInReactFiles(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Update endpoint fetchers directly to relative /api/*
      endpoints.forEach(ep => {
        content = content.replace(new RegExp(`http://localhost:5000/${ep}`, 'g'), `/api/${ep}`);
      });

      // Erase absolute local host strings parsing images from DB
      content = content.replace(/http:\/\/localhost:5000/g, '');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
replaceInReactFiles(path.join(__dirname, 'src'));
console.log('Migration to universal proxy architecture concluded');
