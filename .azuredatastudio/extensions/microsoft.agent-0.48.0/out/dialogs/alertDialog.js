"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertDialog = void 0;
const nls = require("vscode-nls");
const azdata = require("azdata");
const agentDialog_1 = require("./agentDialog");
const agentUtils_1 = require("../agentUtils");
const alertData_1 = require("../data/alertData");
const operatorDialog_1 = require("./operatorDialog");
const jobDialog_1 = require("./jobDialog");
const localize = nls.loadMessageBundle();
class AlertDialog extends agentDialog_1.AgentDialog {
    constructor(ownerUri, jobModel, alertInfo = undefined, viaJobDialog = false) {
        super(ownerUri, new alertData_1.AlertData(ownerUri, alertInfo, jobModel, viaJobDialog), alertInfo ? AlertDialog.EditDialogTitle : AlertDialog.CreateDialogTitle);
        // Event Name strings
        this.NewAlertDialog = 'NewAlertDialogOpen';
        this.EditAlertDialog = 'EditAlertDialogOpened';
        this.isEdit = false;
        this.jobModel = jobModel;
        this.jobId = this.jobId ? this.jobId : this.jobModel.jobId;
        this.jobName = this.jobName ? this.jobName : this.jobModel.name;
        this.isEdit = alertInfo ? true : false;
        this.dialogName = this.isEdit ? this.EditAlertDialog : this.NewAlertDialog;
    }
    async initializeDialog(dialog) {
        this.databases = await agentUtils_1.AgentUtils.getDatabases(this.ownerUri);
        this.databases.unshift(AlertDialog.AllDatabases);
        this.generalTab = azdata.window.createTab(AlertDialog.GeneralTabText);
        this.responseTab = azdata.window.createTab(AlertDialog.ResponseTabText);
        this.optionsTab = azdata.window.createTab(AlertDialog.OptionsTabText);
        this.initializeGeneralTab(this.databases, dialog);
        this.initializeResponseTab();
        this.initializeOptionsTab();
        dialog.content = [this.generalTab, this.responseTab, this.optionsTab];
    }
    initializeGeneralTab(databases, dialog) {
        this.generalTab.registerContent(async (view) => {
            // create controls
            this.nameTextBox = view.modelBuilder.inputBox().component();
            this.nameTextBox.required = true;
            this.nameTextBox.onTextChanged(() => {
                if (this.nameTextBox.value.length > 0) {
                    dialog.okButton.enabled = true;
                }
                else {
                    dialog.okButton.enabled = false;
                }
            });
            this.enabledCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: AlertDialog.EnabledCheckboxLabel
            }).component();
            this.enabledCheckBox.checked = true;
            this.databaseDropDown = view.modelBuilder.dropDown()
                .withProperties({
                value: databases[0],
                values: databases,
                width: '100%'
            }).component();
            this.typeDropDown = view.modelBuilder.dropDown()
                .withProperties({
                value: '',
                values: AlertDialog.AlertTypes,
                width: '100%'
            }).component();
            this.severityRadioButton = view.modelBuilder.radioButton()
                .withProperties({
                value: 'serverity',
                name: 'alertTypeOptions',
                label: AlertDialog.SeverityLabel,
                checked: true
            }).component();
            this.severityRadioButton.checked = true;
            this.severityDropDown = view.modelBuilder.dropDown()
                .withProperties({
                value: AlertDialog.AlertSeverities[0],
                values: AlertDialog.AlertSeverities,
                width: '100%'
            }).component();
            this.errorNumberRadioButton = view.modelBuilder.radioButton()
                .withProperties({
                value: 'errorNumber',
                name: 'alertTypeOptions',
                label: AlertDialog.ErrorNumberLabel
            }).component();
            this.errorNumberTextBox = view.modelBuilder.inputBox()
                .withProperties({
                width: '100%'
            })
                .component();
            this.errorNumberTextBox.enabled = false;
            this.errorNumberRadioButton.onDidClick(() => {
                this.errorNumberTextBox.enabled = true;
                this.severityDropDown.enabled = false;
            });
            this.severityRadioButton.onDidClick(() => {
                this.errorNumberTextBox.enabled = false;
                this.severityDropDown.enabled = true;
            });
            this.raiseAlertMessageCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: AlertDialog.RaiseIfMessageContainsLabel
            }).component();
            this.raiseAlertMessageTextBox = view.modelBuilder.inputBox().component();
            this.raiseAlertMessageTextBox.enabled = false;
            this.raiseAlertMessageCheckBox.onChanged(() => {
                this.raiseAlertMessageTextBox.enabled = this.raiseAlertMessageCheckBox.checked;
            });
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.nameTextBox,
                    title: AlertDialog.NameLabel
                }, {
                    component: this.enabledCheckBox,
                    title: ''
                }, {
                    component: this.typeDropDown,
                    title: AlertDialog.TypeLabel
                }, {
                    components: [{
                            component: this.databaseDropDown,
                            title: AlertDialog.DatabaseLabel
                        },
                        {
                            component: this.severityRadioButton,
                            title: ''
                        },
                        {
                            component: this.severityDropDown,
                            title: ''
                        },
                        {
                            component: this.errorNumberRadioButton,
                            title: ''
                        },
                        {
                            component: this.errorNumberTextBox,
                            title: ''
                        },
                        {
                            component: this.raiseAlertMessageCheckBox,
                            title: ''
                        }, {
                            component: this.raiseAlertMessageTextBox,
                            title: AlertDialog.MessageTextLabel
                        }],
                    title: AlertDialog.EventAlertText
                }
            ]).withLayout({ width: '100%' }).component();
            await view.initializeModel(formModel);
            // initialize control values
            this.nameTextBox.value = this.model.name;
            this.raiseAlertMessageTextBox.value = this.model.eventDescriptionKeyword;
            this.typeDropDown.value = this.model.alertType;
            this.enabledCheckBox.checked = this.model.isEnabled;
            if (this.model.messageId > 0) {
                this.errorNumberRadioButton.checked = true;
                this.errorNumberTextBox.value = this.model.messageId.toString();
            }
            if (this.model.severity > 0) {
                this.severityRadioButton.checked = true;
                this.severityDropDown.value = this.severityDropDown.values[this.model.severity - 1];
            }
            if (this.model.databaseName) {
                let idx = this.databases.indexOf(this.model.databaseName);
                if (idx >= 0) {
                    this.databaseDropDown.value = this.databases[idx];
                }
            }
        });
    }
    initializeResponseTab() {
        this.responseTab.registerContent(async (view) => {
            this.executeJobCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: AlertDialog.ExecuteJobCheckBoxLabel
            }).component();
            this.executeJobTextBox = view.modelBuilder.inputBox()
                .withProperties({ width: 375 })
                .component();
            this.executeJobTextBox.enabled = false;
            this.newJobButton = view.modelBuilder.button().withProperties({
                label: AlertDialog.NewJobButtonLabel,
                width: 80
            }).component();
            this.newJobButton.enabled = false;
            this.newJobButton.onDidClick(() => {
                let jobDialog = new jobDialog_1.JobDialog(this.ownerUri);
                jobDialog.openDialog();
            });
            this.executeJobCheckBox.onChanged(() => {
                if (this.executeJobCheckBox.checked) {
                    this.executeJobTextBox.enabled = true;
                    this.newJobButton.enabled = true;
                }
                else {
                    this.executeJobTextBox.enabled = false;
                    this.newJobButton.enabled = false;
                }
            });
            let executeJobContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.executeJobTextBox,
                    title: AlertDialog.ExecuteJobTextBoxLabel
                }, {
                    component: this.newJobButton,
                    title: AlertDialog.NewJobButtonLabel
                }], { componentWidth: '100%' }).component();
            let previewTag = view.modelBuilder.text()
                .withProperties({
                value: 'Feature Preview'
            }).component();
            this.notifyOperatorsCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: AlertDialog.NotifyOperatorsTextBoxLabel
            }).component();
            this.notifyOperatorsCheckBox.enabled = false;
            this.operatorsTable = view.modelBuilder.table()
                .withProperties({
                columns: [
                    AlertDialog.OperatorNameColumnLabel,
                    AlertDialog.OperatorEmailColumnLabel,
                    AlertDialog.OperatorPagerColumnLabel
                ],
                data: [],
                height: 500,
                width: 375
            }).component();
            this.newOperatorButton = view.modelBuilder.button().withProperties({
                label: AlertDialog.NewOperatorButtonLabel,
                width: 80
            }).component();
            this.operatorsTable.enabled = false;
            this.newOperatorButton.enabled = false;
            this.newOperatorButton.onDidClick(() => {
                let operatorDialog = new operatorDialog_1.OperatorDialog(this.ownerUri);
                operatorDialog.openDialog();
            });
            this.notifyOperatorsCheckBox.onChanged(() => {
                if (this.notifyOperatorsCheckBox.checked) {
                    this.operatorsTable.enabled = true;
                    this.newOperatorButton.enabled = true;
                }
                else {
                    this.operatorsTable.enabled = false;
                    this.newOperatorButton.enabled = false;
                }
            });
            let notifyOperatorContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.operatorsTable,
                    title: AlertDialog.OperatorListLabel
                }, {
                    component: this.newOperatorButton,
                    title: ''
                }], { componentWidth: '100%' }).component();
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.executeJobCheckBox,
                    title: ''
                }, {
                    component: executeJobContainer,
                    title: ''
                }, {
                    component: previewTag,
                    title: ''
                }, {
                    component: this.notifyOperatorsCheckBox,
                    title: ''
                }, {
                    component: notifyOperatorContainer,
                    title: ''
                }])
                .withLayout({ width: '100%' }).component();
            await view.initializeModel(formModel);
        });
    }
    initializeOptionsTab() {
        this.optionsTab.registerContent(async (view) => {
            this.includeErrorInEmailTextBox = view.modelBuilder.checkBox()
                .withProperties({
                label: AlertDialog.IncludeErrorInEmailCheckBoxLabel
            }).component();
            this.includeErrorInPagerTextBox = view.modelBuilder.checkBox()
                .withProperties({
                label: AlertDialog.IncludeErrorInPagerCheckBoxLabel
            }).component();
            this.additionalMessageTextBox = view.modelBuilder.inputBox().component();
            this.delayMinutesTextBox = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'number',
                placeHolder: 0
            })
                .component();
            this.delaySecondsTextBox = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'number',
                placeHolder: 0
            })
                .component();
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.includeErrorInEmailTextBox,
                    title: ''
                }, {
                    component: this.includeErrorInPagerTextBox,
                    title: ''
                }, {
                    component: this.additionalMessageTextBox,
                    title: AlertDialog.AdditionalMessageTextBoxLabel
                }, {
                    component: this.delayMinutesTextBox,
                    title: AlertDialog.DelayMinutesTextBoxLabel
                }, {
                    component: this.delaySecondsTextBox,
                    title: AlertDialog.DelaySecondsTextBoxLabel
                }]).withLayout({ width: '100%' }).component();
            await view.initializeModel(formModel);
        });
    }
    getSeverityNumber() {
        let selected = this.getDropdownValue(this.severityDropDown);
        let severityNumber = 0;
        if (selected) {
            let index = AlertDialog.AlertSeverities.indexOf(selected);
            if (index >= 0) {
                severityNumber = index + 1;
            }
        }
        return severityNumber;
    }
    async updateModel() {
        this.model.name = this.nameTextBox.value;
        this.model.isEnabled = this.enabledCheckBox.checked;
        this.model.jobId = this.jobId;
        this.model.jobName = this.jobName;
        this.model.alertType = this.getDropdownValue(this.typeDropDown);
        let databaseName = this.getDropdownValue(this.databaseDropDown);
        this.model.databaseName = (databaseName !== AlertDialog.AllDatabases) ? databaseName : undefined;
        if (this.severityRadioButton.checked) {
            this.model.severity = this.getSeverityNumber();
            this.model.messageId = 0;
        }
        else {
            this.model.severity = 0;
            this.model.messageId = +this.errorNumberTextBox.value;
        }
        if (this.raiseAlertMessageCheckBox.checked) {
            this.model.eventDescriptionKeyword = this.raiseAlertMessageTextBox.value;
        }
        else {
            this.model.eventDescriptionKeyword = '';
        }
        let minutes = this.delayMinutesTextBox.value ? +this.delayMinutesTextBox.value : 0;
        let seconds = this.delaySecondsTextBox.value ? +this.delaySecondsTextBox : 0;
        this.model.delayBetweenResponses = minutes + seconds;
    }
}
exports.AlertDialog = AlertDialog;
// Top level
AlertDialog.CreateDialogTitle = localize('alertDialog.createAlert', "Create Alert");
AlertDialog.EditDialogTitle = localize('alertDialog.editAlert', "Edit Alert");
AlertDialog.GeneralTabText = localize('alertDialog.General', "General");
AlertDialog.ResponseTabText = localize('alertDialog.Response', "Response");
AlertDialog.OptionsTabText = localize('alertDialog.Options', "Options");
AlertDialog.EventAlertText = localize('alertDialog.eventAlert', "Event alert definition");
// General tab strings
AlertDialog.NameLabel = localize('alertDialog.Name', "Name");
AlertDialog.TypeLabel = localize('alertDialog.Type', "Type");
AlertDialog.EnabledCheckboxLabel = localize('alertDialog.Enabled', "Enabled");
AlertDialog.DatabaseLabel = localize('alertDialog.DatabaseName', "Database name");
AlertDialog.ErrorNumberLabel = localize('alertDialog.ErrorNumber', "Error number");
AlertDialog.SeverityLabel = localize('alertDialog.Severity', "Severity");
AlertDialog.RaiseIfMessageContainsLabel = localize('alertDialog.RaiseAlertContains', "Raise alert when message contains");
AlertDialog.MessageTextLabel = localize('alertDialog.MessageText', "Message text");
AlertDialog.AlertSeverity001Label = localize('alertDialog.Severity001', "001 - Miscellaneous System Information");
AlertDialog.AlertSeverity002Label = localize('alertDialog.Severity002', "002 - Reserved");
AlertDialog.AlertSeverity003Label = localize('alertDialog.Severity003', "003 - Reserved");
AlertDialog.AlertSeverity004Label = localize('alertDialog.Severity004', "004 - Reserved");
AlertDialog.AlertSeverity005Label = localize('alertDialog.Severity005', "005 - Reserved");
AlertDialog.AlertSeverity006Label = localize('alertDialog.Severity006', "006 - Reserved");
AlertDialog.AlertSeverity007Label = localize('alertDialog.Severity007', "007 - Notification: Status Information");
AlertDialog.AlertSeverity008Label = localize('alertDialog.Severity008', "008 - Notification: User Intervention Required");
AlertDialog.AlertSeverity009Label = localize('alertDialog.Severity009', "009 - User Defined");
AlertDialog.AlertSeverity010Label = localize('alertDialog.Severity010', "010 - Information");
AlertDialog.AlertSeverity011Label = localize('alertDialog.Severity011', "011 - Specified Database Object Not Found");
AlertDialog.AlertSeverity012Label = localize('alertDialog.Severity012', "012 - Unused");
AlertDialog.AlertSeverity013Label = localize('alertDialog.Severity013', "013 - User Transaction Syntax Error");
AlertDialog.AlertSeverity014Label = localize('alertDialog.Severity014', "014 - Insufficient Permission");
AlertDialog.AlertSeverity015Label = localize('alertDialog.Severity015', "015 - Syntax Error in SQL Statements");
AlertDialog.AlertSeverity016Label = localize('alertDialog.Severity016', "016 - Miscellaneous User Error");
AlertDialog.AlertSeverity017Label = localize('alertDialog.Severity017', "017 - Insufficient Resources");
AlertDialog.AlertSeverity018Label = localize('alertDialog.Severity018', "018 - Nonfatal Internal Error");
AlertDialog.AlertSeverity019Label = localize('alertDialog.Severity019', "019 - Fatal Error in Resource");
AlertDialog.AlertSeverity020Label = localize('alertDialog.Severity020', "020 - Fatal Error in Current Process");
AlertDialog.AlertSeverity021Label = localize('alertDialog.Severity021', "021 - Fatal Error in Database Processes");
AlertDialog.AlertSeverity022Label = localize('alertDialog.Severity022', "022 - Fatal Error: Table Integrity Suspect");
AlertDialog.AlertSeverity023Label = localize('alertDialog.Severity023', "023 - Fatal Error: Database Integrity Suspect");
AlertDialog.AlertSeverity024Label = localize('alertDialog.Severity024', "024 - Fatal Error: Hardware Error");
AlertDialog.AlertSeverity025Label = localize('alertDialog.Severity025', "025 - Fatal Error");
AlertDialog.AllDatabases = localize('alertDialog.AllDatabases', "<all databases>");
AlertDialog.AlertTypes = [
    alertData_1.AlertData.AlertTypeSqlServerEventString,
];
AlertDialog.AlertSeverities = [
    AlertDialog.AlertSeverity001Label,
    AlertDialog.AlertSeverity002Label,
    AlertDialog.AlertSeverity003Label,
    AlertDialog.AlertSeverity004Label,
    AlertDialog.AlertSeverity005Label,
    AlertDialog.AlertSeverity006Label,
    AlertDialog.AlertSeverity007Label,
    AlertDialog.AlertSeverity008Label,
    AlertDialog.AlertSeverity009Label,
    AlertDialog.AlertSeverity010Label,
    AlertDialog.AlertSeverity011Label,
    AlertDialog.AlertSeverity012Label,
    AlertDialog.AlertSeverity013Label,
    AlertDialog.AlertSeverity014Label,
    AlertDialog.AlertSeverity015Label,
    AlertDialog.AlertSeverity016Label,
    AlertDialog.AlertSeverity017Label,
    AlertDialog.AlertSeverity018Label,
    AlertDialog.AlertSeverity019Label,
    AlertDialog.AlertSeverity020Label,
    AlertDialog.AlertSeverity021Label,
    AlertDialog.AlertSeverity022Label,
    AlertDialog.AlertSeverity023Label,
    AlertDialog.AlertSeverity024Label,
    AlertDialog.AlertSeverity025Label
];
// Response tab strings
AlertDialog.ExecuteJobCheckBoxLabel = localize('alertDialog.ExecuteJob', "Execute Job");
AlertDialog.ExecuteJobTextBoxLabel = localize('alertDialog.ExecuteJobName', "Job Name");
AlertDialog.NotifyOperatorsTextBoxLabel = localize('alertDialog.NotifyOperators', "Notify Operators");
AlertDialog.NewJobButtonLabel = localize('alertDialog.NewJob', "New Job");
AlertDialog.OperatorListLabel = localize('alertDialog.OperatorList', "Operator List");
AlertDialog.OperatorNameColumnLabel = localize('alertDialog.OperatorName', "Operator");
AlertDialog.OperatorEmailColumnLabel = localize('alertDialog.OperatorEmail', "E-mail");
AlertDialog.OperatorPagerColumnLabel = localize('alertDialog.OperatorPager', "Pager");
AlertDialog.NewOperatorButtonLabel = localize('alertDialog.NewOperator', "New Operator");
// Options tab strings
AlertDialog.IncludeErrorInEmailCheckBoxLabel = localize('alertDialog.IncludeErrorInEmail', "Include alert error text in e-mail");
AlertDialog.IncludeErrorInPagerCheckBoxLabel = localize('alertDialog.IncludeErrorInPager', "Include alert error text in pager");
AlertDialog.AdditionalMessageTextBoxLabel = localize('alertDialog.AdditionalNotification', "Additional notification message to send");
AlertDialog.DelayMinutesTextBoxLabel = localize('alertDialog.DelayMinutes', "Delay Minutes");
AlertDialog.DelaySecondsTextBoxLabel = localize('alertDialog.DelaySeconds', "Delay Seconds");
//# sourceMappingURL=alertDialog.js.map