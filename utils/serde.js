const jwt = require("jsonwebtoken")

const serialize = (email) => {
    const authToken = jwt.sign(email, process.env.JWT_SECRET);
    return authToken
}

const deserialize = (token) => {
    const email = jwt.verify(token,process.env.JWT_SECRET);
    return deserialize
}

module.exports = {
    serialize,
    deserialize
}