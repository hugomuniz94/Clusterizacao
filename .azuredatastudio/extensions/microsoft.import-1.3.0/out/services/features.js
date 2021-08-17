"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatFileImportFeature = exports.TelemetryFeature = void 0;
const dataprotocol_client_1 = require("dataprotocol-client");
const UUID = require("vscode-languageclient/lib/utils/uuid");
const telemetry_1 = require("./telemetry");
const serviceUtils = require("./serviceUtils");
const Contracts = require("./contracts");
const serviceApiManager_1 = require("./serviceApiManager");
class TelemetryFeature {
    constructor(_client) {
        this._client = _client;
    }
    fillClientCapabilities(capabilities) {
        serviceUtils.ensure(capabilities, 'telemetry').telemetry = true;
    }
    initialize() {
        this._client.onNotification(Contracts.TelemetryNotification.type, e => {
            telemetry_1.Telemetry.sendTelemetryEvent(e.params.eventName, e.params.properties, e.params.measures);
        });
    }
}
exports.TelemetryFeature = TelemetryFeature;
class FlatFileImportFeature extends dataprotocol_client_1.SqlOpsFeature {
    constructor(client) {
        super(client, FlatFileImportFeature.messagesTypes);
    }
    fillClientCapabilities(capabilities) {
    }
    initialize(capabilities) {
        this.register(this.messages, {
            id: UUID.generateUuid(),
            registerOptions: undefined
        });
    }
    registerProvider(options) {
        const client = this._client;
        let requestSender = (requestType, params) => {
            return client.sendRequest(requestType, params).then(r => {
                return r;
            }, e => {
                client.logFailedRequest(requestType, e);
                return Promise.reject(e);
            });
        };
        let sendPROSEDiscoveryRequest = (params) => {
            return requestSender(Contracts.PROSEDiscoveryRequest.type, params);
        };
        let sendInsertDataRequest = (params) => {
            return requestSender(Contracts.InsertDataRequest.type, params);
        };
        let sendGetColumnInfoRequest = (params) => {
            return requestSender(Contracts.GetColumnInfoRequest.type, params);
        };
        let sendChangeColumnSettingsRequest = (params) => {
            return requestSender(Contracts.ChangeColumnSettingsRequest.type, params);
        };
        return serviceApiManager_1.managerInstance.registerApi(serviceApiManager_1.ApiType.FlatFileProvider, {
            providerId: client.providerId,
            sendPROSEDiscoveryRequest,
            sendChangeColumnSettingsRequest,
            sendGetColumnInfoRequest,
            sendInsertDataRequest
        });
    }
}
exports.FlatFileImportFeature = FlatFileImportFeature;
FlatFileImportFeature.messagesTypes = [
    Contracts.PROSEDiscoveryRequest.type
];
//# sourceMappingURL=features.js.map