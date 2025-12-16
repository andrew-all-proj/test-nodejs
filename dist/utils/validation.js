"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
async function validateDto(cls, payload) {
    const instance = (0, class_transformer_1.plainToInstance)(cls, payload);
    const errors = await (0, class_validator_1.validate)(instance, { whitelist: true, forbidUnknownValues: true });
    if (errors.length > 0) {
        const messages = errors.flatMap(err => Object.values(err.constraints ?? {}));
        const message = messages.join('; ') || 'Validation failed';
        throw Object.assign(new Error(message), { status: 400 });
    }
    return instance;
}
