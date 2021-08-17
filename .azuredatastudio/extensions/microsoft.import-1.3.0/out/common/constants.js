"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectSchemaQuery = exports.importNewFileText = exports.page4NameText = exports.page3NameText = exports.page2NameText = exports.page1NameText = exports.wizardNameText = exports.needSqlConnectionText = exports.needConnectionText = exports.updateText = exports.fileImportText = exports.tableSchemaText = exports.tableNameText = exports.databaseText = exports.serverNameText = exports.importStatusText = exports.importInformationText = exports.refreshText = exports.failureTitleText = exports.successTitleText = exports.allowNullsText = exports.primaryKeyText = exports.dataTypeText = exports.columnNameText = exports.nextText = exports.importDataText = exports.schemaTextboxTitleText = exports.tableTextboxTitleText = exports.fileTextboxTitleText = exports.openFileText = exports.browseFilesText = exports.invalidFileLocationError = exports.databaseDropdownTitleText = exports.serverDropDownTitleText = exports.serviceCrashMessageText = exports.crashButtonText = exports.flatFileImportStartCommand = exports.serviceCrashLink = exports.supportedProviders = exports.summaryErrorSymbol = exports.mssqlProvider = exports.sqlConfigSectionName = exports.configLogDebugInfo = exports.providerId = exports.serviceName = exports.extensionConfigSectionName = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle();
exports.extensionConfigSectionName = 'flatFileImport';
exports.serviceName = 'Flat File Import Service';
exports.providerId = 'FlatFileImport';
exports.configLogDebugInfo = 'logDebugInfo';
exports.sqlConfigSectionName = 'sql';
exports.mssqlProvider = 'MSSQL';
exports.summaryErrorSymbol = '✗ ';
exports.supportedProviders = [exports.mssqlProvider];
// Links
exports.serviceCrashLink = 'https://github.com/Microsoft/azuredatastudio/issues/2090';
// Tasks
exports.flatFileImportStartCommand = 'flatFileImport.start';
// Localized texts
exports.crashButtonText = localize('import.serviceCrashButton', "Give Feedback");
exports.serviceCrashMessageText = localize('serviceCrashMessage', "service component could not start");
exports.serverDropDownTitleText = localize('flatFileImport.serverDropdownTitle', "Server the database is in");
exports.databaseDropdownTitleText = localize('flatFileImport.databaseDropdownTitle', "Database the table is created in");
exports.invalidFileLocationError = localize('flatFile.InvalidFileLocation', "Invalid file location. Please try a different input file");
exports.browseFilesText = localize('flatFileImport.browseFiles', "Browse");
exports.openFileText = localize('flatFileImport.openFile', "Open");
exports.fileTextboxTitleText = localize('flatFileImport.fileTextboxTitle', "Location of the file to be imported");
exports.tableTextboxTitleText = localize('flatFileImport.tableTextboxTitle', "New table name");
exports.schemaTextboxTitleText = localize('flatFileImport.schemaTextboxTitle', "Table schema");
exports.importDataText = localize('flatFileImport.importData', "Import Data");
exports.nextText = localize('flatFileImport.next', "Next");
exports.columnNameText = localize('flatFileImport.columnName', "Column Name");
exports.dataTypeText = localize('flatFileImport.dataType', "Data Type");
exports.primaryKeyText = localize('flatFileImport.primaryKey', "Primary Key");
exports.allowNullsText = localize('flatFileImport.allowNulls', "Allow Nulls");
exports.successTitleText = localize('flatFileImport.prosePreviewMessage', "This operation analyzed the input file structure to generate the preview below for up to the first 50 rows.");
exports.failureTitleText = localize('flatFileImport.prosePreviewMessageFail', "This operation was unsuccessful. Please try a different input file.");
exports.refreshText = localize('flatFileImport.refresh', "Refresh");
exports.importInformationText = localize('flatFileImport.importInformation', "Import information");
exports.importStatusText = localize('flatFileImport.importStatus', "Import status");
exports.serverNameText = localize('flatFileImport.serverName', "Server name");
exports.databaseText = localize('flatFileImport.databaseName', "Database name");
exports.tableNameText = localize('flatFileImport.tableName', "Table name");
exports.tableSchemaText = localize('flatFileImport.tableSchema', "Table schema");
exports.fileImportText = localize('flatFileImport.fileImport', "File to be imported");
exports.updateText = localize('flatFileImport.success.norows', "✔ You have successfully inserted the data into a table.");
exports.needConnectionText = localize('import.needConnection', "Please connect to a server before using this wizard.");
exports.needSqlConnectionText = localize('import.needSQLConnection', "SQL Server Import extension does not support this type of connection");
exports.wizardNameText = localize('flatFileImport.wizardName', "Import flat file wizard");
exports.page1NameText = localize('flatFileImport.page1Name', "Specify Input File");
exports.page2NameText = localize('flatFileImport.page2Name', "Preview Data");
exports.page3NameText = localize('flatFileImport.page3Name', "Modify Columns");
exports.page4NameText = localize('flatFileImport.page4Name', "Summary");
exports.importNewFileText = localize('flatFileImport.importNewFile', "Import new file");
// SQL Queries
exports.selectSchemaQuery = `SELECT name FROM sys.schemas`;
//# sourceMappingURL=constants.js.map