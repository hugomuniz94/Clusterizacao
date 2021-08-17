"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStepDialog = void 0;
const nls = require("vscode-nls");
const azdata = require("azdata");
const jobStepData_1 = require("../data/jobStepData");
const agentUtils_1 = require("../agentUtils");
const agentDialog_1 = require("./agentDialog");
const interfaces_1 = require("../interfaces");
const path = require("path");
const localize = nls.loadMessageBundle();
class JobStepDialog extends agentDialog_1.AgentDialog {
    constructor(ownerUri, server, jobModel, jobStepInfo, viaJobDialog = false) {
        super(ownerUri, jobStepInfo ? jobStepData_1.JobStepData.convertToJobStepData(jobStepInfo, jobModel) : new jobStepData_1.JobStepData(ownerUri, jobModel, viaJobDialog), jobStepInfo ? JobStepDialog.EditDialogTitle : JobStepDialog.NewDialogTitle);
        this.FileBrowserDialogTitle = localize('jobStepDialog.fileBrowserTitle', "Locate Database Files - ");
        this.OkButtonText = localize('jobStepDialog.ok', "OK");
        this.CancelButtonText = localize('jobStepDialog.cancel', "Cancel");
        this.GeneralTabText = localize('jobStepDialog.general', "General");
        this.AdvancedTabText = localize('jobStepDialog.advanced', "Advanced");
        this.OpenCommandText = localize('jobStepDialog.open', "Open...");
        this.ParseCommandText = localize('jobStepDialog.parse', "Parse");
        this.SuccessfulParseText = localize('jobStepDialog.successParse', "The command was successfully parsed.");
        this.FailureParseText = localize('jobStepDialog.failParse', "The command failed.");
        this.BlankStepNameErrorText = localize('jobStepDialog.blankStepName', "The step name cannot be left blank");
        this.ProcessExitCodeText = localize('jobStepDialog.processExitCode', "Process exit code of a successful command:");
        // General Control Titles
        this.StepNameLabelString = localize('jobStepDialog.stepNameLabel', "Step Name");
        this.TypeLabelString = localize('jobStepDialog.typeLabel', "Type");
        this.RunAsLabelString = localize('jobStepDialog.runAsLabel', "Run as");
        this.DatabaseLabelString = localize('jobStepDialog.databaseLabel', "Database");
        this.CommandLabelString = localize('jobStepDialog.commandLabel', "Command");
        // Advanced Control Titles
        this.SuccessActionLabel = localize('jobStepDialog.successAction', "On success action");
        this.FailureActionLabel = localize('jobStepDialog.failureAction', "On failure action");
        this.RunAsUserLabel = localize('jobStepDialog.runAsUser', "Run as user");
        this.RetryAttemptsLabel = localize('jobStepDialog.retryAttempts', "Retry Attempts");
        this.RetryIntervalLabel = localize('jobStepDialog.retryInterval', "Retry Interval (minutes)");
        this.LogToTableLabel = localize('jobStepDialog.logToTable', "Log to table");
        this.AppendExistingTableEntryLabel = localize('jobStepDialog.appendExistingTableEntry', "Append output to exisiting entry in table");
        this.IncludeStepOutputHistoryLabel = localize('jobStepDialog.includeStepOutputHistory', "Include step output in history");
        this.OutputFileNameLabel = localize('jobStepDialog.outputFile', "Output File");
        this.AppendOutputToFileLabel = localize('jobStepDialog.appendOutputToFile', "Append output to existing file");
        // File Browser Control Titles
        this.SelectedPathLabelString = localize('jobStepDialog.selectedPath', "Selected path");
        this.FilesOfTypeLabelString = localize('jobStepDialog.filesOfType', "Files of type");
        this.FileNameLabelString = localize('jobStepDialog.fileName', "File name");
        this.AllFilesLabelString = localize('jobStepDialog.allFiles', "All Files (*)");
        // Event Name strings
        this.NewStepDialog = 'NewStepDialogOpened';
        this.EditStepDialog = 'EditStepDialogOpened';
        this.stepId = jobStepInfo ?
            jobStepInfo.id : jobModel.jobSteps ?
            jobModel.jobSteps.length + 1 : 1;
        this.isEdit = jobStepInfo ? true : false;
        this.model.dialogMode = this.isEdit ? interfaces_1.AgentDialogMode.EDIT : interfaces_1.AgentDialogMode.CREATE;
        this.jobModel = jobModel;
        this.jobName = this.jobName ? this.jobName : this.jobModel.name;
        this.server = server;
        this.dialogName = this.isEdit ? this.EditStepDialog : this.NewStepDialog;
    }
    initializeUIComponents() {
        this.generalTab = azdata.window.createTab(this.GeneralTabText);
        this.advancedTab = azdata.window.createTab(this.AdvancedTabText);
        this.dialog.content = [this.generalTab, this.advancedTab];
    }
    createCommands(view, queryProvider) {
        this.openButton = view.modelBuilder.button()
            .withProperties({
            label: this.OpenCommandText,
            title: this.OpenCommandText,
            width: '80px',
            isFile: true
        }).component();
        this.parseButton = view.modelBuilder.button()
            .withProperties({
            label: this.ParseCommandText,
            title: this.ParseCommandText,
            width: '80px',
            isFile: false
        }).component();
        this.openButton.onDidClick(e => {
            let queryContent = e.fileContent;
            this.commandTextBox.value = queryContent;
        });
        this.parseButton.onDidClick(e => {
            if (this.commandTextBox.value) {
                queryProvider.parseSyntax(this.ownerUri, this.commandTextBox.value).then(result => {
                    if (result && result.parseable) {
                        this.dialog.message = { text: this.SuccessfulParseText, level: 2 };
                    }
                    else if (result && !result.parseable) {
                        this.dialog.message = { text: this.FailureParseText };
                    }
                });
            }
        });
        this.commandTextBox = view.modelBuilder.inputBox()
            .withProperties({
            height: 300,
            width: 400,
            multiline: true,
            inputType: 'text',
            ariaLabel: this.CommandLabelString,
            placeHolder: this.CommandLabelString
        })
            .component();
    }
    createGeneralTab(databases, queryProvider) {
        this.generalTab.registerContent(async (view) => {
            this.nameTextBox = view.modelBuilder.inputBox()
                .withProperties({
                ariaLabel: this.StepNameLabelString,
                placeHolder: this.StepNameLabelString
            }).component();
            this.nameTextBox.required = true;
            this.nameTextBox.onTextChanged(() => {
                if (this.nameTextBox.value.length > 0) {
                    this.dialog.message = null;
                }
            });
            this.typeDropdown = view.modelBuilder.dropDown()
                .withProperties({
                value: JobStepDialog.TSQLScript,
                values: [JobStepDialog.TSQLScript, JobStepDialog.CmdExec, JobStepDialog.Powershell]
            })
                .component();
            this.runAsDropdown = view.modelBuilder.dropDown()
                .withProperties({
                value: '',
                values: ['']
            })
                .component();
            this.runAsDropdown.enabled = false;
            this.databaseDropdown = view.modelBuilder.dropDown()
                .withProperties({
                value: databases[0],
                values: databases
            }).component();
            this.processExitCodeBox = view.modelBuilder.inputBox()
                .withProperties({
                ariaLabel: this.ProcessExitCodeText,
                placeHolder: this.ProcessExitCodeText
            }).component();
            this.processExitCodeBox.enabled = false;
            // create the commands section
            this.createCommands(view, queryProvider);
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.nameTextBox,
                    title: this.StepNameLabelString
                }, {
                    component: this.typeDropdown,
                    title: this.TypeLabelString
                }, {
                    component: this.runAsDropdown,
                    title: this.RunAsLabelString
                }, {
                    component: this.databaseDropdown,
                    title: this.DatabaseLabelString
                }, {
                    component: this.processExitCodeBox,
                    title: this.ProcessExitCodeText
                }, {
                    component: this.commandTextBox,
                    title: this.CommandLabelString,
                    actions: [this.openButton, this.parseButton]
                }], {
                horizontal: false,
                componentWidth: 420
            }).component();
            this.typeDropdown.onValueChanged((type) => {
                switch (type.selected) {
                    case (JobStepDialog.TSQLScript):
                        this.runAsDropdown.value = '';
                        this.runAsDropdown.values = [''];
                        this.runAsDropdown.enabled = false;
                        this.databaseDropdown.enabled = true;
                        this.databaseDropdown.values = databases;
                        this.databaseDropdown.value = databases[0];
                        this.processExitCodeBox.value = '';
                        this.processExitCodeBox.enabled = false;
                        break;
                    case (JobStepDialog.Powershell):
                        this.runAsDropdown.value = JobStepDialog.AgentServiceAccount;
                        this.runAsDropdown.values = [this.runAsDropdown.value];
                        this.runAsDropdown.enabled = true;
                        this.databaseDropdown.enabled = false;
                        this.databaseDropdown.values = [''];
                        this.databaseDropdown.value = '';
                        this.processExitCodeBox.value = '';
                        this.processExitCodeBox.enabled = false;
                        break;
                    case (JobStepDialog.CmdExec):
                        this.databaseDropdown.enabled = false;
                        this.databaseDropdown.values = [''];
                        this.databaseDropdown.value = '';
                        this.runAsDropdown.value = JobStepDialog.AgentServiceAccount;
                        this.runAsDropdown.values = [this.runAsDropdown.value];
                        this.runAsDropdown.enabled = true;
                        this.processExitCodeBox.enabled = true;
                        this.processExitCodeBox.value = '0';
                        break;
                }
            });
            let formWrapper = view.modelBuilder.loadingComponent().withItem(formModel).component();
            formWrapper.loading = false;
            await view.initializeModel(formWrapper);
            // Load values for edit scenario
            if (this.isEdit) {
                this.nameTextBox.value = this.model.stepName;
                this.typeDropdown.value = jobStepData_1.JobStepData.convertToSubSystemDisplayName(this.model.subSystem);
                this.databaseDropdown.value = this.model.databaseName;
                this.commandTextBox.value = this.model.command;
            }
        });
    }
    createAdvancedTab() {
        this.advancedTab.registerContent(async (view) => {
            this.successActionDropdown = view.modelBuilder.dropDown()
                .withProperties({
                width: '100%',
                value: JobStepDialog.NextStep,
                values: [JobStepDialog.NextStep, JobStepDialog.QuitJobReportingSuccess, JobStepDialog.QuitJobReportingFailure]
            })
                .component();
            let retryFlexContainer = this.createRetryCounters(view);
            this.failureActionDropdown = view.modelBuilder.dropDown()
                .withProperties({
                value: JobStepDialog.QuitJobReportingFailure,
                values: [JobStepDialog.QuitJobReportingFailure, JobStepDialog.NextStep, JobStepDialog.QuitJobReportingSuccess]
            })
                .component();
            let optionsGroup = this.createTSQLOptions(view);
            this.logToTableCheckbox = view.modelBuilder.checkBox()
                .withProperties({
                label: this.LogToTableLabel
            }).component();
            let appendToExistingEntryInTableCheckbox = view.modelBuilder.checkBox()
                .withProperties({ label: this.AppendExistingTableEntryLabel }).component();
            appendToExistingEntryInTableCheckbox.enabled = false;
            this.logToTableCheckbox.onChanged(e => {
                appendToExistingEntryInTableCheckbox.enabled = e;
            });
            let appendCheckboxContainer = view.modelBuilder.groupContainer()
                .withItems([appendToExistingEntryInTableCheckbox]).component();
            let logToTableContainer = view.modelBuilder.flexContainer()
                .withLayout({ flexFlow: 'row', justifyContent: 'space-between', width: 300 })
                .withItems([this.logToTableCheckbox]).component();
            this.logStepOutputHistoryCheckbox = view.modelBuilder.checkBox()
                .withProperties({ label: this.IncludeStepOutputHistoryLabel }).component();
            this.userInputBox = view.modelBuilder.inputBox()
                .withProperties({ inputType: 'text', width: '100%' }).component();
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.successActionDropdown,
                    title: this.SuccessActionLabel
                }, {
                    component: retryFlexContainer,
                    title: ''
                }, {
                    component: this.failureActionDropdown,
                    title: this.FailureActionLabel
                }, {
                    component: optionsGroup,
                    title: JobStepDialog.TSQLScript
                }, {
                    component: logToTableContainer,
                    title: ''
                }, {
                    component: appendCheckboxContainer,
                    title: '                            '
                }, {
                    component: this.logStepOutputHistoryCheckbox,
                    title: ''
                }, {
                    component: this.userInputBox,
                    title: this.RunAsUserLabel
                }], {
                componentWidth: 400
            }).component();
            let formWrapper = view.modelBuilder.loadingComponent().withItem(formModel).component();
            formWrapper.loading = false;
            await view.initializeModel(formWrapper);
            if (this.isEdit) {
                this.successActionDropdown.value = jobStepData_1.JobStepData.convertToCompletionActionDisplayName(this.model.successAction);
                this.retryAttemptsBox.value = this.model.retryAttempts.toString();
                this.retryIntervalBox.value = this.model.retryInterval.toString();
                this.failureActionDropdown.value = jobStepData_1.JobStepData.convertToCompletionActionDisplayName(this.model.failureAction);
                this.outputFileNameBox.value = this.model.outputFileName;
                this.appendToExistingFileCheckbox.checked = this.model.appendToLogFile;
                this.logToTableCheckbox.checked = this.model.appendLogToTable;
                this.logStepOutputHistoryCheckbox.checked = this.model.appendToStepHist;
                this.userInputBox.value = this.model.databaseUserName;
            }
        });
    }
    createRetryCounters(view) {
        this.retryAttemptsBox = view.modelBuilder.inputBox()
            .withValidation(component => Number(component.value) >= 0)
            .withProperties({
            inputType: 'number',
            width: '100%',
            placeHolder: '0'
        })
            .component();
        this.retryIntervalBox = view.modelBuilder.inputBox()
            .withValidation(component => Number(component.value) >= 0)
            .withProperties({
            inputType: 'number',
            width: '100%',
            placeHolder: '0'
        }).component();
        let retryAttemptsContainer = view.modelBuilder.formContainer()
            .withFormItems([{
                component: this.retryAttemptsBox,
                title: this.RetryAttemptsLabel
            }], {
            horizontal: false,
            componentWidth: '100%'
        })
            .component();
        let retryIntervalContainer = view.modelBuilder.formContainer()
            .withFormItems([{
                component: this.retryIntervalBox,
                title: this.RetryIntervalLabel
            }], {
            horizontal: false
        })
            .component();
        let retryFlexContainer = view.modelBuilder.flexContainer()
            .withLayout({
            flexFlow: 'row',
        }).withItems([retryAttemptsContainer, retryIntervalContainer]).component();
        return retryFlexContainer;
    }
    openFileBrowserDialog() {
        let fileBrowserTitle = this.FileBrowserDialogTitle + `${this.server}`;
        this.fileBrowserDialog = azdata.window.createModelViewDialog(fileBrowserTitle);
        let fileBrowserTab = azdata.window.createTab('File Browser');
        this.fileBrowserDialog.content = [fileBrowserTab];
        fileBrowserTab.registerContent(async (view) => {
            this.fileBrowserTree = view.modelBuilder.fileBrowserTree()
                .withProperties({ ownerUri: this.ownerUri, width: 420, height: 700 })
                .component();
            this.selectedPathTextBox = view.modelBuilder.inputBox()
                .withProperties({ inputType: 'text' })
                .component();
            this.fileBrowserTree.onDidChange((args) => {
                this.selectedPathTextBox.value = args.fullPath;
                this.fileBrowserNameBox.value = args.isFile ? path.win32.basename(args.fullPath) : '';
            });
            this.fileTypeDropdown = view.modelBuilder.dropDown()
                .withProperties({
                value: this.AllFilesLabelString,
                values: [this.AllFilesLabelString]
            })
                .component();
            this.fileBrowserNameBox = view.modelBuilder.inputBox()
                .withProperties({})
                .component();
            let fileBrowserContainer = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.fileBrowserTree,
                    title: ''
                }, {
                    component: this.selectedPathTextBox,
                    title: this.SelectedPathLabelString
                }, {
                    component: this.fileTypeDropdown,
                    title: this.FilesOfTypeLabelString
                }, {
                    component: this.fileBrowserNameBox,
                    title: this.FileNameLabelString
                }
            ]).component();
            view.initializeModel(fileBrowserContainer);
        });
        this.fileBrowserDialog.okButton.onClick(() => {
            this.outputFileNameBox.value = path.join(path.dirname(this.selectedPathTextBox.value), this.fileBrowserNameBox.value);
        });
        this.fileBrowserDialog.okButton.label = this.OkButtonText;
        this.fileBrowserDialog.cancelButton.label = this.CancelButtonText;
        azdata.window.openDialog(this.fileBrowserDialog);
    }
    createTSQLOptions(view) {
        this.outputFileBrowserButton = view.modelBuilder.button()
            .withProperties({ width: '20px', label: '...' }).component();
        this.outputFileBrowserButton.onDidClick(() => this.openFileBrowserDialog());
        this.outputFileNameBox = view.modelBuilder.inputBox()
            .withProperties({
            width: 250,
            inputType: 'text'
        }).component();
        let outputButtonContainer = view.modelBuilder.flexContainer()
            .withLayout({
            flexFlow: 'row',
            textAlign: 'right',
            width: '100%'
        }).withItems([this.outputFileBrowserButton], { flex: '1 1 50%' }).component();
        let outputFlexBox = view.modelBuilder.flexContainer()
            .withLayout({
            flexFlow: 'row',
            width: 350
        }).withItems([this.outputFileNameBox, outputButtonContainer], {
            flex: '1 1 50%'
        }).component();
        this.appendToExistingFileCheckbox = view.modelBuilder.checkBox()
            .withProperties({
            label: this.AppendOutputToFileLabel
        }).component();
        this.appendToExistingFileCheckbox.enabled = false;
        this.outputFileNameBox.onTextChanged((input) => {
            if (input !== '') {
                this.appendToExistingFileCheckbox.enabled = true;
            }
            else {
                this.appendToExistingFileCheckbox.enabled = false;
            }
        });
        let outputFileForm = view.modelBuilder.formContainer()
            .withFormItems([{
                component: outputFlexBox,
                title: this.OutputFileNameLabel
            }, {
                component: this.appendToExistingFileCheckbox,
                title: ''
            }], { horizontal: false, componentWidth: 200 }).component();
        return outputFileForm;
    }
    async updateModel() {
        this.model.stepName = this.nameTextBox.value;
        if (!this.model.stepName || this.model.stepName.length === 0) {
            this.dialog.message = this.dialog.message = { text: this.BlankStepNameErrorText };
            return;
        }
        this.model.jobName = this.jobName;
        this.model.id = this.stepId;
        this.model.server = this.server;
        this.model.subSystem = jobStepData_1.JobStepData.convertToAgentSubSystem(this.typeDropdown.value);
        this.model.databaseName = this.databaseDropdown.value;
        this.model.script = this.commandTextBox.value;
        this.model.successAction = jobStepData_1.JobStepData.convertToStepCompletionAction(this.successActionDropdown.value);
        this.model.retryAttempts = this.retryAttemptsBox.value ? +this.retryAttemptsBox.value : 0;
        this.model.retryInterval = +this.retryIntervalBox.value ? +this.retryIntervalBox.value : 0;
        this.model.failureAction = jobStepData_1.JobStepData.convertToStepCompletionAction(this.failureActionDropdown.value);
        this.model.outputFileName = this.outputFileNameBox.value;
        this.model.appendToLogFile = this.appendToExistingFileCheckbox.checked;
        this.model.command = this.commandTextBox.value ? this.commandTextBox.value : '';
        this.model.commandExecutionSuccessCode = this.processExitCodeBox.value ? +this.processExitCodeBox.value : 0;
    }
    async initializeDialog() {
        let databases = await agentUtils_1.AgentUtils.getDatabases(this.ownerUri);
        let queryProvider = await agentUtils_1.AgentUtils.getQueryProvider();
        this.initializeUIComponents();
        this.createGeneralTab(databases, queryProvider);
        this.createAdvancedTab();
        this.dialog.registerCloseValidator(() => {
            this.updateModel();
            let validationResult = this.model.validate();
            if (!validationResult.valid) {
                // TODO: Show Error Messages
                console.error(validationResult.errorMessages.join(','));
            }
            return validationResult.valid;
        });
    }
}
exports.JobStepDialog = JobStepDialog;
// TODO: localize
// Top level
//
JobStepDialog.NewDialogTitle = localize('jobStepDialog.newJobStep', "New Job Step");
JobStepDialog.EditDialogTitle = localize('jobStepDialog.editJobStep', "Edit Job Step");
// Dropdown options
JobStepDialog.TSQLScript = localize('jobStepDialog.TSQL', "Transact-SQL script (T-SQL)");
JobStepDialog.Powershell = localize('jobStepDialog.powershell', "PowerShell");
JobStepDialog.CmdExec = localize('jobStepDialog.CmdExec', "Operating system (CmdExec)");
JobStepDialog.ReplicationDistributor = localize('jobStepDialog.replicationDistribution', "Replication Distributor");
JobStepDialog.ReplicationMerge = localize('jobStepDialog.replicationMerge', "Replication Merge");
JobStepDialog.ReplicationQueueReader = localize('jobStepDialog.replicationQueueReader', "Replication Queue Reader");
JobStepDialog.ReplicationSnapshot = localize('jobStepDialog.replicationSnapshot', "Replication Snapshot");
JobStepDialog.ReplicationTransactionLogReader = localize('jobStepDialog.replicationTransactionLogReader', "Replication Transaction-Log Reader");
JobStepDialog.AnalysisServicesCommand = localize('jobStepDialog.analysisCommand', "SQL Server Analysis Services Command");
JobStepDialog.AnalysisServicesQuery = localize('jobStepDialog.analysisQuery', "SQL Server Analysis Services Query");
JobStepDialog.ServicesPackage = localize('jobStepDialog.servicesPackage', "SQL Server Integration Service Package");
JobStepDialog.AgentServiceAccount = localize('jobStepDialog.agentServiceAccount', "SQL Server Agent Service Account");
JobStepDialog.NextStep = localize('jobStepDialog.nextStep', "Go to the next step");
JobStepDialog.QuitJobReportingSuccess = localize('jobStepDialog.quitJobSuccess', "Quit the job reporting success");
JobStepDialog.QuitJobReportingFailure = localize('jobStepDialog.quitJobFailure', "Quit the job reporting failure");
//# sourceMappingURL=jobStepDialog.js.map