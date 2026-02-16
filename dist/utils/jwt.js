"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = verifyJwt;
exports.generateJwtToken = generateJwtToken;
exports.generateJWT = generateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyJwt(token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
}
function generateJwtToken(payload, expiresIn = "1D") {
    return jsonwebtoken_1.default.sign({ ...payload }, process.env.JWT_SECRET || "your_jwt_secret", {
        expiresIn: expiresIn,
    });
}
// Game session JWT functions
function generateJWT(payload, expiresIn = "1h") {
    return jsonwebtoken_1.default.sign({ ...payload }, process.env.JWT_SECRET || "your_jwt_secret", {
        expiresIn: expiresIn,
    });
}
generateJWT.verify = function (token) {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
};
