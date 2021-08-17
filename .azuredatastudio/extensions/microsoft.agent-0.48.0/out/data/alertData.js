"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertData = void 0;
const nls = require("vscode-nls");
const vscode = require("vscode");
const azdata = require("azdata");
const agentUtils_1 = require("../agentUtils");
const interfaces_1 = require("../interfaces");
const localize = nls.loadMessageBundle();
class AlertData {
    constructor(ownerUri, alertInfo, jobModel, viaJobDialog = false) {
        this.dialogMode = interfaces_1.AgentDialogMode.CREATE;
        this.isEnabled = true;
        this.alertType = AlertData.DefaultAlertTypeString;
        this.ownerUri = ownerUri;
        this.viaJobDialog = viaJobDialog;
        this.jobModel = jobModel;
        this.jobName = this.jobName ? this.jobName : this.jobModel.name;
        if (alertInfo) {
            this.dialogMode = interfaces_1.AgentDialogMode.EDIT;
            this.id = alertInfo.id;
            this.name = alertInfo.name;
            this.originalName = alertInfo.name;
            this.delayBetweenResponses = alertInfo.delayBetweenResponses;
            this.eventDescriptionKeyword = alertInfo.eventDescriptionKeyword;
            this.eventSource = alertInfo.eventSource;
            this.hasNotification = alertInfo.hasNotification;
            this.includeEventDescription = alertInfo.includeEventDescription ? alertInfo.includeEventDescription.toString() : null;
            this.isEnabled = alertInfo.isEnabled;
            this.jobId = alertInfo.jobId;
            this.lastOccurrenceDate = alertInfo.lastOccurrenceDate;
            this.lastResponseDate = alertInfo.lastResponseDate;
            this.messageId = alertInfo.messageId;
            this.notificationMessage = alertInfo.notificationMessage;
            this.occurrenceCount = alertInfo.occurrenceCount;
            this.performanceCondition = alertInfo.performanceCondition;
            this.severity = alertInfo.severity;
            this.databaseName = alertInfo.databaseName;
            this.countResetDate = alertInfo.countResetDate;
            this.categoryName = alertInfo.categoryName;
            this.alertType = alertInfo.alertType ? alertInfo.alertType.toString() : null;
            this.wmiEventNamespace = alertInfo.wmiEventNamespace;
            this.wmiEventQuery = alertInfo.wmiEventQuery;
        }
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
            // has to be a create alert
            result = await agentService.createAlert(this.ownerUri, this.toAgentAlertInfo());
        }
        if (!result || !result.success) {
            vscode.window.showErrorMessage(localize('alertData.saveErrorMessage', "Alert update failed '{0}'", result.errorMessage ? result.errorMessage : 'Unknown'));
        }
    }
    toAgentAlertInfo() {
        return {
            id: this.id,
            name: this.name,
            delayBetweenResponses: this.delayBetweenResponses,
            eventDescriptionKeyword: this.eventDescriptionKeyword,
            eventSource: this.eventSource,
            hasNotification: this.hasNotification,
            includeEventDescription: azdata.NotifyMethods.none,
            isEnabled: this.isEnabled,
            jobId: this.jobId,
            jobName: this.jobName,
            lastOccurrenceDate: this.lastOccurrenceDate,
            lastResponseDate: this.lastResponseDate,
            messageId: this.messageId,
            notificationMessage: this.notificationMessage,
            occurrenceCount: this.occurrenceCount,
            performanceCondition: this.performanceCondition,
            severity: this.severity,
            databaseName: this.databaseName,
            countResetDate: this.countResetDate,
            categoryName: this.categoryName,
            alertType: AlertData.getAlertTypeFromString(this.alertType),
            wmiEventNamespace: this.wmiEventNamespace,
            wmiEventQuery: this.wmiEventQuery
        };
    }
    static getAlertTypeFromString(alertTypeString) {
        if (alertTypeString === AlertData.AlertTypePerformanceConditionString) {
            return azdata.AlertType.sqlServerPerformanceCondition;
        }
        else if (alertTypeString === AlertData.AlertTypeWmiEventString) {
            return azdata.AlertType.wmiEvent;
        }
        else {
            return azdata.AlertType.sqlServerEvent;
        }
    }
}
exports.AlertData = AlertData;
AlertData.AlertTypeSqlServerEventString = localize('alertData.DefaultAlertTypString', "SQL Server event alert");
AlertData.AlertTypePerformanceConditionString = localize('alertDialog.PerformanceCondition', "SQL Server performance condition alert");
AlertData.AlertTypeWmiEventString = localize('alertDialog.WmiEvent', "WMI event alert");
AlertData.DefaultAlertTypeString = AlertData.AlertTypeSqlServerEventString;
//# sourceMappingURL=alertData.js.map