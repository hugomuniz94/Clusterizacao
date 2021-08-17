"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorDialog = void 0;
const azdata = require("azdata");
const operatorData_1 = require("../data/operatorData");
const nls = require("vscode-nls");
const agentDialog_1 = require("./agentDialog");
const localize = nls.loadMessageBundle();
class OperatorDialog extends agentDialog_1.AgentDialog {
    constructor(ownerUri, operatorInfo = undefined) {
        super(ownerUri, new operatorData_1.OperatorData(ownerUri, operatorInfo), operatorInfo ? OperatorDialog.EditDialogTitle : OperatorDialog.CreateDialogTitle);
        // Event strings
        this.NewOperatorDialog = 'NewOperatorDialogOpened';
        this.EditOperatorDialog = 'EditOperatorDialogOpened';
        this.isEdit = false;
        this.isEdit = operatorInfo ? true : false;
        this.dialogName = this.isEdit ? this.EditOperatorDialog : this.NewOperatorDialog;
    }
    async initializeDialog(dialog) {
        this.generalTab = azdata.window.createTab(OperatorDialog.GeneralTabText);
        this.notificationsTab = azdata.window.createTab(OperatorDialog.NotificationsTabText);
        this.initializeGeneralTab();
        this.initializeNotificationTab();
        this.dialog.content = [this.generalTab, this.notificationsTab];
    }
    initializeGeneralTab() {
        this.generalTab.registerContent(async (view) => {
            this.nameTextBox = view.modelBuilder.inputBox().withProperties({
                ariaLabel: OperatorDialog.NameLabel,
                placeHolder: OperatorDialog.NameLabel
            }).component();
            this.nameTextBox.value = this.model.name;
            this.emailNameTextBox = view.modelBuilder.inputBox().withProperties({
                ariaLabel: OperatorDialog.EmailNameTextLabel,
                placeHolder: OperatorDialog.EmailNameTextLabel
            }).component();
            this.emailNameTextBox.value = this.model.emailAddress;
            this.pagerEmailNameTextBox = view.modelBuilder.inputBox().withProperties({
                ariaLabel: OperatorDialog.PagerEmailNameTextLabel,
                placeHolder: OperatorDialog.PagerEmailNameTextLabel
            }).component();
            this.pagerEmailNameTextBox.value = this.model.pagerAddress;
            this.enabledCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.EnabledCheckboxLabel
            }).component();
            this.enabledCheckBox.checked = this.model.enabled;
            this.pagerMondayCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.PagerMondayCheckBoxLabel
            }).component();
            this.pagerMondayCheckBox.onChanged(() => {
                if (this.pagerMondayCheckBox.checked) {
                    this.weekdayPagerStartTimeInput.enabled = true;
                    this.weekdayPagerEndTimeInput.enabled = true;
                }
                else {
                    if (!this.pagerTuesdayCheckBox.checked && !this.pagerWednesdayCheckBox.checked &&
                        !this.pagerThursdayCheckBox.checked && !this.pagerFridayCheckBox.checked) {
                        this.weekdayPagerStartTimeInput.enabled = false;
                        this.weekdayPagerEndTimeInput.enabled = false;
                    }
                }
            });
            this.pagerTuesdayCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.PagerTuesdayCheckBoxLabel
            }).component();
            this.pagerTuesdayCheckBox.onChanged(() => {
                if (this.pagerTuesdayCheckBox.checked) {
                    this.weekdayPagerStartTimeInput.enabled = true;
                    this.weekdayPagerEndTimeInput.enabled = true;
                }
                else {
                    if (!this.pagerMondayCheckBox.checked && !this.pagerWednesdayCheckBox.checked &&
                        !this.pagerThursdayCheckBox.checked && !this.pagerFridayCheckBox.checked) {
                        this.weekdayPagerStartTimeInput.enabled = false;
                        this.weekdayPagerEndTimeInput.enabled = false;
                    }
                }
            });
            this.pagerWednesdayCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.PagerWednesdayCheckBoxLabel
            }).component();
            this.pagerWednesdayCheckBox.onChanged(() => {
                if (this.pagerWednesdayCheckBox.checked) {
                    this.weekdayPagerStartTimeInput.enabled = true;
                    this.weekdayPagerEndTimeInput.enabled = true;
                }
                else {
                    if (!this.pagerMondayCheckBox.checked && !this.pagerTuesdayCheckBox.checked &&
                        !this.pagerThursdayCheckBox.checked && !this.pagerFridayCheckBox.checked) {
                        this.weekdayPagerStartTimeInput.enabled = false;
                        this.weekdayPagerEndTimeInput.enabled = false;
                    }
                }
            });
            this.pagerThursdayCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.PagerThursdayCheckBoxLabel
            }).component();
            this.pagerThursdayCheckBox.onChanged(() => {
                if (this.pagerThursdayCheckBox.checked) {
                    this.weekdayPagerStartTimeInput.enabled = true;
                    this.weekdayPagerEndTimeInput.enabled = true;
                }
                else {
                    if (!this.pagerMondayCheckBox.checked && !this.pagerWednesdayCheckBox.checked &&
                        !this.pagerTuesdayCheckBox.checked && !this.pagerFridayCheckBox.checked) {
                        this.weekdayPagerStartTimeInput.enabled = false;
                        this.weekdayPagerEndTimeInput.enabled = false;
                    }
                }
            });
            this.weekdayPagerStartTimeInput = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'time',
                placeHolder: '08:00:00',
            }).component();
            this.weekdayPagerStartTimeInput.enabled = false;
            let weekdayStartInputContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.weekdayPagerStartTimeInput,
                    title: OperatorDialog.WorkdayBeginLabel
                }]).component();
            this.weekdayPagerEndTimeInput = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'time',
                placeHolder: '06:00:00'
            }).component();
            this.weekdayPagerEndTimeInput.enabled = false;
            let weekdayEndInputContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.weekdayPagerEndTimeInput,
                    title: OperatorDialog.WorkdayEndLabel
                }]).component();
            this.pagerFridayCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.PagerFridayCheckBoxLabel
            }).component();
            this.pagerFridayCheckBox.onChanged(() => {
                if (this.pagerFridayCheckBox.checked) {
                    this.weekdayPagerStartTimeInput.enabled = true;
                    this.weekdayPagerEndTimeInput.enabled = true;
                }
                else {
                    if (!this.pagerMondayCheckBox.checked && !this.pagerWednesdayCheckBox.checked &&
                        !this.pagerThursdayCheckBox.checked && !this.pagerTuesdayCheckBox.checked) {
                        this.weekdayPagerStartTimeInput.enabled = false;
                        this.weekdayPagerEndTimeInput.enabled = false;
                    }
                }
            });
            let pagerFridayCheckboxContainer = view.modelBuilder.flexContainer()
                .withLayout({
                flexFlow: 'row',
                alignItems: 'baseline',
                width: '100%'
            }).withItems([this.pagerFridayCheckBox, weekdayStartInputContainer, weekdayEndInputContainer])
                .component();
            this.pagerSaturdayCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.PagerSaturdayCheckBoxLabel
            }).component();
            this.pagerSaturdayCheckBox.onChanged(() => {
                if (this.pagerSaturdayCheckBox.checked) {
                    this.saturdayPagerStartTimeInput.enabled = true;
                    this.saturdayPagerEndTimeInput.enabled = true;
                }
                else {
                    this.saturdayPagerStartTimeInput.enabled = false;
                    this.saturdayPagerEndTimeInput.enabled = false;
                }
            });
            this.saturdayPagerStartTimeInput = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'time',
                placeHolder: '08:00:00'
            }).component();
            this.saturdayPagerStartTimeInput.enabled = false;
            let saturdayStartInputContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.saturdayPagerStartTimeInput,
                    title: OperatorDialog.WorkdayBeginLabel
                }]).component();
            this.saturdayPagerEndTimeInput = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'time',
                placeHolder: '06:00:00'
            }).component();
            this.saturdayPagerEndTimeInput.enabled = false;
            let saturdayEndInputContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.saturdayPagerEndTimeInput,
                    title: OperatorDialog.WorkdayEndLabel
                }]).component();
            let pagerSaturdayCheckboxContainer = view.modelBuilder.flexContainer()
                .withLayout({
                flexFlow: 'row',
                alignItems: 'baseline'
            }).withItems([this.pagerSaturdayCheckBox, saturdayStartInputContainer, saturdayEndInputContainer])
                .component();
            this.pagerSundayCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: OperatorDialog.PagerSundayCheckBoxLabel
            }).component();
            this.pagerSundayCheckBox.onChanged(() => {
                if (this.pagerSundayCheckBox.checked) {
                    this.sundayPagerStartTimeInput.enabled = true;
                    this.sundayPagerEndTimeInput.enabled = true;
                }
                else {
                    this.sundayPagerStartTimeInput.enabled = false;
                    this.sundayPagerEndTimeInput.enabled = false;
                }
            });
            this.sundayPagerStartTimeInput = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'time',
                placeHolder: '08:00:00'
            }).component();
            this.sundayPagerStartTimeInput.enabled = false;
            let sundayStartInputContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.sundayPagerStartTimeInput,
                    title: OperatorDialog.WorkdayBeginLabel
                }]).component();
            this.sundayPagerEndTimeInput = view.modelBuilder.inputBox()
                .withProperties({
                inputType: 'time',
                placeHolder: '06:00:00'
            }).component();
            this.sundayPagerEndTimeInput.enabled = false;
            let sundayEndInputContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.sundayPagerEndTimeInput,
                    title: OperatorDialog.WorkdayEndLabel
                }]).component();
            let pagerSundayCheckboxContainer = view.modelBuilder.flexContainer()
                .withLayout({
                flexFlow: 'row',
                alignItems: 'baseline'
            }).withItems([this.pagerSundayCheckBox, sundayStartInputContainer, sundayEndInputContainer])
                .component();
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.nameTextBox,
                    title: OperatorDialog.NameLabel
                }, {
                    component: this.enabledCheckBox,
                    title: ''
                }, {
                    component: this.emailNameTextBox,
                    title: OperatorDialog.EmailNameTextLabel
                }, {
                    component: this.pagerEmailNameTextBox,
                    title: OperatorDialog.PagerEmailNameTextLabel
                }, {
                    components: [{
                            component: this.pagerMondayCheckBox,
                            title: ''
                        }, {
                            component: this.pagerTuesdayCheckBox,
                            title: ''
                        }, {
                            component: this.pagerWednesdayCheckBox,
                            title: ''
                        }, {
                            component: this.pagerThursdayCheckBox,
                            title: ''
                        }],
                    title: OperatorDialog.PagerDutyScheduleLabel
                }, {
                    component: pagerFridayCheckboxContainer,
                    title: ''
                }, {
                    component: view.modelBuilder.separator().component(),
                    title: ''
                }, {
                    component: pagerSaturdayCheckboxContainer,
                    title: ''
                }, {
                    component: view.modelBuilder.separator().component(),
                    title: ''
                }, {
                    component: pagerSundayCheckboxContainer,
                    title: ''
                }
            ]).withLayout({ width: '100%' }).component();
            await view.initializeModel(formModel);
        });
    }
    initializeNotificationTab() {
        this.notificationsTab.registerContent(async (view) => {
            let previewTag = view.modelBuilder.text()
                .withProperties({
                value: 'Feature Preview'
            }).component();
            this.alertsTable = view.modelBuilder.table()
                .withProperties({
                columns: [
                    OperatorDialog.AlertNameColumnLabel,
                    OperatorDialog.AlertEmailColumnLabel,
                    OperatorDialog.AlertPagerColumnLabel
                ],
                data: [],
                height: 500
            }).component();
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: previewTag,
                    title: ''
                }, {
                    component: this.alertsTable,
                    title: OperatorDialog.AlertsTableLabel
                }]).withLayout({ width: '100%' }).component();
            await view.initializeModel(formModel);
        });
    }
    async updateModel() {
        this.model.name = this.nameTextBox.value;
        this.model.enabled = this.enabledCheckBox.checked;
        this.model.emailAddress = this.emailNameTextBox.value;
        this.model.pagerAddress = this.pagerEmailNameTextBox.value;
        this.model.weekdayPagerStartTime = this.weekdayPagerStartTimeInput.value;
        this.model.weekdayPagerEndTime = this.weekdayPagerEndTimeInput.value;
        this.model.saturdayPagerStartTime = this.saturdayPagerStartTimeInput.value;
        this.model.saturdayPagerEndTime = this.saturdayPagerEndTimeInput.value;
        this.model.sundayPagerStartTime = this.sundayPagerStartTimeInput.value;
        this.model.sundayPagerEndTime = this.sundayPagerEndTimeInput.value;
    }
}
exports.OperatorDialog = OperatorDialog;
// Top level
OperatorDialog.CreateDialogTitle = localize('createOperator.createOperator', "Create Operator");
OperatorDialog.EditDialogTitle = localize('createOperator.editOperator', "Edit Operator");
OperatorDialog.GeneralTabText = localize('createOperator.General', "General");
OperatorDialog.NotificationsTabText = localize('createOperator.Notifications', "Notifications");
// General tab strings
OperatorDialog.NameLabel = localize('createOperator.Name', "Name");
OperatorDialog.EnabledCheckboxLabel = localize('createOperator.Enabled', "Enabled");
OperatorDialog.EmailNameTextLabel = localize('createOperator.EmailName', "E-mail Name");
OperatorDialog.PagerEmailNameTextLabel = localize('createOperator.PagerEmailName', "Pager E-mail Name");
OperatorDialog.PagerMondayCheckBoxLabel = localize('createOperator.PagerMondayCheckBox', "Monday");
OperatorDialog.PagerTuesdayCheckBoxLabel = localize('createOperator.PagerTuesdayCheckBox', "Tuesday");
OperatorDialog.PagerWednesdayCheckBoxLabel = localize('createOperator.PagerWednesdayCheckBox', "Wednesday");
OperatorDialog.PagerThursdayCheckBoxLabel = localize('createOperator.PagerThursdayCheckBox', "Thursday");
OperatorDialog.PagerFridayCheckBoxLabel = localize('createOperator.PagerFridayCheckBox', "Friday  ");
OperatorDialog.PagerSaturdayCheckBoxLabel = localize('createOperator.PagerSaturdayCheckBox', "Saturday");
OperatorDialog.PagerSundayCheckBoxLabel = localize('createOperator.PagerSundayCheckBox', "Sunday");
OperatorDialog.WorkdayBeginLabel = localize('createOperator.workdayBegin', "Workday begin");
OperatorDialog.WorkdayEndLabel = localize('createOperator.workdayEnd', "Workday end");
OperatorDialog.PagerDutyScheduleLabel = localize('createOperator.PagerDutySchedule', "Pager on duty schedule");
// Notifications tab strings
OperatorDialog.AlertsTableLabel = localize('createOperator.AlertListHeading', "Alert list");
OperatorDialog.AlertNameColumnLabel = localize('createOperator.AlertNameColumnLabel', "Alert name");
OperatorDialog.AlertEmailColumnLabel = localize('createOperator.AlertEmailColumnLabel', "E-mail");
OperatorDialog.AlertPagerColumnLabel = localize('createOperator.AlertPagerColumnLabel', "Pager");
//# sourceMappingURL=operatorDialog.js.map