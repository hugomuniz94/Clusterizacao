"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSaveLocation = void 0;
const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const constants = require("../common/constants");
/**
 * Returns the default location to save a dacpac or bacpac
 */
function defaultSaveLocation() {
    return dacFxSaveLocationSettingIsValid() ? dacFxSaveLocationSetting() : os.homedir();
}
exports.defaultSaveLocation = defaultSaveLocation;
/**
 * Returns the workspace setting on the default location to save dacpacs and bacpacs
 */
function dacFxSaveLocationSetting() {
    return vscode.workspace.getConfiguration(constants.dacFxConfigurationKey)[constants.dacFxSaveLocationKey];
}
/**
 * Returns if the default save location for dacpacs and bacpacs setting exists and is a valid path
 */
function dacFxSaveLocationSettingIsValid() {
    return dacFxSaveLocationSetting() && dacFxSaveLocationSetting().trim() !== '' && fs.existsSync(dacFxSaveLocationSetting());
}
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/common/fileLocationHelper.js.map
