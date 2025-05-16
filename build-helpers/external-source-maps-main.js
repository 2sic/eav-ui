const fs = require('fs');
const path = require('path');
const pjson = require('../package.json');

// Modify source maps after the build completes
function modifySourceMaps() {
  const buildDir = path.join(__dirname, '../dist/eav-ui');
  
  fs.readdirSync(buildDir).forEach(file => {
    const filePath = path.join(buildDir, file);

    // Process only `.map` files
    if (file.endsWith('.map')) {
      console.log('Modifying source map:', filePath);

      // Read and parse the source map file
      const sourceMap = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Modify the sourceRoot in the source map for production
      sourceMap.sourceRoot = `https://sources.2sxc.org/${pjson.version}/dist/ng-edit/`;

      // Write the updated source map back
      fs.writeFileSync(filePath, JSON.stringify(sourceMap, null, 2), 'utf8');
    }
  });
}

// Run the source map modification
modifySourceMaps();
