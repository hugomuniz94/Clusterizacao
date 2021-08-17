"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.undefinedFilenameErrorMessage = exports.databaseNameExistsErrorMessage = exports.deployPlanTableTitle = exports.defaultText = exports.generatingScriptMessage = exports.generateScript = exports.exportText = exports.importText = exports.extract = exports.deploy = exports.exportConfigPageName = exports.importConfigPageName = exports.extractConfigPageName = exports.summaryPageName = exports.deployPlanPageName = exports.deployConfigPageName = exports.selectOperationPageName = exports.wizardTitle = exports.exportDescription = exports.importDescription = exports.extractDescription = exports.deployDescription = exports.versionText = exports.save = exports.dataLossTooltip = exports.dataLoss = exports.objectTooltip = exports.object = exports.typeTooltip = exports.type = exports.operationTooltip = exports.operation = exports.dataLossMessage = exports.noDataLossMessage = exports.proceedDataLossMessage = exports.dataLossTextWithCount = exports.newDatabase = exports.upgradeExistingDatabase = exports.open = exports.databaseName = exports.value = exports.setting = exports.version = exports.summaryTableTitle = exports.selectFile = exports.fileLocation = exports.targetDatabase = exports.sourceDatabase = exports.sourceServer = exports.targetServer = void 0;
exports.operationErrorMessage = exports.generateDeployErrorMessage = exports.deployPlanErrorMessage = exports.tooLongFilenameErrorMessage = exports.trailingWhitespaceErrorMessage = exports.reservedValueErrorMessage = exports.reservedWindowsFilenameErrorMessage = exports.invalidFileCharsErrorMessage = exports.whitespaceFilenameErrorMessage = exports.filenameEndingIsPeriodErrorMessage = void 0;
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle(__filename);
// Labels
exports.targetServer = localize(0, null);
exports.sourceServer = localize(1, null);
exports.sourceDatabase = localize(2, null);
exports.targetDatabase = localize(3, null);
exports.fileLocation = localize(4, null);
exports.selectFile = localize(5, null);
exports.summaryTableTitle = localize(6, null);
exports.version = localize(7, null);
exports.setting = localize(8, null);
exports.value = localize(9, null);
exports.databaseName = localize(10, null);
exports.open = localize(11, null);
exports.upgradeExistingDatabase = localize(12, null);
exports.newDatabase = localize(13, null);
function dataLossTextWithCount(count) { return localize(14, null, count); }
exports.dataLossTextWithCount = dataLossTextWithCount;
exports.proceedDataLossMessage = localize(15, null);
exports.noDataLossMessage = localize(16, null);
exports.dataLossMessage = localize(17, null);
exports.operation = localize(18, null);
exports.operationTooltip = localize(19, null);
exports.type = localize(20, null);
exports.typeTooltip = localize(21, null);
exports.object = localize(22, null);
exports.objectTooltip = localize(23, null);
exports.dataLoss = localize(24, null);
exports.dataLossTooltip = localize(25, null);
exports.save = localize(26, null);
exports.versionText = localize(27, null);
exports.deployDescription = localize(28, null);
exports.extractDescription = localize(29, null);
exports.importDescription = localize(30, null);
exports.exportDescription = localize(31, null);
exports.wizardTitle = localize(32, null);
exports.selectOperationPageName = localize(33, null);
exports.deployConfigPageName = localize(34, null);
exports.deployPlanPageName = localize(35, null);
exports.summaryPageName = localize(36, null);
exports.extractConfigPageName = localize(37, null);
exports.importConfigPageName = localize(38, null);
exports.exportConfigPageName = localize(39, null);
exports.deploy = localize(40, null);
exports.extract = localize(41, null);
exports.importText = localize(42, null);
exports.exportText = localize(43, null);
exports.generateScript = localize(44, null);
exports.generatingScriptMessage = localize(45, null);
exports.defaultText = localize(46, null);
exports.deployPlanTableTitle = localize(47, null);
// Error messages
exports.databaseNameExistsErrorMessage = localize(48, null);
exports.undefinedFilenameErrorMessage = localize(49, null);
exports.filenameEndingIsPeriodErrorMessage = localize(50, null);
exports.whitespaceFilenameErrorMessage = localize(51, null);
exports.invalidFileCharsErrorMessage = localize(52, null);
exports.reservedWindowsFilenameErrorMessage = localize(53, null);
exports.reservedValueErrorMessage = localize(54, null);
exports.trailingWhitespaceErrorMessage = localize(55, null);
exports.tooLongFilenameErrorMessage = localize(56, null);
function deployPlanErrorMessage(errorMessage) { return localize(57, null, errorMessage ? errorMessage : 'Unknown'); }
exports.deployPlanErrorMessage = deployPlanErrorMessage;
function generateDeployErrorMessage(errorMessage) { return localize(58, null, errorMessage ? errorMessage : 'Unknown'); }
exports.generateDeployErrorMessage = generateDeployErrorMessage;
function operationErrorMessage(operation, errorMessage) { return localize(59, null, operation, errorMessage ? errorMessage : 'Unknown'); }
exports.operationErrorMessage = operationErrorMessage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/localizedConstants.js.map
