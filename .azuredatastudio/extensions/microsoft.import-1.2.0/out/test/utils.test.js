"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFlatFileProvider = exports.TestImportDataModel = exports.TestExtensionContext = exports.TestQueryProvider = exports.ImportTestUtils = void 0;
const vscode = require("vscode");
class ImportTestUtils {
    static getTestServer() {
        return {
            providerName: 'MSSQL',
            connectionId: 'testConnection2Id',
            options: {}
        };
    }
    static getTestConnectionProfile() {
        return {
            providerId: 'InvalidProvider',
            databaseName: 'databaseName',
            serverName: 'testServerName',
            connectionId: 'testConnectionId',
            groupId: 'testGroupId',
            connectionName: 'testConnectionName',
            userName: 'testUserName',
            password: 'testPassword',
            authenticationType: 'testAuthenticationType',
            savePassword: true,
            saveProfile: true,
            groupFullName: 'testGroupFullName',
            options: {}
        };
    }
    static async getExtensionPath() {
        return await vscode.extensions.getExtension('Microsoft.import').extensionPath;
    }
    static async getTestExtensionContext() {
        let testContext = new TestExtensionContext();
        testContext.extensionPath = await vscode.extensions.getExtension('Microsoft.import').extensionPath;
        return testContext;
    }
}
exports.ImportTestUtils = ImportTestUtils;
class TestQueryProvider {
    constructor() {
        this.providerId = 'testProviderId';
    }
    cancelQuery(ownerUri) {
        throw new Error('Method not implemented.');
    }
    runQuery(ownerUri, selection, runOptions) {
        throw new Error('Method not implemented.');
    }
    runQueryStatement(ownerUri, line, column) {
        throw new Error('Method not implemented.');
    }
    runQueryString(ownerUri, queryString) {
        throw new Error('Method not implemented.');
    }
    runQueryAndReturn(ownerUri, queryString) {
        throw new Error('Method not implemented.');
    }
    parseSyntax(ownerUri, query) {
        throw new Error('Method not implemented.');
    }
    getQueryRows(rowData) {
        throw new Error('Method not implemented.');
    }
    disposeQuery(ownerUri) {
        throw new Error('Method not implemented.');
    }
    saveResults(requestParams) {
        throw new Error('Method not implemented.');
    }
    setQueryExecutionOptions(ownerUri, options) {
        throw new Error('Method not implemented.');
    }
    registerOnQueryComplete(handler) {
        throw new Error('Method not implemented.');
    }
    registerOnBatchStart(handler) {
        throw new Error('Method not implemented.');
    }
    registerOnBatchComplete(handler) {
        throw new Error('Method not implemented.');
    }
    registerOnResultSetAvailable(handler) {
        throw new Error('Method not implemented.');
    }
    registerOnResultSetUpdated(handler) {
        throw new Error('Method not implemented.');
    }
    registerOnMessage(handler) {
        throw new Error('Method not implemented.');
    }
    commitEdit(ownerUri) {
        throw new Error('Method not implemented.');
    }
    createRow(ownerUri) {
        throw new Error('Method not implemented.');
    }
    deleteRow(ownerUri, rowId) {
        throw new Error('Method not implemented.');
    }
    disposeEdit(ownerUri) {
        throw new Error('Method not implemented.');
    }
    initializeEdit(ownerUri, schemaName, objectName, objectType, rowLimit, queryString) {
        throw new Error('Method not implemented.');
    }
    revertCell(ownerUri, rowId, columnId) {
        throw new Error('Method not implemented.');
    }
    revertRow(ownerUri, rowId) {
        throw new Error('Method not implemented.');
    }
    updateCell(ownerUri, rowId, columnId, newValue) {
        throw new Error('Method not implemented.');
    }
    getEditRows(rowData) {
        throw new Error('Method not implemented.');
    }
    registerOnEditSessionReady(handler) {
        throw new Error('Method not implemented.');
    }
}
exports.TestQueryProvider = TestQueryProvider;
class TestExtensionContext {
    asAbsolutePath(relativePath) {
        throw new Error('Method not implemented.');
    }
}
exports.TestExtensionContext = TestExtensionContext;
class TestImportDataModel {
}
exports.TestImportDataModel = TestImportDataModel;
class TestFlatFileProvider {
    sendPROSEDiscoveryRequest(params) {
        throw new Error('Method not implemented.');
    }
    sendInsertDataRequest(params) {
        throw new Error('Method not implemented.');
    }
    sendGetColumnInfoRequest(params) {
        throw new Error('Method not implemented.');
    }
    sendChangeColumnSettingsRequest(params) {
        throw new Error('Method not implemented.');
    }
}
exports.TestFlatFileProvider = TestFlatFileProvider;
//# sourceMappingURL=utils.test.js.map