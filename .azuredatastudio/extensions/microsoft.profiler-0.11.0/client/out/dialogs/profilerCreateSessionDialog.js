/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nls = require("vscode-nls");
const azdata = require("azdata");
const vscode = require("vscode");
const createSessionData_1 = require("../data/createSessionData");
const localize = nls.loadMessageBundle();
class CreateSessionDialog {
    constructor(ownerUri, providerType, templates) {
        // Top level
        this.CancelButtonText = localize('createSessionDialog.cancel', "Cancel");
        this.CreateButtonText = localize('createSessionDialog.create', "Start");
        this.DialogTitleText = localize('createSessionDialog.title', "Start New Profiler Session");
        this._onSuccess = new vscode.EventEmitter();
        this.onSuccess = this._onSuccess.event;
        if (typeof (templates) === 'undefined' || templates === null) {
            throw new Error(localize('createSessionDialog.templatesInvalid', "Invalid templates list, cannot open dialog"));
        }
        if (typeof (ownerUri) === 'undefined' || ownerUri === null) {
            throw new Error(localize('createSessionDialog.dialogOwnerInvalid', "Invalid dialog owner, cannot open dialog"));
        }
        if (typeof (providerType) === 'undefined' || providerType === null) {
            throw new Error(localize('createSessionDialog.invalidProviderType', "Invalid provider type, cannot open dialog"));
        }
        this._providerType = providerType;
        this.model = new createSessionData_1.CreateSessionData(ownerUri, templates);
    }
    showDialog() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dialog = azdata.window.createModelViewDialog(this.DialogTitleText);
            this.initializeContent();
            this.dialog.okButton.onClick(() => this.execute());
            this.dialog.cancelButton.onClick(() => { });
            this.dialog.okButton.label = this.CreateButtonText;
            this.dialog.cancelButton.label = this.CancelButtonText;
            azdata.window.openDialog(this.dialog);
        });
    }
    initializeContent() {
        this.dialog.registerContent((view) => __awaiter(this, void 0, void 0, function* () {
            this.templatesBox = view.modelBuilder.dropDown()
                .withProperties({
                values: []
            }).component();
            this.sessionNameBox = view.modelBuilder.inputBox()
                .withProperties({
                required: true,
                multiline: false,
                value: ''
            }).component();
            this.templatesBox.onValueChanged(() => {
                this.updateSessionName();
            });
            let formModel = view.modelBuilder.formContainer()
                .withFormItems([{
                    components: [{
                            component: this.templatesBox,
                            title: localize('createSessionDialog.selectTemplates', "Select session template:")
                        },
                        {
                            component: this.sessionNameBox,
                            title: localize('createSessionDialog.enterSessionName', "Enter session name:")
                        }],
                    title: ''
                }]).withLayout({ width: '100%' }).component();
            yield view.initializeModel(formModel);
            if (this.model.templates) {
                this.templatesBox.values = this.model.getTemplateNames();
                this.updateSessionName();
            }
            this.sessionNameBox.onTextChanged(() => {
                if (this.sessionNameBox.value.length > 0) {
                    this.model.sessionName = this.sessionNameBox.value;
                    this.dialog.okButton.enabled = true;
                }
                else {
                    this.dialog.okButton.enabled = false;
                }
            });
        }));
    }
    updateSessionName() {
        if (this.templatesBox.value) {
            this.sessionNameBox.value = `ADS_${this.templatesBox.value.toString()}`;
        }
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            let profilerService = azdata.dataprotocol.getProvider(this._providerType, azdata.DataProviderType.ProfilerProvider);
            let name = this.sessionNameBox.value;
            let selected = this.templatesBox.value.toString();
            let temp = this.model.selectTemplate(selected);
            profilerService.createSession(this.model.ownerUri, this.sessionNameBox.value, temp).then(() => {
            }, (error) => {
                const message = error && error.message ? error.message : localize('createSessionDialog.createSessionFailed', "Failed to create a session");
                vscode.window.showErrorMessage(message);
            });
        });
    }
}
exports.CreateSessionDialog = CreateSessionDialog;
//# sourceMappingURL=profilerCreateSessionDialog.js.map