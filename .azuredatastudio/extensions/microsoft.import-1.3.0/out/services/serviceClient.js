"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceClient = void 0;
const dataprotocol_client_1 = require("dataprotocol-client");
const service_downloader_1 = require("service-downloader");
const vscode_languageclient_1 = require("vscode-languageclient");
const vscode = require("vscode");
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle();
const path = require("path");
const telemetry_1 = require("./telemetry");
const Constants = require("../common/constants");
const features_1 = require("./features");
const fs_1 = require("fs");
class ServiceClient {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
        this.statusView = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
    async startService(context) {
        const rawConfig = await fs_1.promises.readFile(path.join(context.extensionPath, 'config.json'));
        let clientOptions = this.createClientOptions();
        try {
            const installationStart = Date.now();
            let client;
            let serviceBinaries = await this.downloadBinaries(context, rawConfig);
            const installationComplete = Date.now();
            let serverOptions = this.generateServerOptions(serviceBinaries, context);
            client = new dataprotocol_client_1.SqlOpsDataClient(Constants.serviceName, serverOptions, clientOptions);
            const processStart = Date.now();
            client.onReady().then(() => {
                const processEnd = Date.now();
                this.statusView.text = localize('serviceStarted', "{0} Started", Constants.serviceName);
                setTimeout(() => {
                    this.statusView.hide();
                }, 1500);
                telemetry_1.Telemetry.sendTelemetryEvent('startup/LanguageClientStarted', {
                    installationTime: String(installationComplete - installationStart),
                    processStartupTime: String(processEnd - processStart),
                    totalTime: String(processEnd - installationStart),
                    beginningTimestamp: String(installationStart)
                });
            });
            this.statusView.show();
            this.statusView.text = localize('serviceStarting', "Starting {0}", Constants.serviceName);
            let disposable = client.start();
            context.subscriptions.push(disposable);
            return client;
        }
        catch (error) {
            telemetry_1.Telemetry.sendTelemetryEvent('ServiceInitializingFailed');
            vscode.window.showErrorMessage(localize('flatFileImport.serviceStartFailed', "Failed to start {0}: {1}", Constants.serviceName, error));
            // Just resolve to avoid unhandled promise. We show the error to the user.
            return undefined;
        }
    }
    async downloadBinaries(context, rawConfig) {
        const config = JSON.parse(rawConfig.toString());
        config.installDirectory = path.join(context.extensionPath, config.installDirectory);
        config.proxy = vscode.workspace.getConfiguration('http').get('proxy');
        config.strictSSL = vscode.workspace.getConfiguration('http').get('proxyStrictSSL') || true;
        const serverdownloader = new service_downloader_1.ServerProvider(config);
        serverdownloader.eventEmitter.onAny(this.generateHandleServerProviderEvent());
        return serverdownloader.getOrDownloadServer();
    }
    createClientOptions() {
        return {
            providerId: Constants.providerId,
            errorHandler: new telemetry_1.LanguageClientErrorHandler(),
            synchronize: {
                configurationSection: [Constants.extensionConfigSectionName, Constants.sqlConfigSectionName]
            },
            features: [
                // we only want to add new features
                features_1.TelemetryFeature,
                features_1.FlatFileImportFeature
            ],
            outputChannel: new CustomOutputChannel()
        };
    }
    generateServerOptions(executablePath, context) {
        let launchArgs = [];
        launchArgs.push('--log-dir');
        let logFileLocation = context.logPath;
        launchArgs.push(logFileLocation);
        let config = vscode.workspace.getConfiguration(Constants.extensionConfigSectionName);
        if (config) {
            let logDebugInfo = config[Constants.configLogDebugInfo];
            if (logDebugInfo) {
                launchArgs.push('--enable-logging');
            }
        }
        return { command: executablePath, args: launchArgs, transport: vscode_languageclient_1.TransportKind.stdio };
    }
    generateHandleServerProviderEvent() {
        let dots = 0;
        return (e, ...args) => {
            switch (e) {
                case "install_start" /* INSTALL_START */:
                    this.outputChannel.show(true);
                    this.statusView.show();
                    this.outputChannel.appendLine(localize('installingServiceDetailed', "Installing {0} to {1}", Constants.serviceName, args[0]));
                    this.statusView.text = localize('installingService', "Installing {0} Service", Constants.serviceName);
                    break;
                case "install_end" /* INSTALL_END */:
                    this.outputChannel.appendLine(localize('serviceInstalled', "Installed {0}", Constants.serviceName));
                    break;
                case "download_start" /* DOWNLOAD_START */:
                    this.outputChannel.appendLine(localize('downloadingService', "Downloading {0}", args[0]));
                    this.outputChannel.append(localize('downloadingServiceSize', "({0} KB)", Math.ceil(args[1] / 1024).toLocaleString(vscode.env.language)));
                    this.statusView.text = localize('downloadingServiceStatus', "Downloading {0}", Constants.serviceName);
                    break;
                case "download_progress" /* DOWNLOAD_PROGRESS */:
                    let newDots = Math.ceil(args[0] / 5);
                    if (newDots > dots) {
                        this.outputChannel.append('.'.repeat(newDots - dots));
                        dots = newDots;
                    }
                    break;
                case "download_end" /* DOWNLOAD_END */:
                    this.outputChannel.appendLine(localize('downloadingServiceComplete', "Done downloading {0}", Constants.serviceName));
                    break;
                case "entry_extracted" /* ENTRY_EXTRACTED */:
                    this.outputChannel.appendLine(localize('entryExtractedChannelMsg', "Extracted {0} ({1}/{2})", args[0], args[1], args[2]));
                    break;
            }
        };
    }
}
exports.ServiceClient = ServiceClient;
class CustomOutputChannel {
    append(value) {
    }
    appendLine(value) {
    }
    // tslint:disable-next-line:no-empty
    clear() {
    }
    // tslint:disable-next-line:no-empty
    show(column, preserveFocus) {
    }
    // tslint:disable-next-line:no-empty
    hide() {
    }
    // tslint:disable-next-line:no-empty
    dispose() {
    }
}
//# sourceMappingURL=serviceClient.js.map