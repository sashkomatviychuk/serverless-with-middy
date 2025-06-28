const fs = require('fs');
const path = require('path');

const rootPkg = require('../package.json');
const layerPath = path.join(__dirname, '../layers/lodash/nodejs');
const layerPkgPath = path.join(layerPath, 'package.json');

const layerPkg = require(layerPkgPath);
layerPkg.dependencies = rootPkg.dependencies;

fs.writeFileSync(layerPkgPath, JSON.stringify(layerPkg, null, 2));
console.log('Synced layer package.json dependencies');
