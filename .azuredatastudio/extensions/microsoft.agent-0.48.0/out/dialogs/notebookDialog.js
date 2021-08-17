"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotebookDialog = exports.NotebookDialogOptions = void 0;
const nls = require("vscode-nls");
const path = require("path");
const azdata = require("azdata");
const pickScheduleDialog_1 = require("./pickScheduleDialog");
const agentDialog_1 = require("./agentDialog");
const agentUtils_1 = require("../agentUtils");
const notebookData_1 = require("../data/notebookData");
const localize = nls.loadMessageBundle();
// TODO: localize
// Top level
const CreateDialogTitle = localize('notebookDialog.newJob', "New Notebook Job");
const EditDialogTitle = localize('notebookDialog.editJob', "Edit Notebook Job");
const GeneralTabText = localize('notebookDialog.general', "General");
// Notebook details strings
const NotebookDetailsSeparatorTitle = localize('notebookDialog.notebookSection', "Notebook Details");
const TemplateNotebookTextBoxLabel = localize('notebookDialog.templateNotebook', "Notebook Path");
const TargetDatabaseDropdownLabel = localize('notebookDialog.targetDatabase', "Storage Database");
const ExecuteDatabaseDropdownLabel = localize('notebookDialog.executeDatabase', "Execution Database");
const DefaultDropdownString = localize('notebookDialog.defaultDropdownString', "Select Database");
// Job details string
const JobDetailsSeparatorTitle = localize('notebookDialog.jobSection', "Job Details");
const NameTextBoxLabel = localize('notebookDialog.name', "Name");
const OwnerTextBoxLabel = localize('notebookDialog.owner', "Owner");
const SchedulesTopLabelString = localize('notebookDialog.schedulesaLabel', "Schedules list");
const PickScheduleButtonString = localize('notebookDialog.pickSchedule', "Pick Schedule");
const RemoveScheduleButtonString = localize('notebookDialog.removeSchedule', "Remove Schedule");
const DescriptionTextBoxLabel = localize('notebookDialog.description', "Description");
// Event Name strings
const NewJobDialogEvent = 'NewNotebookJobDialogOpened';
const EditJobDialogEvent = 'EditNotebookJobDialogOpened';
class NotebookDialogOptions {
}
exports.NotebookDialogOptions = NotebookDialogOptions;
class NotebookDialog extends agentDialog_1.AgentDialog {
    constructor(ownerUri, options = undefined) {
        super(ownerUri, new notebookData_1.NotebookData(ownerUri, options), options.notebookInfo ? EditDialogTitle : CreateDialogTitle);
        this.isEdit = false;
        this.schedules = this.model.jobSchedules ? this.model.jobSchedules : [];
        this.isEdit = options.notebookInfo ? true : false;
        this.dialogName = this.isEdit ? EditJobDialogEvent : NewJobDialogEvent;
    }
    async initializeDialog() {
        this.generalTab = azdata.window.createTab(GeneralTabText);
        this.initializeGeneralTab();
        this.dialog.content = [this.generalTab];
        this.dialog.registerCloseValidator(async () => {
            this.updateModel();
            let validationResult = await this.model.validate();
            if (!validationResult.valid) {
                // TODO: Show Error Messages
                this.dialog.message = { text: validationResult.errorMessages[0] };
                console.error(validationResult.errorMessages.join(','));
            }
            return validationResult.valid;
        });
    }
    initializeGeneralTab() {
        this.generalTab.registerContent(async (view) => {
            this.templateFilePathBox = view.modelBuilder.inputBox()
                .withProperties({
                width: 400,
                inputType: 'text'
            }).component();
            this.openTemplateFileButton = view.modelBuilder.button()
                .withProperties({
                label: '...',
                title: '...',
                width: '20px',
                isFile: true,
                fileType: '.ipynb'
            }).component();
            this.openTemplateFileButton.onDidClick(e => {
                if (e) {
                    this.templateFilePathBox.value = e.filePath;
                    if (!this.isEdit) {
                        let fileName = path.basename(e.filePath).split('.').slice(0, -1).join('.');
                        this.nameTextBox.value = fileName;
                    }
                }
            });
            let outputButtonContainer = view.modelBuilder.flexContainer()
                .withLayout({
                flexFlow: 'row',
                textAlign: 'right',
                width: 20
            }).withItems([this.openTemplateFileButton], { flex: '1 1 80%' }).component();
            let notebookPathFlexBox = view.modelBuilder.flexContainer()
                .withLayout({
                flexFlow: 'row',
                width: '100%',
            }).withItems([this.templateFilePathBox, outputButtonContainer], {
                flex: '1 1 50%'
            }).component();
            this.targetDatabaseDropDown = view.modelBuilder.dropDown().component();
            this.executeDatabaseDropDown = view.modelBuilder.dropDown().component();
            let databases = await agentUtils_1.AgentUtils.getDatabases(this.ownerUri);
            databases.unshift(DefaultDropdownString);
            this.targetDatabaseDropDown = view.modelBuilder.dropDown()
                .withProperties({
                value: databases[0],
                values: databases
            }).component();
            this.descriptionTextBox = view.modelBuilder.inputBox().withProperties({
                multiline: true,
                height: 50
            }).component();
            this.executeDatabaseDropDown = view.modelBuilder.dropDown()
                .withProperties({
                value: databases[0],
                values: databases
            }).component();
            this.targetDatabaseDropDown.required = true;
            this.executeDatabaseDropDown.required = true;
            this.descriptionTextBox = view.modelBuilder.inputBox().withProperties({
                multiline: true,
                height: 50
            }).component();
            this.nameTextBox = view.modelBuilder.inputBox().component();
            this.nameTextBox.required = true;
            this.nameTextBox.onTextChanged(() => {
                if (this.nameTextBox.value && this.nameTextBox.value.length > 0) {
                    this.dialog.message = null;
                    // Change the job name immediately since steps
                    // depends on the job name
                    this.model.name = this.nameTextBox.value;
                }
            });
            this.ownerTextBox = view.modelBuilder.inputBox().component();
            this.schedulesTable = view.modelBuilder.table()
                .withProperties({
                columns: [
                    pickScheduleDialog_1.PickScheduleDialog.SchedulesIDText,
                    pickScheduleDialog_1.PickScheduleDialog.ScheduleNameLabelText,
                    pickScheduleDialog_1.PickScheduleDialog.ScheduleDescription
                ],
                data: [],
                height: 50,
                width: 420
            }).component();
            this.pickScheduleButton = view.modelBuilder.button().withProperties({
                label: PickScheduleButtonString,
                width: 110
            }).component();
            this.removeScheduleButton = view.modelBuilder.button().withProperties({
                label: RemoveScheduleButtonString,
                width: 110
            }).component();
            this.pickScheduleButton.onDidClick(() => {
                let pickScheduleDialog = new pickScheduleDialog_1.PickScheduleDialog(this.model.ownerUri, this.model.name);
                pickScheduleDialog.onSuccess((dialogModel) => {
                    let selectedSchedule = dialogModel.selectedSchedule;
                    if (selectedSchedule) {
                        let existingSchedule = this.schedules.find(item => item.name === selectedSchedule.name);
                        if (!existingSchedule) {
                            selectedSchedule.jobName = this.model.name ? this.model.name : this.nameTextBox.value;
                            this.schedules.push(selectedSchedule);
                        }
                        this.populateScheduleTable();
                    }
                });
                pickScheduleDialog.showDialog();
            });
            this.removeScheduleButton.onDidClick(() => {
                if (this.schedulesTable.selectedRows.length === 1) {
                    let selectedRow = this.schedulesTable.selectedRows[0];
                    let selectedScheduleName = this.schedulesTable.data[selectedRow][1];
                    for (let i = 0; i < this.schedules.length; i++) {
                        if (this.schedules[i].name === selectedScheduleName) {
                            this.schedules.splice(i, 1);
                        }
                    }
                    this.populateScheduleTable();
                }
            });
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([
                {
                    components: [{
                            component: notebookPathFlexBox,
                            title: TemplateNotebookTextBoxLabel,
                            layout: {
                                info: localize('notebookDialog.templatePath', "Select a notebook to schedule from PC")
                            }
                        },
                        {
                            component: this.targetDatabaseDropDown,
                            title: TargetDatabaseDropdownLabel,
                            layout: {
                                info: localize('notebookDialog.targetDatabaseInfo', "Select a database to store all notebook job metadata and results")
                            }
                        }, {
                            component: this.executeDatabaseDropDown,
                            title: ExecuteDatabaseDropdownLabel,
                            layout: {
                                info: localize('notebookDialog.executionDatabaseInfo', "Select a database against which notebook queries will run")
                            }
                        }],
                    title: NotebookDetailsSeparatorTitle
                }, {
                    components: [{
                            component: this.nameTextBox,
                            title: NameTextBoxLabel
                        }, {
                            component: this.ownerTextBox,
                            title: OwnerTextBoxLabel
                        }, {
                            component: this.schedulesTable,
                            title: SchedulesTopLabelString,
                            actions: [this.pickScheduleButton, this.removeScheduleButton]
                        }, {
                            component: this.descriptionTextBox,
                            title: DescriptionTextBoxLabel
                        }],
                    title: JobDetailsSeparatorTitle
                }
            ]).withLayout({ width: '100%' }).component();
            await view.initializeModel(formModel);
            this.nameTextBox.value = this.model.name;
            this.ownerTextBox.value = this.model.owner;
            this.templateFilePathBox.value = this.model.templatePath;
            if (this.isEdit) {
                this.templateFilePathBox.placeHolder = this.model.targetDatabase + '\\' + this.model.name;
                this.targetDatabaseDropDown.value = this.model.targetDatabase;
                this.executeDatabaseDropDown.value = this.model.executeDatabase;
                this.targetDatabaseDropDown.enabled = false;
                this.schedules = this.model.jobSchedules;
            }
            else {
                this.templateFilePathBox.required = true;
            }
            this.descriptionTextBox.value = this.model.description;
            this.openTemplateFileButton.onDidClick(e => {
            });
            this.populateScheduleTable();
        });
    }
    populateScheduleTable() {
        let data = this.convertSchedulesToData(this.schedules);
        this.schedulesTable.data = data;
        this.schedulesTable.height = 100;
    }
    convertSchedulesToData(jobSchedules) {
        let result = [];
        jobSchedules.forEach(schedule => {
            let cols = [];
            cols.push(schedule.id);
            cols.push(schedule.name);
            cols.push(schedule.description);
            result.push(cols);
        });
        return result;
    }
    async updateModel() {
        this.model.name = this.nameTextBox.value;
        this.model.owner = this.ownerTextBox.value;
        this.model.description = this.descriptionTextBox.value;
        this.model.templatePath = this.templateFilePathBox.value;
        this.model.targetDatabase = this.targetDatabaseDropDown.value;
        this.model.executeDatabase = this.executeDatabaseDropDown.value;
        if (!this.model.jobSchedules) {
            this.model.jobSchedules = [];
        }
        this.model.alerts = [];
        this.model.jobSteps = [];
        this.model.jobSchedules = this.schedules;
        this.model.category = '[Uncategorized (Local)]';
        this.model.categoryId = 0;
        this.model.eventLogLevel = 0;
    }
}
exports.NotebookDialog = NotebookDialog;
//# sourceMappingURL=notebookDialog.js.map