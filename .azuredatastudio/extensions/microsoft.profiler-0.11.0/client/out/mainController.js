/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const apiWrapper_1 = require("./apiWrapper");
const profilerCreateSessionDialog_1 = require("./dialogs/profilerCreateSessionDialog");
/**
 * The main controller class that initializes the extension
 */
class MainController {
    // PUBLIC METHODS
    constructor(context, apiWrapper) {
        this._apiWrapper = apiWrapper || new apiWrapper_1.ApiWrapper();
        this._context = context;
    }
    /**
     * Deactivates the extension
     */
    deactivate() {
    }
    activate() {
        vscode.commands.registerCommand('profiler.openCreateSessionDialog', (ownerUri, providerType, templates) => {
            let dialog = new profilerCreateSessionDialog_1.CreateSessionDialog(ownerUri, providerType, templates);
            dialog.showDialog();
        });
    }
}
exports.MainController = MainController;
//# sourceMappingURL=mainController.js.map