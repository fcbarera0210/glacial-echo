"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = exports.rand = void 0;
const rand = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.rand = rand;
const formatTime = () => {
    return new Date().toLocaleTimeString('es-ES');
};
exports.formatTime = formatTime;
