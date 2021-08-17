"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyData = void 0;
const nls = require("vscode-nls");
const vscode = require("vscode");
const agentUtils_1 = require("../agentUtils");
const interfaces_1 = require("../interfaces");
const localize = nls.loadMessageBundle();
class ProxyData {
    constructor(ownerUri, proxyInfo) {
        this.dialogMode = interfaces_1.AgentDialogMode.CREATE;
        this.ownerUri = ownerUri;
        if (proxyInfo) {
            this.accountName = proxyInfo.accountName;
            this.credentialName = proxyInfo.credentialName;
            this.description = proxyInfo.description;
        }
    }
    async initialize() {
    }
    async save() {
        let agentService = await agentUtils_1.AgentUtils.getAgentService();
        let proxyInfo = this.toAgentProxyInfo();
        let result = await agentService.createProxy(this.ownerUri, proxyInfo);
        if (!result || !result.success) {
            vscode.window.showErrorMessage(localize('proxyData.saveErrorMessage', "Proxy update failed '{0}'", result.errorMessage ? result.errorMessage : 'Unknown'));
        }
        else {
            if (this.dialogMode === interfaces_1.AgentDialogMode.EDIT) {
                vscode.window.showInformationMessage(localize('proxyData.saveSucessMessage', "Proxy '{0}' updated successfully", proxyInfo.accountName));
            }
            else {
                vscode.window.showInformationMessage(localize('proxyData.newJobSuccessMessage', "Proxy '{0}' created successfully", proxyInfo.accountName));
            }
        }
    }
    toAgentProxyInfo() {
        return {
            id: this.id,
            accountName: this.accountName,
            description: this.description,
            credentialName: this.credentialName,
            credentialIdentity: this.credentialIdentity,
            credentialId: this.credentialId,
            isEnabled: this.isEnabled
        };
    }
}
exports.ProxyData = ProxyData;
//# sourceMappingURL=proxyData.js.map