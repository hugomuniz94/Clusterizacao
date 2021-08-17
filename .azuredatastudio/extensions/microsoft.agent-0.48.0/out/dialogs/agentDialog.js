"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDialog = void 0;
const nls = require("vscode-nls");
const azdata = require("azdata");
const vscode = require("vscode");
const localize = nls.loadMessageBundle();
class AgentDialog {
    constructor(ownerUri, model, title) {
        this.ownerUri = ownerUri;
        this.model = model;
        this.title = title;
        this._onSuccess = new vscode.EventEmitter();
        this._isOpen = false;
        this.onSuccess = this._onSuccess.event;
    }
    get dialogMode() {
        return this.model.dialogMode;
    }
    async openDialog(dialogName) {
        if (!this._isOpen) {
            this._isOpen = true;
            let event = dialogName ? dialogName : null;
            this.dialog = azdata.window.createModelViewDialog(this.title, event);
            await this.model.initialize();
            await this.initializeDialog(this.dialog);
            this.dialog.okButton.label = AgentDialog.OkButtonText;
            this.dialog.okButton.onClick(async () => await this.execute());
            this.dialog.cancelButton.label = AgentDialog.CancelButtonText;
            this.dialog.cancelButton.onClick(async () => await this.cancel());
            azdata.window.openDialog(this.dialog);
        }
    }
    async execute() {
        this.updateModel();
        await this.model.save();
        this._isOpen = false;
        this._onSuccess.fire(this.model);
    }
    async cancel() {
        this._isOpen = false;
    }
    getActualConditionValue(checkbox, dropdown) {
        return checkbox.checked ? Number(this.getDropdownValue(dropdown)) : azdata.JobCompletionActionCondition.Never;
    }
    getDropdownValue(dropdown) {
        return (typeof dropdown.value === 'string') ? dropdown.value : dropdown.value.name;
    }
    setConditionDropdownSelectedValue(dropdown, selectedValue) {
        let idx = 0;
        for (idx = 0; idx < dropdown.values.length; idx++) {
            if (Number(dropdown.values[idx].name) === selectedValue) {
                dropdown.value = dropdown.values[idx];
                break;
            }
        }
    }
    get isOpen() {
        return this._isOpen;
    }
}
exports.AgentDialog = AgentDialog;
AgentDialog.OkButtonText = localize('agentDialog.OK', "OK");
AgentDialog.CancelButtonText = localize('agentDialog.Cancel', "Cancel");
//# sourceMappingURL=agentDialog.js.map