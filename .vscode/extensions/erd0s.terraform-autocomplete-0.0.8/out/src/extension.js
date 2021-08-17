"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const TerraformCompletionProvider_1 = require("./TerraformCompletionProvider");
const TerraformDefinitionProvider_1 = require("./TerraformDefinitionProvider");
const TF_MODE = { language: 'terraform', scheme: 'file' };
function activate(context) {
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(TF_MODE, new TerraformCompletionProvider_1.TerraformCompletionProvider(), '.'));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(TF_MODE, new TerraformDefinitionProvider_1.TerraformDefinitionProvider()));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map