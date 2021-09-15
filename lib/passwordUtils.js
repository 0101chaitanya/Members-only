const crypto = require('crypto');

const genPassword = (password) => {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString('hex');
    console.log({
        salt,
        hash
    })
    return {
        salt: salt,
        hash: hash
    }
}

const validPassword = (password, hash, salt) => {
    const generatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString('hex');
    console.log({
        hash,
        generatedHash
    })
    return hash === generatedHash;
}

module.exports = {
    genPassword,
    validPassword
}