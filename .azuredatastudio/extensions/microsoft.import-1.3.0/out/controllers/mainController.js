"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const constants = require("../common/constants");
const azdata = require("azdata");
const controllerBase_1 = require("./controllerBase");
const vscode = require("vscode");
const flatFileWizard_1 = require("../wizard/flatFileWizard");
const serviceClient_1 = require("../services/serviceClient");
const serviceApiManager_1 = require("../services/serviceApiManager");
/**
 * The main controller class that initializes the extension
 */
class MainController extends controllerBase_1.default {
    constructor(context) {
        super(context);
        this._outputChannel = vscode.window.createOutputChannel(constants.serviceName);
    }
    /**
     */
    deactivate() {
    }
    async activate() {
        const registerFileProviderPromise = new Promise(async (resolve) => {
            serviceApiManager_1.managerInstance.onRegisteredApi(serviceApiManager_1.ApiType.FlatFileProvider)(provider => {
                this.initializeFlatFileProvider(provider);
                resolve(true);
            });
        });
        const serviceClient = new serviceClient_1.ServiceClient(this._outputChannel);
        const serviceStartPromise = serviceClient.startService(this._context);
        await Promise.all([registerFileProviderPromise, serviceStartPromise]);
    }
    initializeFlatFileProvider(provider) {
        azdata.tasks.registerTask(constants.flatFileImportStartCommand, (profile, ...args) => new flatFileWizard_1.FlatFileWizard(provider).start(profile, args));
    }
}
exports.default = MainController;
//# sourceMappingURL=mainController.js.map