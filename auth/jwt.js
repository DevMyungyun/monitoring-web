const jwt = require('jsonwebtoken');

var jwtFunc = () => {}

jwtFunc.generateToken = (alg, iss, id, secret) => {
    try {
        if (iss) {
            const payload = {'iss': iss,'id': id}
            const token = jwt.sign(payload, secret, {
                algorithm: alg,
                expiresIn: 60 * 60 * 24 * 365
            });
            return token
        } else {
            return 'Error occur during generating jwt token'
        }
    } catch (err) {
        console.error(err);
    }
}

jwtFunc.veryfyToekn = (clientToken, secret) => {
    try {
        const decoded = jwt.verify(clientToken, secret);
        if (decoded) {
            return decoded
        } else {
            console.log('There is something wrong this token');
            return false
        }
    } catch (err) {
        console.log('Token Expired');
        return null
    }
}

module.exports = jwtFunc;