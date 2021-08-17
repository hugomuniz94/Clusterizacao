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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const vscode_uri_1 = require("vscode-uri");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
const languageServerInstaller_1 = require("./languageServerInstaller");
const clientHandler_1 = require("./clientHandler");
const vscodeUtils_1 = require("./vscodeUtils");
const utils_1 = require("./utils");
const serverPath_1 = require("./serverPath");
const terraformStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
// Telemetry config
const extensionId = 'hashicorp.terraform';
const appInsightsKey = '885372d2-6f3c-499f-9d25-b8b219983a52';
let reporter;
let clientHandler;
const languageServerUpdater = new utils_1.SingleInstanceTimeout();
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionVersion = vscode.extensions.getExtension(extensionId).packageJSON.version;
        reporter = new vscode_extension_telemetry_1.default(extensionId, extensionVersion, appInsightsKey);
        context.subscriptions.push(reporter);
        const lsPath = new serverPath_1.ServerPath(context);
        clientHandler = new clientHandler_1.ClientHandler(lsPath, reporter);
        // get rid of pre-2.0.0 settings
        if (vscodeUtils_1.config('terraform').has('languageServer.enabled')) {
            try {
                yield vscodeUtils_1.config('terraform').update('languageServer', { enabled: undefined, external: true }, vscode.ConfigurationTarget.Global);
            }
            catch (err) {
                console.error(`Error trying to erase pre-2.0.0 settings: ${err.message}`);
            }
        }
        if (vscodeUtils_1.config('terraform').has('languageServer.requiredVersion')) {
            const langServerVer = vscodeUtils_1.config('terraform').get('languageServer.requiredVersion', languageServerInstaller_1.defaultVersionString);
            if (!languageServerInstaller_1.isValidVersionString(langServerVer)) {
                vscode.window.showWarningMessage(`The Terraform Language Server Version string '${langServerVer}' is not a valid semantic version and will be ignored.`);
            }
        }
        // Subscriptions
        context.subscriptions.push(vscode.commands.registerCommand('terraform.enableLanguageServer', () => __awaiter(this, void 0, void 0, function* () {
            if (!enabled()) {
                const current = vscodeUtils_1.config('terraform').get('languageServer');
                yield vscodeUtils_1.config('terraform').update('languageServer', Object.assign(current, { external: true }), vscode.ConfigurationTarget.Global);
            }
            return updateLanguageServer(clientHandler, lsPath);
        })), vscode.commands.registerCommand('terraform.disableLanguageServer', () => __awaiter(this, void 0, void 0, function* () {
            if (enabled()) {
                const current = vscodeUtils_1.config('terraform').get('languageServer');
                yield vscodeUtils_1.config('terraform').update('languageServer', Object.assign(current, { external: false }), vscode.ConfigurationTarget.Global);
            }
            languageServerUpdater.clear();
            return clientHandler.stopClients();
        })), vscode.commands.registerCommand('terraform.apply', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('apply', false, clientHandler);
        })), vscode.commands.registerCommand('terraform.init', () => __awaiter(this, void 0, void 0, function* () {
            const selected = yield vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                defaultUri: vscode.workspace.workspaceFolders[0].uri,
                openLabel: "Initialize"
            });
            if (selected) {
                const moduleUri = selected[0];
                const client = clientHandler.getClient(moduleUri);
                const requestParams = { command: `${client.commandPrefix}.terraform-ls.terraform.init`, arguments: [`uri=${moduleUri}`] };
                yield execWorkspaceCommand(client.client, requestParams);
            }
        })), vscode.commands.registerCommand('terraform.initCurrent', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('init', true, clientHandler);
        })), vscode.commands.registerCommand('terraform.plan', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('plan', false, clientHandler);
        })), vscode.commands.registerCommand('terraform.validate', () => __awaiter(this, void 0, void 0, function* () {
            yield terraformCommand('validate', true, clientHandler);
        })), vscode.workspace.onDidChangeConfiguration((event) => __awaiter(this, void 0, void 0, function* () {
            if (event.affectsConfiguration('terraform') || event.affectsConfiguration('terraform-ls')) {
                const reloadMsg = 'Reload VSCode window to apply language server changes';
                const selected = yield vscode.window.showInformationMessage(reloadMsg, 'Reload');
                if (selected === 'Reload') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            }
        })), vscode.workspace.onDidChangeWorkspaceFolders((event) => __awaiter(this, void 0, void 0, function* () {
            if (event.removed.length > 0) {
                yield clientHandler.stopClients(vscodeUtils_1.prunedFolderNames(event.removed));
            }
            if (event.added.length > 0) {
                clientHandler.startClients(vscodeUtils_1.prunedFolderNames(event.added));
            }
        })), vscode.window.onDidChangeActiveTextEditor((event) => __awaiter(this, void 0, void 0, function* () {
            // Make sure there's an open document in a folder
            // Also check whether they're running a different language server
            // TODO: Check initializationOptions for command presence instead of pathToBinary
            if (event && vscode.workspace.workspaceFolders[0] && !lsPath.hasCustomBinPath()) {
                const documentUri = event.document.uri;
                const client = clientHandler.getClient(documentUri);
                const moduleUri = vscode_uri_1.Utils.dirname(documentUri);
                if (client) {
                    try {
                        const response = yield moduleCallers(client, moduleUri.toString());
                        if (response.moduleCallers.length === 0) {
                            const dirName = vscode_uri_1.Utils.basename(moduleUri);
                            terraformStatus.text = `$(refresh) ${dirName}`;
                            terraformStatus.color = new vscode.ThemeColor('statusBar.foreground');
                            terraformStatus.tooltip = `Click to run terraform init`;
                            terraformStatus.command = "terraform.initCurrent";
                            terraformStatus.show();
                        }
                        else {
                            terraformStatus.hide();
                        }
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(err);
                        reporter.sendTelemetryException(err);
                        terraformStatus.hide();
                    }
                }
            }
        })));
        if (enabled()) {
            try {
                yield vscode.commands.executeCommand('terraform.enableLanguageServer');
            }
            catch (error) {
                reporter.sendTelemetryException(error);
            }
        }
        // export public API
        return { clientHandler, moduleCallers };
    });
}
exports.activate = activate;
function deactivate() {
    return clientHandler.stopClients();
}
exports.deactivate = deactivate;
function updateLanguageServer(clientHandler, lsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Checking for language server updates...');
        const hour = 1000 * 60 * 60;
        languageServerUpdater.timeout(function () {
            updateLanguageServer(clientHandler, lsPath);
        }, 24 * hour);
        try {
            // skip install if a language server binary path is set
            if (!lsPath.hasCustomBinPath()) {
                const installer = new languageServerInstaller_1.LanguageServerInstaller(lsPath, reporter);
                const install = yield installer.needsInstall(vscodeUtils_1.config('terraform').get('languageServer.requiredVersion', languageServerInstaller_1.defaultVersionString));
                if (install) {
                    yield clientHandler.stopClients();
                    try {
                        yield installer.install();
                    }
                    catch (err) {
                        console.log(err); // for test failure reporting
                        reporter.sendTelemetryException(err);
                        throw err;
                    }
                    finally {
                        yield installer.cleanupZips();
                    }
                }
            }
            // on repeat runs with no install, this will be a no-op
            return clientHandler.startClients(vscodeUtils_1.prunedFolderNames());
        }
        catch (error) {
            console.log(error); // for test failure reporting
            vscode.window.showErrorMessage(error.message);
        }
    });
}
function execWorkspaceCommand(client, params) {
    reporter.sendTelemetryEvent('execWorkspaceCommand', { command: params.command });
    return client.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, params);
}
function modulesCallersCommand(languageClient, moduleUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestParams = { command: `${languageClient.commandPrefix}.terraform-ls.module.callers`, arguments: [`uri=${moduleUri}`] };
        return execWorkspaceCommand(languageClient.client, requestParams);
    });
}
function moduleCallers(languageClient, moduleUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield modulesCallersCommand(languageClient, moduleUri);
        const moduleCallers = response.callers;
        return { version: response.v, moduleCallers };
    });
}
function terraformCommand(command, languageServerExec = true, clientHandler) {
    return __awaiter(this, void 0, void 0, function* () {
        if (vscode.window.activeTextEditor) {
            const documentUri = vscode.window.activeTextEditor.document.uri;
            const languageClient = clientHandler.getClient(documentUri);
            const moduleUri = vscode_uri_1.Utils.dirname(documentUri);
            const response = yield moduleCallers(languageClient, moduleUri.toString());
            let selectedModule;
            if (response.moduleCallers.length > 1) {
                const selected = yield vscode.window.showQuickPick(response.moduleCallers.map(m => m.uri), { canPickMany: false });
                selectedModule = selected[0];
            }
            else if (response.moduleCallers.length == 1) {
                selectedModule = response.moduleCallers[0].uri;
            }
            else {
                selectedModule = moduleUri.toString();
            }
            if (languageServerExec) {
                const requestParams = { command: `${languageClient.commandPrefix}.terraform-ls.terraform.${command}`, arguments: [`uri=${selectedModule}`] };
                return execWorkspaceCommand(languageClient.client, requestParams);
            }
            else {
                const terminalName = `Terraform ${selectedModule}`;
                const moduleURI = vscode.Uri.parse(selectedModule);
                const terraformCommand = yield vscode.window.showInputBox({ value: `terraform ${command}`, prompt: `Run in ${selectedModule}` });
                if (terraformCommand) {
                    const terminal = vscode.window.terminals.find(t => t.name == terminalName) ||
                        vscode.window.createTerminal({ name: `Terraform ${selectedModule}`, cwd: moduleURI });
                    terminal.sendText(terraformCommand);
                    terminal.show();
                }
                return;
            }
        }
        else {
            vscode.window.showWarningMessage(`Open a module then run terraform ${command} again`);
            return;
        }
    });
}
function enabled() {
    return vscodeUtils_1.config('terraform').get('languageServer.external');
}
//# sourceMappingURL=extension.js.map