"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyDialog = void 0;
const nls = require("vscode-nls");
const azdata = require("azdata");
const agentDialog_1 = require("./agentDialog");
const proxyData_1 = require("../data/proxyData");
const localize = nls.loadMessageBundle();
class ProxyDialog extends agentDialog_1.AgentDialog {
    constructor(ownerUri, proxyInfo = undefined, credentials) {
        super(ownerUri, new proxyData_1.ProxyData(ownerUri, proxyInfo), proxyInfo ? ProxyDialog.EditDialogTitle : ProxyDialog.CreateDialogTitle);
        this.NewProxyDialog = 'NewProxyDialogOpened';
        this.EditProxyDialog = 'EditProxyDialogOpened';
        this.isEdit = false;
        this.credentials = credentials;
        this.isEdit = proxyInfo ? true : false;
        this.dialogName = this.isEdit ? this.EditProxyDialog : this.NewProxyDialog;
    }
    async initializeDialog(dialog) {
        this.generalTab = azdata.window.createTab(ProxyDialog.GeneralTabText);
        this.initializeGeneralTab();
        this.dialog.content = [this.generalTab];
    }
    initializeGeneralTab() {
        this.generalTab.registerContent(async (view) => {
            this.proxyNameTextBox = view.modelBuilder.inputBox()
                .withProperties({
                width: 420,
                ariaLabel: ProxyDialog.ProxyNameTextBoxLabel,
                placeHolder: ProxyDialog.ProxyNameTextBoxLabel
            }).component();
            this.credentialNameDropDown = view.modelBuilder.dropDown()
                .withProperties({
                width: 432,
                value: '',
                editable: true,
                values: this.credentials.length > 0 ? this.credentials.map(c => c.name) : ['']
            })
                .component();
            this.descriptionTextBox = view.modelBuilder.inputBox()
                .withProperties({
                width: 420,
                multiline: true,
                height: 300,
                ariaLabel: ProxyDialog.DescriptionTextBoxLabel,
                placeHolder: ProxyDialog.DescriptionTextBoxLabel
            }).component();
            this.subsystemCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.SubsystemLabel
            }).component();
            this.subsystemCheckBox.onChanged(() => {
                if (this.subsystemCheckBox.checked) {
                    this.operatingSystemCheckBox.checked = true;
                    this.replicationSnapshotCheckBox.checked = true;
                    this.replicationTransactionLogCheckBox.checked = true;
                    this.replicationDistributorCheckBox.checked = true;
                    this.replicationMergeCheckbox.checked = true;
                    this.replicationQueueReaderCheckbox.checked = true;
                    this.sqlQueryCheckBox.checked = true;
                    this.sqlCommandCheckBox.checked = true;
                    this.sqlIntegrationServicesPackageCheckbox.checked = true;
                    this.powershellCheckBox.checked = true;
                }
                else {
                    this.operatingSystemCheckBox.checked = false;
                    this.replicationSnapshotCheckBox.checked = false;
                    this.replicationTransactionLogCheckBox.checked = false;
                    this.replicationDistributorCheckBox.checked = false;
                    this.replicationMergeCheckbox.checked = false;
                    this.replicationQueueReaderCheckbox.checked = false;
                    this.sqlQueryCheckBox.checked = false;
                    this.sqlCommandCheckBox.checked = false;
                    this.sqlIntegrationServicesPackageCheckbox.checked = false;
                    this.powershellCheckBox.checked = false;
                }
            });
            this.operatingSystemCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.OperatingSystemLabel
            }).component();
            this.replicationSnapshotCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.ReplicationSnapshotLabel
            }).component();
            this.replicationTransactionLogCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.ReplicationTransactionLogLabel
            }).component();
            this.replicationDistributorCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.ReplicationDistributorLabel
            }).component();
            this.replicationMergeCheckbox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.ReplicationMergeLabel
            }).component();
            this.replicationQueueReaderCheckbox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.ReplicationQueueReaderLabel
            }).component();
            this.sqlQueryCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.SSASQueryLabel
            }).component();
            this.sqlCommandCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.SSASCommandLabel
            }).component();
            this.sqlIntegrationServicesPackageCheckbox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.SSISPackageLabel
            }).component();
            this.powershellCheckBox = view.modelBuilder.checkBox()
                .withProperties({
                label: ProxyDialog.PowerShellLabel
            }).component();
            view.modelBuilder.groupContainer()
                .withItems([this.operatingSystemCheckBox, this.replicationSnapshotCheckBox,
                this.replicationTransactionLogCheckBox, this.replicationDistributorCheckBox, this.replicationMergeCheckbox,
                this.replicationQueueReaderCheckbox, this.sqlQueryCheckBox, this.sqlCommandCheckBox, this.sqlIntegrationServicesPackageCheckbox,
                this.powershellCheckBox])
                .component();
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    component: this.proxyNameTextBox,
                    title: ProxyDialog.ProxyNameTextBoxLabel
                }, {
                    component: this.credentialNameDropDown,
                    title: ProxyDialog.CredentialNameTextBoxLabel
                }, {
                    component: this.descriptionTextBox,
                    title: ProxyDialog.DescriptionTextBoxLabel
                }]).withLayout({ width: 420 }).component();
            await view.initializeModel(formModel);
            this.proxyNameTextBox.value = this.model.accountName;
            this.credentialNameDropDown.value = this.model.credentialName;
            this.descriptionTextBox.value = this.model.description;
        });
    }
    async updateModel() {
        this.model.accountName = this.proxyNameTextBox.value;
        this.model.credentialName = this.credentialNameDropDown.value;
        this.model.credentialId = this.credentials.find(c => c.name === this.model.credentialName).id;
        this.model.credentialIdentity = this.credentials.find(c => c.name === this.model.credentialName).identity;
        this.model.description = this.descriptionTextBox.value;
    }
}
exports.ProxyDialog = ProxyDialog;
// Top level
ProxyDialog.CreateDialogTitle = localize('createProxy.createProxy', "Create Proxy");
ProxyDialog.EditDialogTitle = localize('createProxy.editProxy', "Edit Proxy");
ProxyDialog.GeneralTabText = localize('createProxy.General', "General");
// General tab strings
ProxyDialog.ProxyNameTextBoxLabel = localize('createProxy.ProxyName', "Proxy name");
ProxyDialog.CredentialNameTextBoxLabel = localize('createProxy.CredentialName', "Credential name");
ProxyDialog.DescriptionTextBoxLabel = localize('createProxy.Description', "Description");
ProxyDialog.SubsystemLabel = localize('createProxy.SubsystemName', "Subsystem");
ProxyDialog.OperatingSystemLabel = localize('createProxy.OperatingSystem', "Operating system (CmdExec)");
ProxyDialog.ReplicationSnapshotLabel = localize('createProxy.ReplicationSnapshot', "Replication Snapshot");
ProxyDialog.ReplicationTransactionLogLabel = localize('createProxy.ReplicationTransactionLog', "Replication Transaction-Log Reader");
ProxyDialog.ReplicationDistributorLabel = localize('createProxy.ReplicationDistributor', "Replication Distributor");
ProxyDialog.ReplicationMergeLabel = localize('createProxy.ReplicationMerge', "Replication Merge");
ProxyDialog.ReplicationQueueReaderLabel = localize('createProxy.ReplicationQueueReader', "Replication Queue Reader");
ProxyDialog.SSASQueryLabel = localize('createProxy.SSASQueryLabel', "SQL Server Analysis Services Query");
ProxyDialog.SSASCommandLabel = localize('createProxy.SSASCommandLabel', "SQL Server Analysis Services Command");
ProxyDialog.SSISPackageLabel = localize('createProxy.SSISPackage', "SQL Server Integration Services Package");
ProxyDialog.PowerShellLabel = localize('createProxy.PowerShell', "PowerShell");
//# sourceMappingURL=proxyDialog.js.map