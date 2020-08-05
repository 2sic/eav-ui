
console.log('===== Will build the parts of the UI =====');

// Prepare list of parts to build
const paramParts = '--parts';

function findParts() {
  const args = process.argv.slice(2);
  console.log("args:", args);
  const partsIndex = args.findIndex(a => a === paramParts);
  if (partsIndex !== -1) {
    if (args.length < partsIndex + 1) throw "nothing after --parts parameter"
    return args[partsIndex + 1].replace("'", '');
  }

  const partsEq = args.find(a => a.startsWith(paramParts) + "=");
  if(partsEq) return partsEq.substring(paramParts.length + 1).replace("'", '');

  throw "--parts parameter missing, please specify something like --parts all";
}

const partsTxt = findParts();
const parts = partsTxt.split(' ');
console.log('Parts (' + parts.length + "): '" + partsTxt + "'");

function hasPart(name) {
  return partsTxt === 'all' || parts.split(' ').includes(name);
}

console.log('has all:' + hasPart('something'));

// Create config array for Webpack
var configs = [];
if (hasPart('wysiwyg')) configs.push(require('./projects/field-string-wysiwyg/webpack.config.js'));
if (hasPart('gps')) configs.push(require('./projects/field-custom-gps/webpack.config.js'));

console.log('Will run ' + configs.length + ' parts');

module.exports = configs;
