"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DacFxSummaryPage = void 0;
const loc = require("../../localizedConstants");
const dataTierApplicationWizard_1 = require("../dataTierApplicationWizard");
const basePage_1 = require("../api/basePage");
class DacFxSummaryPage extends basePage_1.BasePage {
    constructor(instance, wizardPage, model, view) {
        super(instance, wizardPage, model, view);
    }
    async start() {
        this.table = this.view.modelBuilder.table().withProperties({
            title: loc.summaryTableTitle
        }).component();
        this.loader = this.view.modelBuilder.loadingComponent().withItem(this.table).component();
        this.form = this.view.modelBuilder.formContainer().withFormItems([
            {
                component: this.table,
                title: ''
            }
        ]).component();
        await this.view.initializeModel(this.form);
        return true;
    }
    async onPageEnter() {
        await this.populateTable();
        this.loader.loading = false;
        if (this.model.upgradeExisting && this.instance.selectedOperation === dataTierApplicationWizard_1.Operation.deploy) {
            this.instance.wizard.generateScriptButton.hidden = false;
        }
        this.instance.wizard.doneButton.focused = true;
        return true;
    }
    async onPageLeave() {
        this.instance.wizard.generateScriptButton.hidden = true;
        return true;
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator(() => {
            if (this.loader.loading) {
                return false;
            }
            return true;
        });
    }
    async populateTable() {
        let targetServer = loc.targetServer;
        let targetDatabase = loc.targetDatabase;
        let sourceServer = loc.sourceServer;
        let sourceDatabase = loc.sourceDatabase;
        let fileLocation = loc.fileLocation;
        switch (this.instance.selectedOperation) {
            case dataTierApplicationWizard_1.Operation.deploy: {
                this.data = [
                    [targetServer, this.model.serverName],
                    [fileLocation, this.model.filePath],
                    [targetDatabase, this.model.database]
                ];
                break;
            }
            case dataTierApplicationWizard_1.Operation.extract: {
                this.data = [
                    [sourceServer, this.model.serverName],
                    [sourceDatabase, this.model.database],
                    [loc.version, this.model.version],
                    [fileLocation, this.model.filePath]
                ];
                break;
            }
            case dataTierApplicationWizard_1.Operation.import: {
                this.data = [
                    [targetServer, this.model.serverName],
                    [fileLocation, this.model.filePath],
                    [targetDatabase, this.model.database]
                ];
                break;
            }
            case dataTierApplicationWizard_1.Operation.export: {
                this.data = [
                    [sourceServer, this.model.serverName],
                    [sourceDatabase, this.model.database],
                    [fileLocation, this.model.filePath]
                ];
                break;
            }
        }
        await this.table.updateProperties({
            data: this.data,
            columns: [
                {
                    value: loc.setting,
                    cssClass: 'align-with-header'
                },
                {
                    value: loc.value,
                    cssClass: 'align-with-header'
                }
            ],
            width: 700,
            height: 200,
            moveFocusOutWithTab: true
        });
    }
}
exports.DacFxSummaryPage = DacFxSummaryPage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/pages/dacFxSummaryPage.js.map
