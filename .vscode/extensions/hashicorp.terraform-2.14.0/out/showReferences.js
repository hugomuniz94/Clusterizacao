"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowReferencesFeature = void 0;
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const CLIENT_CMD_ID = 'client.showReferences';
const VSCODE_SHOW_REFERENCES = 'editor.action.showReferences';
class ShowReferencesFeature {
    constructor(_client) {
        this._client = _client;
        this.registeredCommands = [];
    }
    fillClientCapabilities(capabilities) {
        if (!capabilities['experimental']) {
            capabilities['experimental'] = {};
        }
        capabilities['experimental']['showReferencesCommandId'] = CLIENT_CMD_ID;
    }
    initialize(capabilities) {
        var _a;
        if (!((_a = capabilities.experimental) === null || _a === void 0 ? void 0 : _a.referenceCountCodeLens)) {
            return;
        }
        const showRefs = vscode.commands.registerCommand(CLIENT_CMD_ID, (pos, refCtx) => __awaiter(this, void 0, void 0, function* () {
            const client = this._client;
            const doc = vscode.window.activeTextEditor.document;
            const position = new vscode.Position(pos.line, pos.character);
            const context = { includeDeclaration: refCtx.includeDeclaration };
            const provider = client.getFeature(vscode_languageclient_1.ReferencesRequest.method).getProvider(doc);
            const tokenSource = new vscode.CancellationTokenSource();
            const locations = yield provider.provideReferences(doc, position, context, tokenSource.token);
            yield vscode.commands.executeCommand(VSCODE_SHOW_REFERENCES, doc.uri, position, locations);
        }));
        this.registeredCommands.push(showRefs);
    }
    dispose() {
        this.registeredCommands.forEach(function (cmd, index, commands) {
            cmd.dispose();
            commands.splice(index, 1);
        });
    }
}
exports.ShowReferencesFeature = ShowReferencesFeature;
//# sourceMappingURL=showReferences.js.map