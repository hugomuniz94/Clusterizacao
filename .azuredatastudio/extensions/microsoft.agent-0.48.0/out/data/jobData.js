"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobData = void 0;
const nls = require("vscode-nls");
const azdata = require("azdata");
const vscode = require("vscode");
const agentUtils_1 = require("../agentUtils");
const interfaces_1 = require("../interfaces");
const localize = nls.loadMessageBundle();
class JobData {
    constructor(ownerUri, jobInfo = undefined, _agentService = undefined) {
        this._agentService = _agentService;
        this.JobCompletionActionCondition_Always = localize('jobData.whenJobCompletes', "When the job completes");
        this.JobCompletionActionCondition_OnFailure = localize('jobData.whenJobFails', "When the job fails");
        this.JobCompletionActionCondition_OnSuccess = localize('jobData.whenJobSucceeds', "When the job succeeds");
        // Error Messages
        this.CreateJobErrorMessage_NameIsEmpty = localize('jobData.jobNameRequired', "Job name must be provided");
        this.dialogMode = interfaces_1.AgentDialogMode.CREATE;
        this.enabled = true;
        this.emailLevel = azdata.JobCompletionActionCondition.OnFailure;
        this.pageLevel = azdata.JobCompletionActionCondition.OnFailure;
        this.eventLogLevel = azdata.JobCompletionActionCondition.OnFailure;
        this.deleteLevel = azdata.JobCompletionActionCondition.OnSuccess;
        this._ownerUri = ownerUri;
        if (jobInfo) {
            this.dialogMode = interfaces_1.AgentDialogMode.EDIT;
            this.name = jobInfo.name;
            this.originalName = jobInfo.name;
            this.owner = jobInfo.owner;
            this.category = jobInfo.category;
            this.description = jobInfo.description;
            this.enabled = jobInfo.enabled;
            this.jobSteps = jobInfo.jobSteps;
            this.jobSchedules = jobInfo.jobSchedules;
            this.alerts = jobInfo.alerts;
            this.jobId = jobInfo.jobId;
            this.startStepId = jobInfo.startStepId;
            this.categoryId = jobInfo.categoryId;
            this.categoryType = jobInfo.categoryType;
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
                displayName: this.JobCompletionActionCondition_OnSuccess,
                name: azdata.JobCompletionActionCondition.OnSuccess.toString()
            }, {
                displayName: this.JobCompletionActionCondition_OnFailure,
                name: azdata.JobCompletionActionCondition.OnFailure.toString()
            }, {
                displayName: this.JobCompletionActionCondition_Always,
                name: azdata.JobCompletionActionCondition.Always.toString()
            }];
    }
    async save() {
        let jobInfo = this.toAgentJobInfo();
        let result = this.dialogMode === interfaces_1.AgentDialogMode.CREATE
            ? await this._agentService.createJob(this.ownerUri, jobInfo)
            : await this._agentService.updateJob(this.ownerUri, this.originalName, jobInfo);
        if (!result || !result.success) {
            if (this.dialogMode === interfaces_1.AgentDialogMode.EDIT) {
                vscode.window.showErrorMessage(localize('jobData.saveErrorMessage', "Job update failed '{0}'", result.errorMessage ? result.errorMessage : 'Unknown'));
            }
            else {
                vscode.window.showErrorMessage(localize('jobData.newJobErrorMessage', "Job creation failed '{0}'", result.errorMessage ? result.errorMessage : 'Unknown'));
            }
        }
        else {
            if (this.dialogMode === interfaces_1.AgentDialogMode.EDIT) {
                vscode.window.showInformationMessage(localize('jobData.saveSucessMessage', "Job '{0}' updated successfully", jobInfo.name));
            }
            else {
                vscode.window.showInformationMessage(localize('jobData.newJobSuccessMessage', "Job '{0}' created successfully", jobInfo.name));
            }
        }
    }
    validate() {
        let validationErrors = [];
        if (!(this.name && this.name.trim())) {
            validationErrors.push(this.CreateJobErrorMessage_NameIsEmpty);
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
            // The properties below are not collected from UI
            // We could consider using a seperate class for create job request
            //
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
            startStepId: this.startStepId
        };
    }
}
exports.JobData = JobData;
//# sourceMappingURL=jobData.js.map