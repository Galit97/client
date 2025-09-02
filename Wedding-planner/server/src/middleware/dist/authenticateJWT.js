"use strict";
exports.__esModule = true;
exports.authenticateJWT = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
function authenticateJWT(req, res, next) {
    var authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    var token = authHeader.split(" ")[1];
    try {
        var decoded = jsonwebtoken_1["default"].verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.id };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
exports.authenticateJWT = authenticateJWT;
