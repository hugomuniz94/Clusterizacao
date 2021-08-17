"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const TypeMoq = require("typemoq");
const azdata = require("azdata");
const flatFileWizard_1 = require("../../../wizard/flatFileWizard");
const utils_test_1 = require("../../utils.test");
const fileConfigPage_1 = require("../../../wizard/pages/fileConfigPage");
const should = require("should");
const sinon = require("sinon");
describe('Base page tests', function () {
    let mockFlatFileWizard;
    let mockImportModel;
    beforeEach(function () {
        mockFlatFileWizard = TypeMoq.Mock.ofType(flatFileWizard_1.FlatFileWizard, TypeMoq.MockBehavior.Loose, undefined, TypeMoq.It.isAny());
        mockImportModel = TypeMoq.Mock.ofType(utils_test_1.TestImportDataModel, TypeMoq.MockBehavior.Loose);
    });
    afterEach(function () {
        sinon.restore();
    });
    it('getDatabaseValue returns active database first', async function () {
        // setting up the environment
        let databases = ['testdb1', 'testdb2', 'testdb3'];
        let activeDatabase = 'testdb2';
        // setting up mocks
        let importPage = new fileConfigPage_1.FileConfigPage(mockFlatFileWizard.object, TypeMoq.It.isAny(), mockImportModel.object, TypeMoq.It.isAny(), TypeMoq.It.isAny());
        sinon.stub(azdata.connection, 'listDatabases').returns(Promise.resolve(databases));
        mockImportModel.object.server = {
            providerName: 'MSSQL',
            connectionId: 'testConnectionId',
            options: {}
        };
        mockImportModel.object.database = activeDatabase;
        // Creating assert variables
        let expectedDatabaseValues = [
            { displayName: 'testdb2', name: 'testdb2' },
            { displayName: 'testdb1', name: 'testdb1' },
            { displayName: 'testdb3', name: 'testdb3' }
        ];
        let actualDatabaseValues = await importPage.getDatabaseValues();
        should(expectedDatabaseValues).deepEqual(actualDatabaseValues);
    });
    it('getServerValue returns null on no active connection', async function () {
        let importPage = new fileConfigPage_1.FileConfigPage(mockFlatFileWizard.object, TypeMoq.It.isAny(), mockImportModel.object, TypeMoq.It.isAny(), TypeMoq.It.isAny());
        // mocking getActive connection to return null
        let getActiveConnectionStub = sinon.stub(azdata.connection, 'getActiveConnections').returns(Promise.resolve(undefined));
        let serverValues = await importPage.getServerValues();
        // getServer should be undefined for null active connections
        should.equal(serverValues, undefined, 'getServer should be undefined for no active connections');
        // mocking getActive connection returns empty array
        getActiveConnectionStub.returns(Promise.resolve([]));
        serverValues = await importPage.getServerValues();
        // getServer should be undefined for empty active connections
        should.equal(serverValues, undefined, 'getServer should be undefined for empty active conections');
    });
    it('getServerValue return active server value first', async function () {
        // settign up the enviornment
        let testActiveConnections = [
            {
                providerName: 'MSSQL',
                connectionId: 'testConnection1Id',
                options: {
                    user: 'testcon1user',
                    server: 'testcon1server'
                }
            },
            {
                providerName: 'MSSQL',
                connectionId: 'testConnection2Id',
                options: {
                    user: 'testcon2user',
                    server: 'testcon2server'
                }
            },
            {
                providerName: 'PGSQL',
                connectionId: 'testConnection3Id',
                options: {
                    user: null,
                    server: 'testcon3server'
                }
            }
        ];
        let importPage = new fileConfigPage_1.FileConfigPage(mockFlatFileWizard.object, TypeMoq.It.isAny(), mockImportModel.object, TypeMoq.It.isAny(), TypeMoq.It.isAny());
        sinon.stub(azdata.connection, 'getActiveConnections').returns(Promise.resolve(testActiveConnections));
        mockImportModel.object.server = utils_test_1.ImportTestUtils.getTestServer();
        // the second connection should be the first element in the array as it is active
        let expectedConnectionValues = [
            {
                connection: testActiveConnections[1],
                displayName: 'testcon2server (testcon2user)',
                name: 'testConnection2Id'
            },
            {
                connection: testActiveConnections[0],
                displayName: 'testcon1server (testcon1user)',
                name: 'testConnection1Id'
            },
            {
                connection: testActiveConnections[2],
                displayName: 'testcon3server (default)',
                name: 'testConnection3Id'
            }
        ];
        let actualConnectionValues = await importPage.getServerValues();
        should(expectedConnectionValues).deepEqual(actualConnectionValues);
    });
});
//# sourceMappingURL=basePage.test.js.map