"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeColumnSettingsRequest = exports.GetColumnInfoRequest = exports.InsertDataRequest = exports.PROSEDiscoveryRequest = exports.TelemetryParams = exports.TelemetryNotification = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
// ------------------------------- < Telemetry Sent Event > ------------------------------------
/**
 * Event sent when the language service send a telemetry event
 */
var TelemetryNotification;
(function (TelemetryNotification) {
    TelemetryNotification.type = new vscode_languageclient_1.NotificationType('telemetry/sqlevent');
})(TelemetryNotification = exports.TelemetryNotification || (exports.TelemetryNotification = {}));
/**
 * Update event parameters
 */
class TelemetryParams {
}
exports.TelemetryParams = TelemetryParams;
/**
 * PROSEDiscoveryRequest
 * Send this request to create a new PROSE session with a new file and preview it
 */
const proseDiscoveryRequestName = 'flatfile/proseDiscovery';
/**
 * InsertDataRequest
 */
const insertDataRequestName = 'flatfile/insertData';
/**
 * GetColumnInfoRequest
 */
const getColumnInfoRequestName = 'flatfile/getColumnInfo';
/**
 * ChangeColumnSettingsRequest
 */
const changeColumnSettingsRequestName = 'flatfile/changeColumnSettings';
/**
 * Requests
 */
var PROSEDiscoveryRequest;
(function (PROSEDiscoveryRequest) {
    PROSEDiscoveryRequest.type = new vscode_languageclient_1.RequestType(proseDiscoveryRequestName);
})(PROSEDiscoveryRequest = exports.PROSEDiscoveryRequest || (exports.PROSEDiscoveryRequest = {}));
var InsertDataRequest;
(function (InsertDataRequest) {
    InsertDataRequest.type = new vscode_languageclient_1.RequestType(insertDataRequestName);
})(InsertDataRequest = exports.InsertDataRequest || (exports.InsertDataRequest = {}));
var GetColumnInfoRequest;
(function (GetColumnInfoRequest) {
    GetColumnInfoRequest.type = new vscode_languageclient_1.RequestType(getColumnInfoRequestName);
})(GetColumnInfoRequest = exports.GetColumnInfoRequest || (exports.GetColumnInfoRequest = {}));
var ChangeColumnSettingsRequest;
(function (ChangeColumnSettingsRequest) {
    ChangeColumnSettingsRequest.type = new vscode_languageclient_1.RequestType(changeColumnSettingsRequestName);
})(ChangeColumnSettingsRequest = exports.ChangeColumnSettingsRequest || (exports.ChangeColumnSettingsRequest = {}));
//# sourceMappingURL=contracts.js.map