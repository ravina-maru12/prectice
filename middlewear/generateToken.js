const jwt = require("jsonwebtoken");

function generateToken(data){
    return jwt.sign({ data }, 'abc111', { expiresIn: '1h' });   //here data is token, bbb222 => secret key, then expire time
}

module.exports = generateToken;