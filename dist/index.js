"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_fs_1 = __importDefault(require("node:fs"));
const config_1 = require("./config");
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const file_route_1 = __importDefault(require("./modules/file/file.route"));
const errorHandler_1 = require("./middleware/errorHandler");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure uploads directory exists
const uploadsDir = config_1.config.uploadsDir;
node_fs_1.default.mkdirSync(uploadsDir, { recursive: true });
app.use("/file", file_route_1.default);
app.use("/", auth_route_1.default);
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});
app.use(errorHandler_1.errorHandler);
app.listen(config_1.config.port, () => {
    console.log(`Server listening on port ${config_1.config.port}`);
});
