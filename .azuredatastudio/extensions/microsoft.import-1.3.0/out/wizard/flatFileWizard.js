"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatFileWizard = void 0;
const azdata = require("azdata");
const vscode = require("vscode");
// pages
const fileConfigPage_1 = require("./pages/fileConfigPage");
const prosePreviewPage_1 = require("./pages/prosePreviewPage");
const modifyColumnsPage_1 = require("./pages/modifyColumnsPage");
const summaryPage_1 = require("./pages/summaryPage");
const constants = require("../common/constants");
class FlatFileWizard {
    constructor(provider) {
        this.provider = provider;
    }
    async start(p, ...args) {
        let model = {};
        let profile = p === null || p === void 0 ? void 0 : p.connectionProfile;
        if (profile) {
            model.serverId = profile.id;
            model.database = profile.databaseName;
        }
        let pages = new Map();
        let connectionId = await this.getConnectionId();
        if (!connectionId) {
            return;
        }
        model.serverId = connectionId;
        this.wizard = azdata.window.createWizard(constants.wizardNameText);
        this.page1 = azdata.window.createWizardPage(constants.page1NameText);
        this.page2 = azdata.window.createWizardPage(constants.page2NameText);
        this.page3 = azdata.window.createWizardPage(constants.page3NameText);
        this.page4 = azdata.window.createWizardPage(constants.page4NameText);
        let fileConfigPage;
        this.page1.registerContent(async (view) => {
            fileConfigPage = new fileConfigPage_1.FileConfigPage(this, this.page1, model, view, this.provider);
            pages.set(0, fileConfigPage);
            await fileConfigPage.start().then(() => {
                fileConfigPage.setupNavigationValidator();
                fileConfigPage.onPageEnter();
            });
        });
        let prosePreviewPage;
        this.page2.registerContent(async (view) => {
            prosePreviewPage = new prosePreviewPage_1.ProsePreviewPage(this, this.page2, model, view, this.provider);
            pages.set(1, prosePreviewPage);
            await prosePreviewPage.start();
        });
        let modifyColumnsPage;
        this.page3.registerContent(async (view) => {
            modifyColumnsPage = new modifyColumnsPage_1.ModifyColumnsPage(this, this.page3, model, view, this.provider);
            pages.set(2, modifyColumnsPage);
            await modifyColumnsPage.start();
        });
        let summaryPage;
        this.page4.registerContent(async (view) => {
            summaryPage = new summaryPage_1.SummaryPage(this, this.page4, model, view, this.provider);
            pages.set(3, summaryPage);
            await summaryPage.start();
        });
        this.importAnotherFileButton = azdata.window.createButton(constants.importNewFileText);
        this.importAnotherFileButton.onClick(() => {
            //TODO replace this with proper cleanup for all the pages
            this.wizard.close();
            pages.forEach((page) => page.cleanup());
            this.wizard.open();
        });
        this.importAnotherFileButton.hidden = true;
        this.wizard.customButtons = [this.importAnotherFileButton];
        this.wizard.onPageChanged(async (event) => {
            let newPageIdx = event.newPage;
            let lastPageIdx = event.lastPage;
            let newPage = pages.get(newPageIdx);
            let lastPage = pages.get(lastPageIdx);
            if (lastPage) {
                await lastPage.onPageLeave();
            }
            if (newPage) {
                newPage.setupNavigationValidator();
                await newPage.onPageEnter();
            }
        });
        //not needed for this wizard
        this.wizard.generateScriptButton.hidden = true;
        this.wizard.pages = [this.page1, this.page2, this.page3, this.page4];
        this.wizard.open();
    }
    async getConnectionId() {
        let currentConnection = await azdata.connection.getCurrentConnection();
        let connectionId;
        if (!currentConnection) {
            let connection = await azdata.connection.openConnectionDialog(constants.supportedProviders);
            if (!connection) {
                vscode.window.showErrorMessage(constants.needConnectionText);
                return undefined;
            }
            connectionId = connection.connectionId;
        }
        else {
            if (currentConnection.providerId !== 'MSSQL') {
                vscode.window.showErrorMessage(constants.needSqlConnectionText);
                return undefined;
            }
            connectionId = currentConnection.connectionId;
        }
        return connectionId;
    }
    setImportAnotherFileVisibility(visibility) {
        this.importAnotherFileButton.hidden = !visibility;
    }
    registerNavigationValidator(validator) {
        this.wizard.registerNavigationValidator(validator);
    }
    changeNextButtonLabel(label) {
        this.wizard.nextButton.label = label;
    }
}
exports.FlatFileWizard = FlatFileWizard;
//# sourceMappingURL=flatFileWizard.js.map