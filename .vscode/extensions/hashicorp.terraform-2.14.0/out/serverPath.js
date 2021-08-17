"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerPath = exports.CUSTOM_BIN_PATH_OPTION_NAME = void 0;
const vscode = require("vscode");
const path = require("path");
const INSTALL_FOLDER_NAME = 'lsp';
exports.CUSTOM_BIN_PATH_OPTION_NAME = 'languageServer.pathToBinary';
class ServerPath {
    constructor(context) {
        this.context = context;
        this.customBinPath = vscode.workspace.getConfiguration('terraform').get(exports.CUSTOM_BIN_PATH_OPTION_NAME);
    }
    installPath() {
        return this.context.asAbsolutePath(INSTALL_FOLDER_NAME);
    }
    hasCustomBinPath() {
        return !!this.customBinPath;
    }
    binPath() {
        if (this.hasCustomBinPath()) {
            return this.customBinPath;
        }
        return path.resolve(this.installPath(), this.binName());
    }
    binName() {
        if (this.hasCustomBinPath()) {
            return path.basename(this.customBinPath);
        }
        if (process.platform === 'win32') {
            return 'terraform-ls.exe';
        }
        return 'terraform-ls';
    }
}
exports.ServerPath = ServerPath;
//# sourceMappingURL=serverPath.js.map