"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStepData = void 0;
const azdata = require("azdata");
const nls = require("vscode-nls");
const vscode = require("vscode");
const agentUtils_1 = require("../agentUtils");
const interfaces_1 = require("../interfaces");
const jobStepDialog_1 = require("../dialogs/jobStepDialog");
const localize = nls.loadMessageBundle();
class JobStepData {
    constructor(ownerUri, jobModel, viaJobDialog = false) {
        this.ownerUri = ownerUri;
        this.jobName = jobModel.name;
        this.jobModel = jobModel;
        this.viaJobDialog = viaJobDialog;
    }
    async initialize() {
    }
    async save() {
        let agentService = await agentUtils_1.AgentUtils.getAgentService();
        let result;
        // if it's called via the job dialog, add it to the
        // job model
        if (this.viaJobDialog) {
            if (this.jobModel) {
                Promise.resolve(this);
                return;
            }
        }
        else {
            // has to be a create step
            result = await agentService.createJobStep(this.ownerUri, JobStepData.convertToAgentJobStepInfo(this));
        }
        if (!result || !result.success) {
            vscode.window.showErrorMessage(localize('jobStepData.saveErrorMessage', "Step update failed '{0}'", result.errorMessage ? result.errorMessage : 'Unknown'));
        }
    }
    validate() {
        let validationErrors = [];
        if (!(this.stepName && this.stepName.trim())) {
            validationErrors.push(JobStepData.CreateStepErrorMessage_StepNameIsEmpty);
        }
        if (!(this.jobName && this.jobName.trim())) {
            validationErrors.push(JobStepData.CreateStepErrorMessage_JobNameIsEmpty);
        }
        return {
            valid: validationErrors.length === 0,
            errorMessages: validationErrors
        };
    }
    static convertToJobStepData(jobStepInfo, jobData) {
        let stepData = new JobStepData(jobData.ownerUri, jobData);
        stepData.ownerUri = jobData.ownerUri;
        stepData.jobId = jobStepInfo.jobId;
        stepData.jobName = jobStepInfo.jobName;
        stepData.script = jobStepInfo.script;
        stepData.scriptName = jobStepInfo.scriptName;
        stepData.stepName = jobStepInfo.stepName;
        stepData.subSystem = jobStepInfo.subSystem;
        stepData.id = jobStepInfo.id;
        stepData.failureAction = jobStepInfo.failureAction;
        stepData.successAction = jobStepInfo.successAction;
        stepData.failStepId = jobStepInfo.failStepId;
        stepData.successStepId = jobStepInfo.successStepId;
        stepData.command = jobStepInfo.command;
        stepData.commandExecutionSuccessCode = jobStepInfo.commandExecutionSuccessCode;
        stepData.databaseName = jobStepInfo.databaseName;
        stepData.databaseUserName = jobStepInfo.databaseUserName;
        stepData.server = jobStepInfo.server;
        stepData.outputFileName = jobStepInfo.outputFileName;
        stepData.appendToLogFile = jobStepInfo.appendToLogFile;
        stepData.appendToStepHist = jobStepInfo.appendToStepHist;
        stepData.writeLogToTable = jobStepInfo.writeLogToTable;
        stepData.appendLogToTable = jobStepInfo.appendLogToTable;
        stepData.retryAttempts = jobStepInfo.retryAttempts;
        stepData.retryInterval = jobStepInfo.retryInterval;
        stepData.proxyName = jobStepInfo.proxyName;
        stepData.dialogMode = interfaces_1.AgentDialogMode.EDIT;
        stepData.viaJobDialog = true;
        return stepData;
    }
    static convertToAgentJobStepInfo(jobStepData) {
        let result = {
            jobId: jobStepData.jobId,
            jobName: jobStepData.jobName,
            script: jobStepData.script,
            scriptName: jobStepData.scriptName,
            stepName: jobStepData.stepName,
            subSystem: jobStepData.subSystem,
            id: jobStepData.id,
            failureAction: jobStepData.failureAction,
            successAction: jobStepData.successAction,
            failStepId: jobStepData.failStepId,
            successStepId: jobStepData.successStepId,
            command: jobStepData.command,
            commandExecutionSuccessCode: jobStepData.commandExecutionSuccessCode,
            databaseName: jobStepData.databaseName,
            databaseUserName: jobStepData.databaseUserName,
            server: jobStepData.server,
            outputFileName: jobStepData.outputFileName,
            appendToLogFile: jobStepData.appendToLogFile,
            appendToStepHist: jobStepData.appendToStepHist,
            writeLogToTable: jobStepData.writeLogToTable,
            appendLogToTable: jobStepData.appendLogToTable,
            retryAttempts: jobStepData.retryAttempts,
            retryInterval: jobStepData.retryInterval,
            proxyName: jobStepData.proxyName
        };
        return result;
    }
    static convertToAgentSubSystem(subSystemDisplayName) {
        switch (subSystemDisplayName) {
            case (jobStepDialog_1.JobStepDialog.TSQLScript): {
                return azdata.AgentSubSystem.TransactSql;
            }
            case (jobStepDialog_1.JobStepDialog.Powershell): {
                return azdata.AgentSubSystem.PowerShell;
            }
            case (jobStepDialog_1.JobStepDialog.CmdExec): {
                return azdata.AgentSubSystem.CmdExec;
            }
            case (jobStepDialog_1.JobStepDialog.ReplicationDistributor): {
                return azdata.AgentSubSystem.Distribution;
            }
            case (jobStepDialog_1.JobStepDialog.ReplicationMerge): {
                return azdata.AgentSubSystem.Merge;
            }
            case (jobStepDialog_1.JobStepDialog.ReplicationQueueReader): {
                return azdata.AgentSubSystem.QueueReader;
            }
            case (jobStepDialog_1.JobStepDialog.ReplicationSnapshot): {
                return azdata.AgentSubSystem.Snapshot;
            }
            case (jobStepDialog_1.JobStepDialog.ReplicationTransactionLogReader): {
                return azdata.AgentSubSystem.LogReader;
            }
            case (jobStepDialog_1.JobStepDialog.AnalysisServicesCommand): {
                return azdata.AgentSubSystem.AnalysisCommands;
            }
            case (jobStepDialog_1.JobStepDialog.AnalysisServicesQuery): {
                return azdata.AgentSubSystem.AnalysisQuery;
            }
            case (jobStepDialog_1.JobStepDialog.ServicesPackage): {
                return azdata.AgentSubSystem.Ssis;
            }
            default:
                return azdata.AgentSubSystem.TransactSql;
        }
    }
    static convertToSubSystemDisplayName(subSystem) {
        switch (subSystem) {
            case (azdata.AgentSubSystem.TransactSql): {
                return jobStepDialog_1.JobStepDialog.TSQLScript;
            }
            case (azdata.AgentSubSystem.PowerShell): {
                return jobStepDialog_1.JobStepDialog.Powershell;
            }
            case (azdata.AgentSubSystem.CmdExec): {
                return jobStepDialog_1.JobStepDialog.CmdExec;
            }
            case (azdata.AgentSubSystem.Distribution): {
                return jobStepDialog_1.JobStepDialog.ReplicationDistributor;
            }
            case (azdata.AgentSubSystem.Merge): {
                return jobStepDialog_1.JobStepDialog.ReplicationMerge;
            }
            case (azdata.AgentSubSystem.QueueReader): {
                return jobStepDialog_1.JobStepDialog.ReplicationQueueReader;
            }
            case (azdata.AgentSubSystem.Snapshot): {
                return jobStepDialog_1.JobStepDialog.ReplicationSnapshot;
            }
            case (azdata.AgentSubSystem.LogReader): {
                return jobStepDialog_1.JobStepDialog.ReplicationTransactionLogReader;
            }
            case (azdata.AgentSubSystem.AnalysisCommands): {
                return jobStepDialog_1.JobStepDialog.AnalysisServicesCommand;
            }
            case (azdata.AgentSubSystem.AnalysisQuery): {
                return jobStepDialog_1.JobStepDialog.AnalysisServicesQuery;
            }
            case (azdata.AgentSubSystem.Ssis): {
                return jobStepDialog_1.JobStepDialog.ServicesPackage;
            }
            default:
                return jobStepDialog_1.JobStepDialog.TSQLScript;
        }
    }
    static convertToStepCompletionAction(actionDisplayName) {
        switch (actionDisplayName) {
            case (jobStepDialog_1.JobStepDialog.NextStep): {
                return azdata.StepCompletionAction.GoToNextStep;
            }
            case (jobStepDialog_1.JobStepDialog.QuitJobReportingSuccess): {
                return azdata.StepCompletionAction.QuitWithSuccess;
            }
            case (jobStepDialog_1.JobStepDialog.QuitJobReportingFailure): {
                return azdata.StepCompletionAction.QuitWithFailure;
            }
            default:
                return azdata.StepCompletionAction.GoToNextStep;
        }
    }
    static convertToCompletionActionDisplayName(stepCompletionAction) {
        switch (stepCompletionAction) {
            case (azdata.StepCompletionAction.GoToNextStep): {
                return jobStepDialog_1.JobStepDialog.NextStep;
            }
            case (azdata.StepCompletionAction.QuitWithFailure): {
                return jobStepDialog_1.JobStepDialog.QuitJobReportingFailure;
            }
            case (azdata.StepCompletionAction.QuitWithSuccess): {
                return jobStepDialog_1.JobStepDialog.QuitJobReportingSuccess;
            }
            default:
                return jobStepDialog_1.JobStepDialog.NextStep;
        }
    }
}
exports.JobStepData = JobStepData;
// Error Messages
JobStepData.CreateStepErrorMessage_JobNameIsEmpty = localize('stepData.jobNameRequired', "Job name must be provided");
JobStepData.CreateStepErrorMessage_StepNameIsEmpty = localize('stepData.stepNameRequired', "Step name must be provided");
//# sourceMappingURL=jobStepData.js.map