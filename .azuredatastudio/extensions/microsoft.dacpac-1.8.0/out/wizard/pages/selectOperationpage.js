"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectOperationPage = void 0;
const loc = require("../../localizedConstants");
const dataTierApplicationWizard_1 = require("../dataTierApplicationWizard");
const basePage_1 = require("../api/basePage");
class SelectOperationPage extends basePage_1.BasePage {
    constructor(instance, wizardPage, model, view) {
        super(instance, wizardPage, model, view);
    }
    async start() {
        let deployComponent = await this.createDeployRadioButton();
        let extractComponent = await this.createExtractRadioButton();
        let importComponent = await this.createImportRadioButton();
        let exportComponent = await this.createExportRadioButton();
        this.form = this.view.modelBuilder.formContainer()
            .withFormItems([
            deployComponent,
            extractComponent,
            importComponent,
            exportComponent
        ], {
            horizontal: true
        }).component();
        await this.view.initializeModel(this.form);
        this.deployRadioButton.focus();
        this.instance.setDoneButton(dataTierApplicationWizard_1.Operation.deploy);
        return true;
    }
    async onPageEnter() {
        return true;
    }
    async createDeployRadioButton() {
        this.deployRadioButton = this.view.modelBuilder.radioButton()
            .withProperties({
            name: 'selectedOperation',
            label: loc.deployDescription,
            checked: true // Default to first radio button being selected
        }).component();
        this.deployRadioButton.onDidClick(() => {
            this.removePages();
            //add deploy pages
            let configPage = this.instance.pages.get(dataTierApplicationWizard_1.PageName.deployConfig);
            this.instance.wizard.addPage(configPage.wizardPage, dataTierApplicationWizard_1.DeployOperationPath.deployOptions);
            let deployPlanPage = this.instance.pages.get(dataTierApplicationWizard_1.PageName.deployPlan);
            this.instance.wizard.addPage(deployPlanPage.wizardPage, dataTierApplicationWizard_1.DeployOperationPath.deployPlan);
            this.addSummaryPage(dataTierApplicationWizard_1.DeployOperationPath.summary);
            // change button text and operation
            this.instance.setDoneButton(dataTierApplicationWizard_1.Operation.deploy);
        });
        return {
            component: this.deployRadioButton,
            title: ''
        };
    }
    async createExtractRadioButton() {
        this.extractRadioButton = this.view.modelBuilder.radioButton()
            .withProperties({
            name: 'selectedOperation',
            label: loc.extractDescription,
        }).component();
        this.extractRadioButton.onDidClick(() => {
            this.removePages();
            // add the extract page
            let page = this.instance.pages.get(dataTierApplicationWizard_1.PageName.extractConfig);
            this.instance.wizard.addPage(page.wizardPage, dataTierApplicationWizard_1.ExtractOperationPath.options);
            this.addSummaryPage(dataTierApplicationWizard_1.ExtractOperationPath.summary);
            // change button text and operation
            this.instance.setDoneButton(dataTierApplicationWizard_1.Operation.extract);
        });
        return {
            component: this.extractRadioButton,
            title: ''
        };
    }
    async createImportRadioButton() {
        this.importRadioButton = this.view.modelBuilder.radioButton()
            .withProperties({
            name: 'selectedOperation',
            label: loc.importDescription,
        }).component();
        this.importRadioButton.onDidClick(() => {
            this.removePages();
            // add the import page
            let page = this.instance.pages.get(dataTierApplicationWizard_1.PageName.importConfig);
            this.instance.wizard.addPage(page.wizardPage, dataTierApplicationWizard_1.ImportOperationPath.options);
            this.addSummaryPage(dataTierApplicationWizard_1.ImportOperationPath.summary);
            // change button text and operation
            this.instance.setDoneButton(dataTierApplicationWizard_1.Operation.import);
        });
        return {
            component: this.importRadioButton,
            title: ''
        };
    }
    async createExportRadioButton() {
        this.exportRadioButton = this.view.modelBuilder.radioButton()
            .withProperties({
            name: 'selectedOperation',
            label: loc.exportDescription,
        }).component();
        this.exportRadioButton.onDidClick(() => {
            this.removePages();
            // add the export pages
            let page = this.instance.pages.get(dataTierApplicationWizard_1.PageName.exportConfig);
            this.instance.wizard.addPage(page.wizardPage, dataTierApplicationWizard_1.ExportOperationPath.options);
            this.addSummaryPage(dataTierApplicationWizard_1.ExportOperationPath.summary);
            // change button text and operation
            this.instance.setDoneButton(dataTierApplicationWizard_1.Operation.export);
        });
        return {
            component: this.exportRadioButton,
            title: ''
        };
    }
    removePages() {
        let numPages = this.instance.wizard.pages.length;
        for (let i = numPages - 1; i > 0; --i) {
            this.instance.wizard.removePage(i);
        }
    }
    addSummaryPage(index) {
        let summaryPage = this.instance.pages.get(dataTierApplicationWizard_1.PageName.summary);
        this.instance.wizard.addPage(summaryPage.wizardPage, index);
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator(() => {
            return true;
        });
    }
}
exports.SelectOperationPage = SelectOperationPage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/pages/selectOperationpage.js.map
