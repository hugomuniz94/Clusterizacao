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
exports.ClientHandler = void 0;
const vscode = require("vscode");
const short_unique_id_1 = require("short-unique-id");
const fs = require("fs");
const path = require("path");
const which = require("which");
const node_1 = require("vscode-languageclient/node");
const vscodeUtils_1 = require("./vscodeUtils");
const showReferences_1 = require("./showReferences");
const serverPath_1 = require("./serverPath");
const MULTI_FOLDER_CLIENT = "";
const clients = new Map();
/**
 * ClientHandler maintains lifecycles of language clients
 * based on the server's capabilities (whether multi-folder
 * workspaces are supported).
 */
class ClientHandler {
    constructor(lsPath, reporter) {
        this.lsPath = lsPath;
        this.reporter = reporter;
        this.supportsMultiFolders = true;
        this.shortUid = new short_unique_id_1.default();
        if (lsPath.hasCustomBinPath()) {
            this.reporter.sendTelemetryEvent('usePathToBinary');
        }
    }
    startClients(folders) {
        const disposables = [];
        if (this.supportsMultiFolders) {
            if (clients.has(MULTI_FOLDER_CLIENT)) {
                console.log(`No need to start another client for ${folders}`);
                return disposables;
            }
            console.log('Starting client');
            const tfClient = this.createTerraformClient();
            tfClient.client.onReady().then(() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                this.reporter.sendTelemetryEvent('startClient');
                const multiFoldersSupported = (_b = (_a = tfClient.client.initializeResult.capabilities.workspace) === null || _a === void 0 ? void 0 : _a.workspaceFolders) === null || _b === void 0 ? void 0 : _b.supported;
                console.log(`Multi-folder support: ${multiFoldersSupported}`);
                if (!multiFoldersSupported) {
                    // restart is needed to launch folder-focused instances
                    console.log('Restarting clients as folder-focused');
                    yield this.stopClients(folders);
                    this.supportsMultiFolders = false;
                    this.startClients(folders);
                }
            }));
            disposables.push(tfClient.client.start());
            clients.set(MULTI_FOLDER_CLIENT, tfClient);
            return disposables;
        }
        if (folders && folders.length > 0) {
            for (const folder of folders) {
                if (!clients.has(folder)) {
                    console.log(`Starting client for ${folder}`);
                    const folderClient = this.createTerraformClient(folder);
                    folderClient.client.onReady().then(() => {
                        this.reporter.sendTelemetryEvent('startClient');
                    });
                    disposables.push(folderClient.client.start());
                    clients.set(folder, folderClient);
                }
                else {
                    console.log(`Client for folder: ${folder} already started`);
                }
            }
        }
        return disposables;
    }
    createTerraformClient(location) {
        const cmd = this.resolvedPathToBinary();
        const binaryName = this.lsPath.binName();
        const serverArgs = vscodeUtils_1.config('terraform').get('languageServer.args');
        const experimentalFeatures = vscodeUtils_1.config('terraform-ls').get('experimentalFeatures');
        let channelName = `${binaryName}`;
        let id = `terraform-ls`;
        let name = `Terraform LS`;
        let wsFolder;
        let rootModulePaths;
        let excludeModulePaths;
        let documentSelector;
        let outputChannel;
        if (location) {
            channelName = `${binaryName}: ${location}`;
            id = `terraform-ls/${location}`;
            name = `Terraform LS: ${location}`;
            wsFolder = vscodeUtils_1.getWorkspaceFolder(location);
            documentSelector = [
                { scheme: 'file', language: 'terraform', pattern: `${wsFolder.uri.fsPath}/**/*` },
                { scheme: 'file', language: 'terraform-vars', pattern: `${wsFolder.uri.fsPath}/**/*` }
            ];
            rootModulePaths = vscodeUtils_1.config('terraform-ls', wsFolder).get('rootModules');
            excludeModulePaths = vscodeUtils_1.config('terraform-ls', wsFolder).get('excludeRootModules');
            outputChannel = vscode.window.createOutputChannel(channelName);
            outputChannel.appendLine(`Launching language server: ${cmd} ${serverArgs.join(' ')} for folder: ${location}`);
        }
        else {
            documentSelector = [
                { scheme: 'file', language: 'terraform' },
                { scheme: 'file', language: 'terraform-vars' }
            ];
            rootModulePaths = vscodeUtils_1.config('terraform-ls').get('rootModules');
            excludeModulePaths = vscodeUtils_1.config('terraform-ls').get('excludeRootModules');
            outputChannel = vscode.window.createOutputChannel(channelName);
            outputChannel.appendLine(`Launching language server: ${cmd} ${serverArgs.join(' ')}`);
        }
        if (rootModulePaths.length > 0 && excludeModulePaths.length > 0) {
            throw new Error('Only one of rootModules and excludeRootModules can be set at the same time, please remove the conflicting config and reload');
        }
        const commandPrefix = this.shortUid.seq();
        let initializationOptions = { commandPrefix, experimentalFeatures };
        if (rootModulePaths.length > 0) {
            initializationOptions = Object.assign(initializationOptions, { rootModulePaths });
        }
        if (excludeModulePaths.length > 0) {
            initializationOptions = Object.assign(initializationOptions, { excludeModulePaths });
        }
        const executable = {
            command: cmd,
            args: serverArgs,
            options: {}
        };
        const serverOptions = {
            run: executable,
            debug: executable
        };
        const clientOptions = {
            documentSelector: documentSelector,
            workspaceFolder: wsFolder,
            initializationOptions: initializationOptions,
            initializationFailedHandler: (error) => {
                this.reporter.sendTelemetryException(error);
                return false;
            },
            outputChannel: outputChannel,
            revealOutputChannelOn: node_1.RevealOutputChannelOn.Never,
        };
        const client = new node_1.LanguageClient(id, name, serverOptions, clientOptions);
        client.registerFeature(new showReferences_1.ShowReferencesFeature(client));
        client.onDidChangeState((event) => {
            if (event.newState === node_1.State.Stopped) {
                clients.delete(location);
                this.reporter.sendTelemetryEvent('stopClient');
            }
        });
        return { commandPrefix, client };
    }
    stopClients(folders) {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            if (this.supportsMultiFolders) {
                promises.push(this.stopClient(MULTI_FOLDER_CLIENT));
                return Promise.all(promises);
            }
            if (!folders) {
                folders = [];
                for (const key of clients.keys()) {
                    folders.push(key);
                }
            }
            for (const folder of folders) {
                promises.push(this.stopClient(folder));
            }
            return Promise.all(promises);
        });
    }
    stopClient(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!clients.has(folder)) {
                console.log(`Attempted to stop a client for folder: ${folder} but no client exists`);
                return;
            }
            return clients.get(folder).client.stop().then(() => {
                if (folder === "") {
                    console.log('Client stopped');
                    return;
                }
                console.log(`Client stopped for ${folder}`);
            }).then(() => {
                const ok = clients.delete(folder);
                if (ok) {
                    if (folder === "") {
                        console.log('Client deleted');
                        return;
                    }
                    console.log(`Client deleted for ${folder}`);
                }
            });
        });
    }
    resolvedPathToBinary() {
        const pathToBinary = this.lsPath.binPath();
        let cmd;
        try {
            if (path.isAbsolute(pathToBinary)) {
                fs.accessSync(pathToBinary, fs.constants.X_OK);
                cmd = pathToBinary;
            }
            else {
                cmd = which.sync(pathToBinary);
            }
            console.log(`Found server at ${cmd}`);
        }
        catch (err) {
            let extraHint;
            if (this.lsPath.hasCustomBinPath()) {
                extraHint = `. Check "${serverPath_1.CUSTOM_BIN_PATH_OPTION_NAME}" in your settings.`;
            }
            throw new Error(`Unable to launch language server: ${err.message}${extraHint}`);
        }
        return cmd;
    }
    getClient(document) {
        if (this.supportsMultiFolders) {
            return clients.get(MULTI_FOLDER_CLIENT);
        }
        return clients.get(this.clientName(document.toString()));
    }
    clientName(folderName, workspaceFolders = vscodeUtils_1.sortedWorkspaceFolders()) {
        folderName = vscodeUtils_1.normalizeFolderName(folderName);
        const outerFolder = workspaceFolders.find(element => folderName.startsWith(element));
        // If this folder isn't nested, the found item will be itself
        if (outerFolder && (outerFolder !== folderName)) {
            folderName = vscodeUtils_1.getFolderName(vscodeUtils_1.getWorkspaceFolder(outerFolder));
        }
        return folderName;
    }
}
exports.ClientHandler = ClientHandler;
//# sourceMappingURL=clientHandler.js.map