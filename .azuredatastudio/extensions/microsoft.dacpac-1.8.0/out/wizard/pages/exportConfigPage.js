"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportConfigPage = void 0;
const vscode = require("vscode");
const loc = require("../../localizedConstants");
const dacFxConfigPage_1 = require("../api/dacFxConfigPage");
class ExportConfigPage extends dacFxConfigPage_1.DacFxConfigPage {
    constructor(instance, wizardPage, model, view) {
        super(instance, wizardPage, model, view);
        this.fileExtension = '.bacpac';
    }
    async start() {
        let databaseComponent = await this.createDatabaseDropdown();
        let serverComponent = await this.createServerDropdown(false);
        let fileBrowserComponent = await this.createFileBrowser();
        this.form = this.view.modelBuilder.formContainer()
            .withFormItems([
            serverComponent,
            databaseComponent,
            fileBrowserComponent,
        ], {
            horizontal: true,
            componentWidth: 400
        }).component();
        await this.view.initializeModel(this.form);
        return true;
    }
    async onPageEnter() {
        let r1 = await this.populateServerDropdown();
        let r2 = await this.populateDatabaseDropdown();
        return r1 && r2;
    }
    async onPageLeave() {
        this.appendFileExtensionIfNeeded();
        return true;
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator(() => {
            if (this.databaseLoader.loading) {
                return false;
            }
            return true;
        });
    }
    async createFileBrowser() {
        this.createFileBrowserParts();
        // default filepath
        this.fileTextBox.value = this.generateFilePathFromDatabaseAndTimestamp();
        this.model.filePath = this.fileTextBox.value;
        this.fileButton.onDidClick(async (click) => {
            let fileUri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(this.fileTextBox.value),
                saveLabel: loc.save,
                filters: {
                    'bacpac Files': ['bacpac'],
                }
            });
            if (!fileUri) {
                return;
            }
            this.fileTextBox.value = fileUri.fsPath;
            this.model.filePath = fileUri.fsPath;
        });
        this.fileTextBox.onTextChanged(async () => {
            this.model.filePath = this.fileTextBox.value;
        });
        return {
            component: this.fileTextBox,
            title: loc.fileLocation,
            actions: [this.fileButton]
        };
    }
}
exports.ExportConfigPage = ExportConfigPage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/pages/exportConfigPage.js.map
