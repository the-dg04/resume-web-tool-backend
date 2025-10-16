const jwt = require("jsonwebtoken")

const serialize = (payload) => {
    // payload: { email, role?: 'user'|'company', user_id?: number, company_id?: number }
    const authToken = jwt.sign(payload, process.env.JWT_SECRET);
    return authToken
}

const deserialize = (token) => {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    return decoded
}

module.exports = {
    serialize,
    deserialize
}