var path = require('path')
var fs = require("fs")

try {
    exports.key = fs.readFileSync(path.join(__dirname, './private/privkey.pem'), 'utf8')
    exports.cert = fs.readFileSync(path.join(__dirname, './private/bundle.pem'), 'utf8')
} catch(err){
    console.error("Error loading SSL Certificates")
    exports.key = null;
    exports.cert = null;
}

