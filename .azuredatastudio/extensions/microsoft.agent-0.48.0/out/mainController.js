"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainController = void 0;
const nls = require("vscode-nls");
const azdata = require("azdata");
const vscode = require("vscode");
const fs_1 = require("fs");
const os = require("os");
const path = require("path");
const alertDialog_1 = require("./dialogs/alertDialog");
const jobDialog_1 = require("./dialogs/jobDialog");
const operatorDialog_1 = require("./dialogs/operatorDialog");
const proxyDialog_1 = require("./dialogs/proxyDialog");
const jobStepDialog_1 = require("./dialogs/jobStepDialog");
const pickScheduleDialog_1 = require("./dialogs/pickScheduleDialog");
const jobData_1 = require("./data/jobData");
const agentUtils_1 = require("./agentUtils");
const notebookDialog_1 = require("./dialogs/notebookDialog");
const localize = nls.loadMessageBundle();
/**
 * The main controller class that initializes the extension
 */
class TemplateMapObject {
}
class MainController {
    // PUBLIC METHODS //////////////////////////////////////////////////////
    constructor(context) {
        this.notebookTemplateMap = new Map();
        this._context = context;
    }
    static showNotYetImplemented() {
        vscode.window.showInformationMessage(localize('mainController.notImplemented', "This feature is under development.  Check-out the latest insiders build if you'd like to try out the most recent changes!"));
    }
    /**
     * Activates the extension
     */
    activate() {
        vscode.commands.registerCommand('agent.openJobDialog', async (ownerUri, jobInfo) => {
            if (!this.jobDialog || (this.jobDialog && !this.jobDialog.isOpen)) {
                this.jobDialog = new jobDialog_1.JobDialog(ownerUri, jobInfo);
            }
            if (!this.jobDialog.isOpen) {
                this.jobDialog.dialogName ? await this.jobDialog.openDialog(this.jobDialog.dialogName) : await this.jobDialog.openDialog();
            }
        });
        vscode.commands.registerCommand('agent.openNewStepDialog', (ownerUri, server, jobInfo, jobStepInfo) => {
            agentUtils_1.AgentUtils.getAgentService().then(async (agentService) => {
                let jobData = new jobData_1.JobData(ownerUri, jobInfo, agentService);
                let dialog = new jobStepDialog_1.JobStepDialog(ownerUri, server, jobData, jobStepInfo, false);
                dialog.dialogName ? await dialog.openDialog(dialog.dialogName) : await dialog.openDialog();
            });
        });
        vscode.commands.registerCommand('agent.openPickScheduleDialog', async (ownerUri, jobName) => {
            let dialog = new pickScheduleDialog_1.PickScheduleDialog(ownerUri, jobName);
            await dialog.showDialog();
        });
        vscode.commands.registerCommand('agent.openAlertDialog', async (ownerUri, jobInfo, alertInfo) => {
            if (!this.alertDialog || (this.alertDialog && !this.alertDialog.isOpen)) {
                await agentUtils_1.AgentUtils.getAgentService().then(async (agentService) => {
                    let jobData = new jobData_1.JobData(ownerUri, jobInfo, agentService);
                    this.alertDialog = new alertDialog_1.AlertDialog(ownerUri, jobData, alertInfo, false);
                });
            }
            if (!this.alertDialog.isOpen) {
                this.alertDialog.dialogName ? await this.alertDialog.openDialog(this.alertDialog.dialogName) : await this.alertDialog.openDialog();
            }
        });
        vscode.commands.registerCommand('agent.openOperatorDialog', async (ownerUri, operatorInfo) => {
            if (!this.operatorDialog || (this.operatorDialog && !this.operatorDialog.isOpen)) {
                this.operatorDialog = new operatorDialog_1.OperatorDialog(ownerUri, operatorInfo);
            }
            if (!this.operatorDialog.isOpen) {
                this.operatorDialog.dialogName ? await this.operatorDialog.openDialog(this.operatorDialog.dialogName) : await this.operatorDialog.openDialog();
            }
        });
        vscode.commands.registerCommand('agent.reuploadTemplate', async (ownerUri, operatorInfo) => {
            let nbEditor = azdata.nb.activeNotebookEditor;
            // await nbEditor.document.save();
            let templateMap = this.notebookTemplateMap.get(nbEditor.document.uri.toString());
            let vsEditor = await vscode.workspace.openTextDocument(templateMap.fileUri);
            let content = vsEditor.getText();
            await fs_1.promises.writeFile(templateMap.tempPath, content);
            agentUtils_1.AgentUtils.getAgentService().then(async (agentService) => {
                let result = await agentService.updateNotebook(templateMap.ownerUri, templateMap.notebookInfo.name, templateMap.notebookInfo, templateMap.tempPath);
                if (result.success) {
                    vscode.window.showInformationMessage(localize('agent.templateUploadSuccessful', "Template updated successfully"));
                }
                else {
                    vscode.window.showInformationMessage(localize('agent.templateUploadError', "Template update failure"));
                }
            });
        });
        vscode.commands.registerCommand('agent.openProxyDialog', async (ownerUri, proxyInfo, credentials) => {
            if (!this.proxyDialog || (this.proxyDialog && !this.proxyDialog.isOpen)) {
                this.proxyDialog = new proxyDialog_1.ProxyDialog(ownerUri, proxyInfo, credentials);
            }
            if (!this.proxyDialog.isOpen) {
                this.proxyDialog.dialogName ? await this.proxyDialog.openDialog(this.proxyDialog.dialogName) : await this.proxyDialog.openDialog();
            }
            this.proxyDialog.dialogName ? await this.proxyDialog.openDialog(this.proxyDialog.dialogName) : await this.proxyDialog.openDialog();
        });
        vscode.commands.registerCommand('agent.openNotebookEditorFromJsonString', async (filename, jsonNotebook, notebookInfo, ownerUri) => {
            const tempfilePath = path.join(os.tmpdir(), 'mssql_notebooks', filename + '.ipynb');
            if (!await agentUtils_1.exists(path.join(os.tmpdir(), 'mssql_notebooks'))) {
                await fs_1.promises.mkdir(path.join(os.tmpdir(), 'mssql_notebooks'));
            }
            if (await agentUtils_1.exists(tempfilePath)) {
                await fs_1.promises.unlink(tempfilePath);
            }
            try {
                await fs_1.promises.writeFile(tempfilePath, jsonNotebook);
                let uri = vscode.Uri.parse(`untitled:${path.basename(tempfilePath)}`);
                if (notebookInfo) {
                    this.notebookTemplateMap.set(uri.toString(), { notebookInfo: notebookInfo, fileUri: uri, ownerUri: ownerUri, tempPath: tempfilePath });
                    vscode.commands.executeCommand('setContext', 'agent:trackedTemplate', true);
                }
                await azdata.nb.showNotebookDocument(uri, {
                    initialContent: jsonNotebook,
                    initialDirtyState: false
                });
                vscode.commands.executeCommand('setContext', 'agent:trackedTemplate', false);
            }
            catch (e) {
                vscode.window.showErrorMessage(e);
            }
        });
        vscode.commands.registerCommand('agent.openNotebookDialog', async (ownerUri, notebookInfo) => {
            /*
            There are four entry points to this commands:
            1. Explorer context menu:
                The first arg becomes a vscode URI
                the second argument is undefined
            2. Notebook toolbar:
                both the args are undefined
            3. Agent New Notebook Action
                the first arg is database OwnerUri
                the second arg is undefined
            4. Agent Edit Notebook Action
                the first arg is database OwnerUri
                the second arg is notebookInfo from database
            */
            if (!ownerUri || ownerUri instanceof vscode.Uri) {
                let path;
                if (!ownerUri) {
                    if (azdata.nb.activeNotebookEditor.document.isDirty || azdata.nb.activeNotebookEditor.document.isUntitled) {
                        vscode.window.showErrorMessage(localize('agent.unsavedFileSchedulingError', "The notebook must be saved before being scheduled. Please save and then retry scheduling again."), { modal: true });
                        return;
                    }
                    path = azdata.nb.activeNotebookEditor.document.fileName;
                }
                else {
                    path = ownerUri.fsPath;
                }
                let connection = await this.getConnectionFromUser();
                ownerUri = await azdata.connection.getUriForConnection(connection.connectionId);
                this.notebookDialog = new notebookDialog_1.NotebookDialog(ownerUri, { filePath: path, connection: connection });
                if (!this.notebookDialog.isOpen) {
                    this.notebookDialog.dialogName ? await this.notebookDialog.openDialog(this.notebookDialog.dialogName) : await this.notebookDialog.openDialog();
                }
            }
            else {
                if (!this.notebookDialog || (this.notebookDialog && !this.notebookDialog.isOpen)) {
                    this.notebookDialog = new notebookDialog_1.NotebookDialog(ownerUri, { notebookInfo: notebookInfo });
                }
                if (!this.notebookDialog.isOpen) {
                    this.notebookDialog.dialogName ? await this.notebookDialog.openDialog(this.notebookDialog.dialogName) : await this.notebookDialog.openDialog();
                }
            }
        });
    }
    async getConnectionFromUser() {
        let connection = null;
        let connections = await azdata.connection.getActiveConnections();
        if (!connections || connections.length === 0) {
            connection = await azdata.connection.openConnectionDialog();
        }
        else {
            let connectionNames = [];
            let connectionDisplayString = [];
            for (let i = 0; i < connections.length; i++) {
                let currentConnectionString = connections[i].options.server + ' (' + connections[i].options.user + ')';
                connectionNames.push(connections[i]);
                connectionDisplayString.push(currentConnectionString);
            }
            connectionDisplayString.push(localize('agent.AddNewConnection', "Add new connection"));
            let connectionName = await vscode.window.showQuickPick(connectionDisplayString, { placeHolder: localize('agent.selectConnection', "Select a connection") });
            if (connectionDisplayString.indexOf(connectionName) !== -1) {
                if (connectionName === localize('agent.AddNewConnection', "Add new connection")) {
                    connection = await azdata.connection.openConnectionDialog();
                }
                else {
                    connection = connections[connectionDisplayString.indexOf(connectionName)];
                }
            }
            else {
                vscode.window.showErrorMessage(localize('agent.selectValidConnection', "Please select a valid connection"), { modal: true });
            }
        }
        return connection;
    }
    /**
     * Deactivates the extension
     */
    deactivate() {
    }
}
exports.MainController = MainController;
//# sourceMappingURL=mainController.js.map