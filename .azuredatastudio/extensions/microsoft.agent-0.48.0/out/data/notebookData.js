"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotebookData = void 0;
const nls = require("vscode-nls");
const azdata = require("azdata");
const vscode = require("vscode");
const path = require("path");
const agentUtils_1 = require("../agentUtils");
const interfaces_1 = require("../interfaces");
const localize = nls.loadMessageBundle();
const NotebookCompletionActionCondition_Always = localize('notebookData.whenJobCompletes', "When the notebook completes");
const NotebookCompletionActionCondition_OnFailure = localize('notebookData.whenJobFails', "When the notebook fails");
const NotebookCompletionActionCondition_OnSuccess = localize('notebookData.whenJobSucceeds', "When the notebook succeeds");
// Error Messages
const CreateNotebookErrorMessage_NameIsEmpty = localize('notebookData.jobNameRequired', "Notebook name must be provided");
const TemplatePathEmptyErrorMessage = localize('notebookData.templatePathRequired', "Template path must be provided");
const InvalidNotebookPathErrorMessage = localize('notebookData.invalidNotebookPath', "Invalid notebook path");
const SelectStorageDatabaseErrorMessage = localize('notebookData.selectStorageDatabase', "Select storage database");
const SelectExecutionDatabaseErrorMessage = localize('notebookData.selectExecutionDatabase', "Select execution database");
const JobWithSameNameExistsErrorMessage = localize('notebookData.jobExists', "Job with similar name already exists");
class NotebookData {
    constructor(ownerUri, options = undefined, _agentService = undefined) {
        this._agentService = _agentService;
        this.dialogMode = interfaces_1.AgentDialogMode.CREATE;
        this.enabled = true;
        this.emailLevel = azdata.JobCompletionActionCondition.OnFailure;
        this.pageLevel = azdata.JobCompletionActionCondition.OnFailure;
        this.eventLogLevel = azdata.JobCompletionActionCondition.OnFailure;
        this.deleteLevel = azdata.JobCompletionActionCondition.OnSuccess;
        this._ownerUri = ownerUri;
        this.enabled = true;
        if (options.notebookInfo) {
            let notebookInfo = options.notebookInfo;
            this.dialogMode = interfaces_1.AgentDialogMode.EDIT;
            this.name = notebookInfo.name;
            this.originalName = notebookInfo.name;
            this.owner = notebookInfo.owner;
            this.category = notebookInfo.category;
            this.description = notebookInfo.description;
            this.enabled = notebookInfo.enabled;
            this.jobSteps = notebookInfo.jobSteps;
            this.jobSchedules = notebookInfo.jobSchedules;
            this.alerts = notebookInfo.alerts;
            this.jobId = notebookInfo.jobId;
            this.startStepId = notebookInfo.startStepId;
            this.categoryId = notebookInfo.categoryId;
            this.categoryType = notebookInfo.categoryType;
            this.targetDatabase = notebookInfo.targetDatabase;
            this.executeDatabase = notebookInfo.executeDatabase;
        }
        if (options.filePath) {
            this.name = path.basename(options.filePath).split('.').slice(0, -1).join('.');
            this.templatePath = options.filePath;
        }
        if (options.connection) {
            this.connection = options.connection;
        }
    }
    get jobCategories() {
        return this._jobCategories;
    }
    get jobCategoryIdsMap() {
        return this._jobCategoryIdsMap;
    }
    get operators() {
        return this._operators;
    }
    get ownerUri() {
        return this._ownerUri;
    }
    get defaultOwner() {
        return this._defaultOwner;
    }
    get JobCompletionActionConditions() {
        return this._jobCompletionActionConditions;
    }
    async initialize() {
        if (this.connection) {
            await agentUtils_1.AgentUtils.setupProvidersFromConnection(this.connection);
        }
        this._agentService = await agentUtils_1.AgentUtils.getAgentService();
        let jobDefaults = await this._agentService.getJobDefaults(this.ownerUri);
        if (jobDefaults && jobDefaults.success) {
            this._jobCategories = jobDefaults.categories.map((cat) => {
                return cat.name;
            });
            this._jobCategoryIdsMap = jobDefaults.categories;
            this._defaultOwner = jobDefaults.owner;
            this._operators = ['', this._defaultOwner];
            this.owner = this.owner ? this.owner : this._defaultOwner;
        }
        this._jobCompletionActionConditions = [{
                displayName: NotebookCompletionActionCondition_OnSuccess,
                name: azdata.JobCompletionActionCondition.OnSuccess.toString()
            }, {
                displayName: NotebookCompletionActionCondition_OnFailure,
                name: azdata.JobCompletionActionCondition.OnFailure.toString()
            }, {
                displayName: NotebookCompletionActionCondition_Always,
                name: azdata.JobCompletionActionCondition.Always.toString()
            }];
        this._agentService.getJobs(this.ownerUri).then((value) => {
            NotebookData.jobLists = value.jobs;
        });
    }
    async save() {
        let notebookInfo = this.toAgentJobInfo();
        let result = this.dialogMode === interfaces_1.AgentDialogMode.CREATE
            ? await this._agentService.createNotebook(this.ownerUri, notebookInfo, this.templatePath)
            : await this._agentService.updateNotebook(this.ownerUri, this.originalName, notebookInfo, this.templatePath);
        if (!result || !result.success) {
            if (this.dialogMode === interfaces_1.AgentDialogMode.EDIT) {
                vscode.window.showErrorMessage(localize('notebookData.saveErrorMessage', "Notebook update failed '{0}'", result.errorMessage ? result.errorMessage : 'Unknown'));
            }
            else {
                vscode.window.showErrorMessage(localize('notebookData.newJobErrorMessage', "Notebook creation failed '{0}'", result.errorMessage ? result.errorMessage : 'Unknown'));
            }
        }
        else {
            if (this.dialogMode === interfaces_1.AgentDialogMode.EDIT) {
                vscode.window.showInformationMessage(localize('notebookData.saveSucessMessage', "Notebook '{0}' updated successfully", notebookInfo.name));
            }
            else {
                vscode.window.showInformationMessage(localize('notebookData.newJobSuccessMessage', "Notebook '{0}' created successfully", notebookInfo.name));
            }
        }
    }
    async validate() {
        let validationErrors = [];
        if (this.dialogMode !== interfaces_1.AgentDialogMode.EDIT) {
            if (!(this.name && this.name.trim())) {
                validationErrors.push(CreateNotebookErrorMessage_NameIsEmpty);
            }
            if (!(this.templatePath && this.name.trim())) {
                validationErrors.push(TemplatePathEmptyErrorMessage);
            }
            if (!(await agentUtils_1.exists(this.templatePath))) {
                validationErrors.push(InvalidNotebookPathErrorMessage);
            }
            if (NotebookData.jobLists) {
                for (let i = 0; i < NotebookData.jobLists.length; i++) {
                    if (this.name === NotebookData.jobLists[i].name) {
                        validationErrors.push(JobWithSameNameExistsErrorMessage);
                        break;
                    }
                }
            }
        }
        else {
            if (this.templatePath && this.templatePath !== '' && !(await agentUtils_1.exists(this.templatePath))) {
                validationErrors.push(InvalidNotebookPathErrorMessage);
            }
        }
        if (this.targetDatabase === 'Select Database') {
            validationErrors.push(SelectStorageDatabaseErrorMessage);
        }
        if (this.executeDatabase === 'Select Database') {
            validationErrors.push(SelectExecutionDatabaseErrorMessage);
        }
        return {
            valid: validationErrors.length === 0,
            errorMessages: validationErrors
        };
    }
    toAgentJobInfo() {
        return {
            name: this.name,
            owner: this.owner ? this.owner : this.defaultOwner,
            description: this.description,
            emailLevel: this.emailLevel,
            pageLevel: this.pageLevel,
            eventLogLevel: this.eventLogLevel,
            deleteLevel: this.deleteLevel,
            operatorToEmail: this.operatorToEmail,
            operatorToPage: this.operatorToPage,
            enabled: this.enabled,
            category: this.category,
            alerts: this.alerts,
            jobSchedules: this.jobSchedules,
            jobSteps: this.jobSteps,
            targetDatabase: this.targetDatabase,
            executeDatabase: this.executeDatabase,
            // The properties below are not collected from UI
            // We could consider using a seperate class for create job request
            //
            templateId: this.templateId,
            currentExecutionStatus: 0,
            lastRunOutcome: 0,
            currentExecutionStep: '',
            hasTarget: true,
            hasSchedule: false,
            hasStep: false,
            runnable: true,
            categoryId: this.categoryId,
            categoryType: this.categoryType,
            lastRun: '',
            nextRun: '',
            jobId: this.jobId,
            startStepId: this.startStepId,
            lastRunNotebookError: '',
        };
    }
}
exports.NotebookData = NotebookData;
//# sourceMappingURL=notebookData.js.map