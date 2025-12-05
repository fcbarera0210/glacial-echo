"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSave = exports.clearSave = exports.loadGame = exports.saveGame = void 0;
const constants_1 = require("./constants");
// Convierte Card a CardSerializable (elimina la función effect)
const serializeCard = (card) => {
    const { effect, ...rest } = card;
    return rest;
};
const saveGame = (state, deck, allCards, logEntries) => {
    if (typeof window === 'undefined')
        return;
    const savedGame = {
        state,
        deck: deck.map(serializeCard),
        allCards: allCards.map(serializeCard),
        logEntries,
        timestamp: Date.now()
    };
    try {
        localStorage.setItem(constants_1.STORAGE_KEY, JSON.stringify(savedGame));
    }
    catch (error) {
        console.error('Error guardando partida:', error);
    }
};
exports.saveGame = saveGame;
const loadGame = () => {
    if (typeof window === 'undefined')
        return null;
    try {
        const saved = localStorage.getItem(constants_1.STORAGE_KEY);
        if (!saved)
            return null;
        const savedGame = JSON.parse(saved);
        return savedGame;
    }
    catch (error) {
        console.error('Error cargando partida:', error);
        return null;
    }
};
exports.loadGame = loadGame;
const clearSave = () => {
    if (typeof window === 'undefined')
        return;
    try {
        localStorage.removeItem(constants_1.STORAGE_KEY);
    }
    catch (error) {
        console.error('Error eliminando partida:', error);
    }
};
exports.clearSave = clearSave;
const hasSave = () => {
    if (typeof window === 'undefined')
        return false;
    return localStorage.getItem(constants_1.STORAGE_KEY) !== null;
};
exports.hasSave = hasSave;
