"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryViews = exports.TelemetryReporter = void 0;
const ads_extension_telemetry_1 = require("@microsoft/ads-extension-telemetry");
const Utils = require("./utils");
const packageJson = require('../package.json');
let packageInfo = Utils.getPackageInfo(packageJson);
exports.TelemetryReporter = new ads_extension_telemetry_1.default(packageInfo.name, packageInfo.version, packageInfo.aiKey);
var TelemetryViews;
(function (TelemetryViews) {
    TelemetryViews["DataTierApplicationWizard"] = "DataTierApplicationWizard";
    TelemetryViews["DeployDacpac"] = "DeployDacpac";
    TelemetryViews["DeployPlanPage"] = "DeployPlanPage";
    TelemetryViews["ExportBacpac"] = "ExportBacpac";
    TelemetryViews["ExtractDacpac"] = "ExtractDacpac";
    TelemetryViews["ImportBacpac"] = "ImportBacpac";
})(TelemetryViews = exports.TelemetryViews || (exports.TelemetryViews = {}));
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/telemetry.js.map
