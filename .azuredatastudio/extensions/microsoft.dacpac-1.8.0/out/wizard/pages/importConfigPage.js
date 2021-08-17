"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportConfigPage = void 0;
const vscode = require("vscode");
const loc = require("../../localizedConstants");
const dacFxConfigPage_1 = require("../api/dacFxConfigPage");
const utils_1 = require("../api/utils");
class ImportConfigPage extends dacFxConfigPage_1.DacFxConfigPage {
    constructor(instance, wizardPage, model, view) {
        super(instance, wizardPage, model, view);
        this.fileExtension = '.bacpac';
    }
    async start() {
        let databaseComponent = await this.createDatabaseTextBox(loc.targetDatabase);
        let serverComponent = await this.createServerDropdown(true);
        let fileBrowserComponent = await this.createFileBrowser();
        this.form = this.view.modelBuilder.formContainer()
            .withFormItems([
            fileBrowserComponent,
            serverComponent,
            databaseComponent,
        ], {
            horizontal: true,
            componentWidth: 400
        }).component();
        await this.view.initializeModel(this.form);
        return true;
    }
    async onPageEnter() {
        let r1 = await this.populateServerDropdown();
        // get existing database values to verify if new database name is valid
        await this.getDatabaseValues();
        return r1;
    }
    async createFileBrowser() {
        this.createFileBrowserParts();
        this.fileButton.onDidClick(async (click) => { this.selectionPromise = this.handleFileSelection(); });
        this.fileTextBox.onTextChanged(async () => {
            this.model.filePath = this.fileTextBox.value;
            this.model.database = utils_1.generateDatabaseName(this.model.filePath);
            this.databaseTextBox.value = this.model.database;
        });
        return {
            component: this.fileTextBox,
            title: loc.fileLocation,
            actions: [this.fileButton]
        };
    }
    async handleFileSelection() {
        let fileUris = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: vscode.Uri.file(this.getRootPath()),
            openLabel: loc.open,
            filters: {
                'bacpac Files': ['bacpac'],
            }
        });
        if (!fileUris || fileUris.length === 0) {
            return;
        }
        let fileUri = fileUris[0];
        this.fileTextBox.value = fileUri.fsPath;
        this.model.filePath = fileUri.fsPath;
        this.model.database = utils_1.generateDatabaseName(this.model.filePath);
        this.databaseTextBox.value = this.model.database;
    }
}
exports.ImportConfigPage = ImportConfigPage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/pages/importConfigPage.js.map
