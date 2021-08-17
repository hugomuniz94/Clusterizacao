"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTierApplicationWizard = exports.PageName = exports.ExportOperationPath = exports.ImportOperationPath = exports.ExtractOperationPath = exports.DeployNewOperationPath = exports.DeployOperationPath = exports.Operation = void 0;
const vscode = require("vscode");
const azdata = require("azdata");
const loc = require("../localizedConstants");
const utils = require("../utils");
const selectOperationpage_1 = require("./pages/selectOperationpage");
const deployConfigPage_1 = require("./pages/deployConfigPage");
const deployPlanPage_1 = require("./pages/deployPlanPage");
const dacFxSummaryPage_1 = require("./pages/dacFxSummaryPage");
const exportConfigPage_1 = require("./pages/exportConfigPage");
const extractConfigPage_1 = require("./pages/extractConfigPage");
const importConfigPage_1 = require("./pages/importConfigPage");
const telemetry_1 = require("../telemetry");
const msSqlProvider = 'MSSQL';
class Page {
    constructor(wizardPage) {
        this.wizardPage = wizardPage;
    }
}
var Operation;
(function (Operation) {
    Operation[Operation["deploy"] = 0] = "deploy";
    Operation[Operation["extract"] = 1] = "extract";
    Operation[Operation["import"] = 2] = "import";
    Operation[Operation["export"] = 3] = "export";
})(Operation = exports.Operation || (exports.Operation = {}));
var DeployOperationPath;
(function (DeployOperationPath) {
    DeployOperationPath[DeployOperationPath["selectOperation"] = 0] = "selectOperation";
    DeployOperationPath[DeployOperationPath["deployOptions"] = 1] = "deployOptions";
    DeployOperationPath[DeployOperationPath["deployPlan"] = 2] = "deployPlan";
    DeployOperationPath[DeployOperationPath["summary"] = 3] = "summary";
})(DeployOperationPath = exports.DeployOperationPath || (exports.DeployOperationPath = {}));
var DeployNewOperationPath;
(function (DeployNewOperationPath) {
    DeployNewOperationPath[DeployNewOperationPath["selectOperation"] = 0] = "selectOperation";
    DeployNewOperationPath[DeployNewOperationPath["deployOptions"] = 1] = "deployOptions";
    DeployNewOperationPath[DeployNewOperationPath["summary"] = 2] = "summary";
})(DeployNewOperationPath = exports.DeployNewOperationPath || (exports.DeployNewOperationPath = {}));
var ExtractOperationPath;
(function (ExtractOperationPath) {
    ExtractOperationPath[ExtractOperationPath["selectOperation"] = 0] = "selectOperation";
    ExtractOperationPath[ExtractOperationPath["options"] = 1] = "options";
    ExtractOperationPath[ExtractOperationPath["summary"] = 2] = "summary";
})(ExtractOperationPath = exports.ExtractOperationPath || (exports.ExtractOperationPath = {}));
var ImportOperationPath;
(function (ImportOperationPath) {
    ImportOperationPath[ImportOperationPath["selectOperation"] = 0] = "selectOperation";
    ImportOperationPath[ImportOperationPath["options"] = 1] = "options";
    ImportOperationPath[ImportOperationPath["summary"] = 2] = "summary";
})(ImportOperationPath = exports.ImportOperationPath || (exports.ImportOperationPath = {}));
var ExportOperationPath;
(function (ExportOperationPath) {
    ExportOperationPath[ExportOperationPath["selectOperation"] = 0] = "selectOperation";
    ExportOperationPath[ExportOperationPath["options"] = 1] = "options";
    ExportOperationPath[ExportOperationPath["summary"] = 2] = "summary";
})(ExportOperationPath = exports.ExportOperationPath || (exports.ExportOperationPath = {}));
var PageName;
(function (PageName) {
    PageName["selectOperation"] = "selectOperation";
    PageName["deployConfig"] = "deployConfig";
    PageName["deployPlan"] = "deployPlan";
    PageName["extractConfig"] = "extractConfig";
    PageName["importConfig"] = "importConfig";
    PageName["exportConfig"] = "exportConfig";
    PageName["summary"] = "summary";
})(PageName = exports.PageName || (exports.PageName = {}));
class DataTierApplicationWizard {
    constructor(dacfxInputService, extensionContext) {
        var _a;
        this.pages = new Map();
        this.wizard = azdata.window.createWizard(loc.wizardTitle, 'Data Tier Application Wizard');
        this.dacfxService = dacfxInputService;
        this.extensionContextExtensionPath = (_a = extensionContext === null || extensionContext === void 0 ? void 0 : extensionContext.extensionPath) !== null && _a !== void 0 ? _a : '';
    }
    async start(p) {
        this.model = {};
        let profile = p ? p.connectionProfile : undefined;
        if (profile) {
            this.model.serverId = profile.id;
            this.model.database = profile.databaseName;
        }
        this.connection = await azdata.connection.getCurrentConnection();
        if (!this.connection || (profile && this.connection.connectionId !== profile.id)) {
            // check if there are any active connections
            const connections = await azdata.connection.getConnections(true);
            if (connections.length > 0) {
                // set connection to the first one in the list
                this.connection = connections[0];
            }
            else {
                // @TODO: remove cast once azdata update complete - karlb 3/1/2019
                this.connection = await azdata.connection.openConnectionDialog(undefined, profile);
            }
            // don't open the wizard if connection dialog is cancelled
            if (!this.connection) {
                //Reporting Dacpac wizard cancelled event to Telemetry
                telemetry_1.TelemetryReporter.sendActionEvent(telemetry_1.TelemetryViews.DataTierApplicationWizard, 'ConnectionDialogCancelled');
                return false;
            }
        }
        this.model.serverId = this.connection.connectionId;
        this.setPages();
        this.configureButtons();
        this.wizard.open();
        return true;
    }
    setPages() {
        let selectOperationWizardPage = azdata.window.createWizardPage(loc.selectOperationPageName, 'Select an Operation Page');
        let deployConfigWizardPage = azdata.window.createWizardPage(loc.deployConfigPageName, 'Deploy Config Page');
        let deployPlanWizardPage = azdata.window.createWizardPage(loc.deployPlanPageName, 'Deploy Plan Page');
        let summaryWizardPage = azdata.window.createWizardPage(loc.summaryPageName, 'Summary Page');
        let extractConfigWizardPage = azdata.window.createWizardPage(loc.extractConfigPageName, 'Extract Config Page');
        let importConfigWizardPage = azdata.window.createWizardPage(loc.importConfigPageName, 'Import Config Page');
        let exportConfigWizardPage = azdata.window.createWizardPage(loc.exportConfigPageName, 'Export Config Page');
        this.pages.set(PageName.selectOperation, new Page(selectOperationWizardPage));
        this.pages.set(PageName.deployConfig, new Page(deployConfigWizardPage));
        this.pages.set(PageName.deployPlan, new Page(deployPlanWizardPage));
        this.pages.set(PageName.extractConfig, new Page(extractConfigWizardPage));
        this.pages.set(PageName.importConfig, new Page(importConfigWizardPage));
        this.pages.set(PageName.exportConfig, new Page(exportConfigWizardPage));
        this.pages.set(PageName.summary, new Page(summaryWizardPage));
        selectOperationWizardPage.registerContent(async (view) => {
            let selectOperationDacFxPage = new selectOperationpage_1.SelectOperationPage(this, selectOperationWizardPage, this.model, view);
            this.pages.get('selectOperation').dacFxPage = selectOperationDacFxPage;
            await selectOperationDacFxPage.start().then(() => {
                selectOperationDacFxPage.setupNavigationValidator();
                selectOperationDacFxPage.onPageEnter();
            });
        });
        deployConfigWizardPage.registerContent(async (view) => {
            let deployConfigDacFxPage = new deployConfigPage_1.DeployConfigPage(this, deployConfigWizardPage, this.model, view);
            this.pages.get(PageName.deployConfig).dacFxPage = deployConfigDacFxPage;
            await deployConfigDacFxPage.start();
        });
        deployPlanWizardPage.registerContent(async (view) => {
            let deployPlanDacFxPage = new deployPlanPage_1.DeployPlanPage(this, deployPlanWizardPage, this.model, view);
            this.pages.get(PageName.deployPlan).dacFxPage = deployPlanDacFxPage;
            await deployPlanDacFxPage.start();
        });
        extractConfigWizardPage.registerContent(async (view) => {
            let extractConfigDacFxPage = new extractConfigPage_1.ExtractConfigPage(this, extractConfigWizardPage, this.model, view);
            this.pages.get(PageName.extractConfig).dacFxPage = extractConfigDacFxPage;
            await extractConfigDacFxPage.start();
        });
        importConfigWizardPage.registerContent(async (view) => {
            let importConfigDacFxPage = new importConfigPage_1.ImportConfigPage(this, importConfigWizardPage, this.model, view);
            this.pages.get(PageName.importConfig).dacFxPage = importConfigDacFxPage;
            await importConfigDacFxPage.start();
        });
        exportConfigWizardPage.registerContent(async (view) => {
            let exportConfigDacFxPage = new exportConfigPage_1.ExportConfigPage(this, exportConfigWizardPage, this.model, view);
            this.pages.get(PageName.exportConfig).dacFxPage = exportConfigDacFxPage;
            await exportConfigDacFxPage.start();
        });
        summaryWizardPage.registerContent(async (view) => {
            let summaryDacFxPage = new dacFxSummaryPage_1.DacFxSummaryPage(this, summaryWizardPage, this.model, view);
            this.pages.get(PageName.summary).dacFxPage = summaryDacFxPage;
            await summaryDacFxPage.start();
        });
        this.wizard.onPageChanged(async (event) => {
            let idxLast = event.lastPage;
            let lastPage = this.getPage(idxLast);
            if (lastPage) {
                lastPage.dacFxPage.onPageLeave();
            }
            let idx = event.newPage;
            let page = this.getPage(idx);
            if (page) {
                page.dacFxPage.setupNavigationValidator();
                page.dacFxPage.onPageEnter();
            }
        });
        this.wizard.pages = [selectOperationWizardPage, deployConfigWizardPage, deployPlanWizardPage, summaryWizardPage];
    }
    configureButtons() {
        this.wizard.generateScriptButton.hidden = true;
        this.wizard.generateScriptButton.onClick(async () => await this.generateDeployScript());
        this.wizard.doneButton.onClick(async () => await this.executeOperation());
        this.wizard.cancelButton.onClick(() => this.cancelDataTierApplicationWizard());
    }
    registerNavigationValidator(validator) {
        this.wizard.registerNavigationValidator(validator);
    }
    setDoneButton(operation) {
        switch (operation) {
            case Operation.deploy: {
                this.wizard.doneButton.label = loc.deploy;
                this.selectedOperation = Operation.deploy;
                break;
            }
            case Operation.extract: {
                this.wizard.doneButton.label = loc.extract;
                this.selectedOperation = Operation.extract;
                break;
            }
            case Operation.import: {
                this.wizard.doneButton.label = loc.importText;
                this.selectedOperation = Operation.import;
                break;
            }
            case Operation.export: {
                this.wizard.doneButton.label = loc.exportText;
                this.selectedOperation = Operation.export;
                break;
            }
        }
        if (operation !== Operation.deploy) {
            this.model.upgradeExisting = false;
        }
    }
    async executeOperation() {
        let result;
        switch (this.selectedOperation) {
            case Operation.deploy: {
                result = await this.deploy();
                break;
            }
            case Operation.extract: {
                result = await this.extract();
                break;
            }
            case Operation.import: {
                result = await this.import();
                break;
            }
            case Operation.export: {
                result = await this.export();
                break;
            }
        }
        if (!result || !result.success) {
            vscode.window.showErrorMessage(this.getOperationErrorMessage(this.selectedOperation, result === null || result === void 0 ? void 0 : result.errorMessage));
        }
        return result;
    }
    getOperationErrorMessage(operation, error) {
        switch (this.selectedOperation) {
            case Operation.deploy: {
                return loc.operationErrorMessage(loc.deploy, error);
            }
            case Operation.extract: {
                return loc.operationErrorMessage(loc.extract, error);
            }
            case Operation.import: {
                return loc.operationErrorMessage(loc.importText, error);
            }
            case Operation.export: {
                return loc.operationErrorMessage(loc.exportText, error);
            }
        }
    }
    // Cancel button on click event is using to send the data loss information to telemetry
    cancelDataTierApplicationWizard() {
        var _a;
        telemetry_1.TelemetryReporter.createActionEvent(telemetry_1.TelemetryViews.DataTierApplicationWizard, 'WizardCanceled')
            .withAdditionalProperties({
            isPotentialDataLoss: (_a = this.model.potentialDataLoss) === null || _a === void 0 ? void 0 : _a.toString()
        }).send();
    }
    async deploy() {
        const deployStartTime = new Date().getTime();
        let service;
        let ownerUri;
        let result;
        let additionalProps = {};
        let additionalMeasurements = {};
        try {
            service = await this.getService(msSqlProvider);
            ownerUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
            result = await service.deployDacpac(this.model.filePath, this.model.database, this.model.upgradeExisting, ownerUri, azdata.TaskExecutionMode.execute);
        }
        catch (e) {
            additionalProps.exceptionOccurred = 'true';
        }
        // If result is null which means exception occured, will be adding additional props to the Telemetry
        if (!result) {
            additionalProps = { ...additionalProps, ...this.getDacServiceArgsAsProps(service, this.model.database, this.model.filePath, ownerUri) };
        }
        additionalProps.deploymentStatus = result === null || result === void 0 ? void 0 : result.success.toString();
        additionalProps.upgradeExistingDatabase = this.model.upgradeExisting.toString();
        additionalProps.potentialDataLoss = this.model.potentialDataLoss.toString();
        additionalMeasurements.deployDacpacFileSizeBytes = await utils.tryGetFileSize(this.model.filePath);
        additionalMeasurements.totalDurationMs = (new Date().getTime() - deployStartTime);
        // Deploy Dacpac: 'Deploy button' clicked in deploy summary page, Reporting the event selection to the telemetry
        this.sendDacServiceTelemetryEvent(telemetry_1.TelemetryViews.DeployDacpac, 'DeployDacpacOperation', additionalProps, additionalMeasurements);
        return result;
    }
    async extract() {
        const extractStartTime = new Date().getTime();
        let service;
        let ownerUri;
        let result;
        let additionalProps = {};
        let additionalMeasurements = {};
        try {
            service = await this.getService(msSqlProvider);
            ownerUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
            result = await service.extractDacpac(this.model.database, this.model.filePath, this.model.database, this.model.version, ownerUri, azdata.TaskExecutionMode.execute);
        }
        catch (e) {
            additionalProps.exceptionOccurred = 'true';
        }
        // If result is null which means exception occured, will be adding additional props to the Telemetry
        if (!result) {
            additionalProps = { ...additionalProps, ...this.getDacServiceArgsAsProps(service, this.model.database, this.model.filePath, ownerUri) };
        }
        additionalProps.extractStatus = result === null || result === void 0 ? void 0 : result.success.toString();
        additionalMeasurements.extractedDacpacFileSizeBytes = await utils.tryGetFileSize(this.model.filePath);
        additionalMeasurements.totalDurationMs = (new Date().getTime() - extractStartTime);
        // Extract Dacpac: 'Extract button' clicked in extract summary page, Reporting the event selection to the telemetry
        this.sendDacServiceTelemetryEvent(telemetry_1.TelemetryViews.ExtractDacpac, 'ExtractDacpacOperation', additionalProps, additionalMeasurements);
        return result;
    }
    async export() {
        const exportStartTime = new Date().getTime();
        let service;
        let ownerUri;
        let result;
        let additionalProps = {};
        let additionalMeasurements = {};
        try {
            service = await this.getService(msSqlProvider);
            ownerUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
            result = await service.exportBacpac(this.model.database, this.model.filePath, ownerUri, azdata.TaskExecutionMode.execute);
        }
        catch (e) {
            additionalProps.exceptionOccurred = 'true';
        }
        // If result is null which means exception occured, will be adding additional props to the Telemetry
        if (!result) {
            additionalProps = { ...additionalProps, ...this.getDacServiceArgsAsProps(service, this.model.database, this.model.filePath, ownerUri) };
        }
        additionalProps.exportStatus = result === null || result === void 0 ? void 0 : result.success.toString();
        additionalMeasurements.exportedBacpacFileSizeBytes = await utils.tryGetFileSize(this.model.filePath);
        additionalMeasurements.totalDurationMs = (new Date().getTime() - exportStartTime);
        // Export Bacpac: 'Export button' clicked in Export summary page, Reporting the event selection to the telemetry
        this.sendDacServiceTelemetryEvent(telemetry_1.TelemetryViews.ExportBacpac, 'ExportBacpacOperation', additionalProps, additionalMeasurements);
        return result;
    }
    async import() {
        const importStartTime = new Date().getTime();
        let service;
        let ownerUri;
        let result;
        let additionalProps = {};
        let additionalMeasurements = {};
        try {
            service = await this.getService(msSqlProvider);
            ownerUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
            result = await service.importBacpac(this.model.filePath, this.model.database, ownerUri, azdata.TaskExecutionMode.execute);
        }
        catch (e) {
            additionalProps.exceptionOccurred = 'true';
        }
        // If result is null which means exception occured, will be adding additional props to the Telemetry
        if (!result) {
            additionalProps = { ...additionalProps, ...this.getDacServiceArgsAsProps(service, this.model.database, this.model.filePath, ownerUri) };
        }
        additionalProps.importStatus = result === null || result === void 0 ? void 0 : result.success.toString();
        additionalMeasurements.importedBacpacFileSizeBytes = await utils.tryGetFileSize(this.model.filePath);
        additionalMeasurements.totalDurationMs = (new Date().getTime() - importStartTime);
        // Import Bacpac: 'Import button' clicked in Import summary page, Reporting the event selection to the telemetry
        this.sendDacServiceTelemetryEvent(telemetry_1.TelemetryViews.ImportBacpac, 'ImportBacpacOperation', additionalProps, additionalMeasurements);
        return result;
    }
    async generateDeployScript() {
        const genScriptStartTime = new Date().getTime();
        let service;
        let ownerUri;
        let result;
        let additionalProps = {};
        let additionalMeasurements = {};
        try {
            this.wizard.message = {
                text: loc.generatingScriptMessage,
                level: azdata.window.MessageLevel.Information,
                description: ''
            };
            service = await this.getService(msSqlProvider);
            ownerUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
            result = await service.generateDeployScript(this.model.filePath, this.model.database, ownerUri, azdata.TaskExecutionMode.script);
        }
        catch (e) {
            additionalProps.exceptionOccurred = 'true';
        }
        if (!result || !result.success) {
            vscode.window.showErrorMessage(loc.generateDeployErrorMessage(result === null || result === void 0 ? void 0 : result.errorMessage));
        }
        // If result is null which means exception occured, will be adding additional props to the Telemetry
        if (!result) {
            additionalProps = { ...additionalProps, ...this.getDacServiceArgsAsProps(service, this.model.database, this.model.filePath, ownerUri) };
        }
        additionalProps.isScriptGenerated = result === null || result === void 0 ? void 0 : result.success.toString();
        additionalProps.potentialDataLoss = this.model.potentialDataLoss.toString();
        additionalMeasurements.deployDacpacFileSizeBytes = await utils.tryGetFileSize(this.model.filePath);
        additionalMeasurements.totalDurationMs = (new Date().getTime() - genScriptStartTime);
        // Deploy Dacpac 'generate script' button clicked in DeployPlanPage, Reporting the event selection to the telemetry with fail/sucess status
        this.sendDacServiceTelemetryEvent(telemetry_1.TelemetryViews.DeployDacpac, 'GenerateDeployScriptOperation', additionalProps, additionalMeasurements);
        return result;
    }
    getPage(idx) {
        let page;
        if (idx === 1) {
            switch (this.selectedOperation) {
                case Operation.deploy: {
                    page = this.pages.get(PageName.deployConfig);
                    break;
                }
                case Operation.extract: {
                    page = this.pages.get(PageName.extractConfig);
                    break;
                }
                case Operation.import: {
                    page = this.pages.get(PageName.importConfig);
                    break;
                }
                case Operation.export: {
                    page = this.pages.get(PageName.exportConfig);
                    break;
                }
            }
        }
        else if (this.isSummaryPage(idx)) {
            page = this.pages.get(PageName.summary);
        }
        else if ((this.selectedOperation === Operation.deploy) && idx === DeployOperationPath.deployPlan) {
            page = this.pages.get(PageName.deployPlan);
        }
        return page;
    }
    isSummaryPage(idx) {
        return this.selectedOperation === Operation.import && idx === ImportOperationPath.summary
            || this.selectedOperation === Operation.export && idx === ExportOperationPath.summary
            || this.selectedOperation === Operation.extract && idx === ExtractOperationPath.summary
            || this.selectedOperation === Operation.deploy && !this.model.upgradeExisting && idx === DeployNewOperationPath.summary
            || (this.selectedOperation === Operation.deploy) && idx === DeployOperationPath.summary;
    }
    async generateDeployPlan() {
        const deployPlanStartTime = new Date().getTime();
        let service;
        let ownerUri;
        let result;
        let additionalProps = {};
        let additionalMeasurements = {};
        try {
            service = await this.getService(msSqlProvider);
            ownerUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
            result = await service.generateDeployPlan(this.model.filePath, this.model.database, ownerUri, azdata.TaskExecutionMode.execute);
        }
        catch (e) {
            additionalProps.exceptionOccurred = 'true';
        }
        if (!result || !result.success) {
            vscode.window.showErrorMessage(loc.deployPlanErrorMessage(result === null || result === void 0 ? void 0 : result.errorMessage));
        }
        // If result is null which means exception occured, will be adding additional props to the Telemetry
        if (!result) {
            additionalProps = { ...additionalProps, ...this.getDacServiceArgsAsProps(service, this.model.database, this.model.filePath, ownerUri) };
        }
        additionalProps.isPlanGenerated = result === null || result === void 0 ? void 0 : result.success.toString();
        additionalMeasurements.totalDurationMs = (new Date().getTime() - deployPlanStartTime);
        // send Generate deploy plan error/succes telemetry event
        this.sendDacServiceTelemetryEvent(telemetry_1.TelemetryViews.DeployPlanPage, 'GenerateDeployPlanOperation', additionalProps, additionalMeasurements);
        return result.report;
    }
    async getService(providerName) {
        if (!this.dacfxService) {
            this.dacfxService = vscode.extensions.getExtension("Microsoft.mssql" /* name */).exports.dacFx;
        }
        return this.dacfxService;
    }
    getDacServiceArgsAsProps(service, database, filePath, ownerUri) {
        return {
            isServiceExist: (!!service).toString(),
            isDatabaseExists: (!!database).toString(),
            isFilePathExist: (!!filePath).toString(),
            isOwnerUriExist: (!!ownerUri).toString()
        };
    }
    sendDacServiceTelemetryEvent(telemetryView, telemetryAction, additionalProps, additionalMeasurements) {
        telemetry_1.TelemetryReporter.createActionEvent(telemetryView, telemetryAction)
            .withAdditionalProperties(additionalProps)
            .withAdditionalMeasurements(additionalMeasurements)
            .send();
    }
}
exports.DataTierApplicationWizard = DataTierApplicationWizard;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/dataTierApplicationWizard.js.map
