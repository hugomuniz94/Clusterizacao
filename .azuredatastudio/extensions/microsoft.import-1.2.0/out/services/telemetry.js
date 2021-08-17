"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemetry = exports.LanguageClientErrorHandler = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
const vscode = require("vscode");
const constants = require("../common/constants");
/**
 * Handle Language Service client errors
 */
class LanguageClientErrorHandler {
    /**
     * Creates an instance of LanguageClientErrorHandler.
     * @memberOf LanguageClientErrorHandler
     */
    constructor() {
    }
    /**
     * Show an error message prompt with a link to known issues wiki page
     * @memberOf LanguageClientErrorHandler
     */
    showOnErrorPrompt() {
        // TODO add telemetry
        // Telemetry.sendTelemetryEvent('SqlToolsServiceCrash');
        vscode.window.showErrorMessage(constants.serviceCrashMessageText, constants.crashButtonText).then(action => {
            if (action && action === constants.crashButtonText) {
                vscode.env.openExternal(vscode.Uri.parse(constants.serviceCrashLink));
            }
        });
    }
    /**
     * Callback for language service client error
     *
     * @memberOf LanguageClientErrorHandler
     */
    error(error, message, count) {
        this.showOnErrorPrompt();
        // we don't retry running the service since crashes leave the extension
        // in a bad, unrecovered state
        return vscode_languageclient_1.ErrorAction.Shutdown;
    }
    /**
     * Callback for language service client closed
     *
     * @memberOf LanguageClientErrorHandler
     */
    closed() {
        this.showOnErrorPrompt();
        // we don't retry running the service since crashes leave the extension
        // in a bad, unrecovered state
        return vscode_languageclient_1.CloseAction.DoNotRestart;
    }
}
exports.LanguageClientErrorHandler = LanguageClientErrorHandler;
class Telemetry {
    /**
     * Disable telemetry reporting
     */
    static disable() {
        this.disabled = true;
    }
    /**
     * Initialize the telemetry reporter for use.
     */
    static initialize() {
        if (typeof this.reporter === 'undefined') {
            // Check if the user has opted out of telemetry
            if (!vscode.workspace.getConfiguration('telemetry').get('enableTelemetry', true)) {
                this.disable();
                return;
            }
            let packageInfo = vscode.extensions.getExtension('Microsoft.import').packageJSON;
            this.reporter = new vscode_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
        }
    }
    /**
     * Send a telemetry event using application insights
     */
    static sendTelemetryEvent(eventName, properties, measures) {
        if (typeof this.disabled === 'undefined') {
            this.disabled = false;
        }
        if (this.disabled || typeof (this.reporter) === 'undefined') {
            // Don't do anything if telemetry is disabled
            return;
        }
        if (!properties || typeof properties === 'undefined') {
            properties = {};
        }
        try {
            this.reporter.sendTelemetryEvent(eventName, properties, measures);
        }
        catch (telemetryErr) {
            // If sending telemetry event fails ignore it so it won't break the extension
            console.error('Failed to send telemetry event. error: ' + telemetryErr);
        }
    }
}
exports.Telemetry = Telemetry;
Telemetry.initialize();
//# sourceMappingURL=telemetry.js.map