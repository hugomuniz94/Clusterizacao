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
const constants = require("../../../common/constants");
describe('File config page', function () {
    let mockFlatFileWizard;
    let mockImportModel;
    let fileConfigPage;
    let wizard;
    let page;
    let pages = new Map();
    this.beforeEach(function () {
        mockFlatFileWizard = TypeMoq.Mock.ofType(flatFileWizard_1.FlatFileWizard, TypeMoq.MockBehavior.Loose, undefined, TypeMoq.It.isAny());
        mockImportModel = TypeMoq.Mock.ofType(utils_test_1.TestImportDataModel, TypeMoq.MockBehavior.Loose);
        wizard = azdata.window.createWizard(constants.wizardNameText);
        page = azdata.window.createWizardPage(constants.page1NameText);
    });
    afterEach(function () {
        sinon.restore();
    });
    it('getSchema returns active schema first', async function () {
        let mockQueryProvider = TypeMoq.Mock.ofType(utils_test_1.TestQueryProvider);
        // mock result for the schema query
        let schemaQueryResult = {
            rowCount: 3,
            rows: [
                [
                    { displayValue: 'schema1', isNull: false, invariantCultureDisplayValue: 'schema1' }
                ],
                [
                    { displayValue: 'schema2', isNull: false, invariantCultureDisplayValue: 'schema2' }
                ],
                [
                    { displayValue: 'schema3', isNull: false, invariantCultureDisplayValue: 'schema3' }
                ]
            ],
            columnInfo: undefined
        };
        // setting the default schema for the current connection. This schema should be the first value in the dropdown array
        mockImportModel.object.schema = 'schema2';
        // expected schema values for the dropdown that will be created
        let expectedSchemaValues = [
            { displayName: 'schema2', name: 'schema2' },
            { displayName: 'schema1', name: 'schema1' },
            { displayName: 'schema3', name: 'schema3' }
        ];
        // creating a mock connection
        mockImportModel.object.server = {
            providerName: 'MSSQL',
            connectionId: 'testConnectionId',
            options: {}
        };
        // setting up mocks to return test objects created earlier
        mockQueryProvider.setup(x => x.runQueryAndReturn(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(async () => { return schemaQueryResult; });
        sinon.stub(azdata.dataprotocol, 'getProvider').returns(mockQueryProvider.object);
        let fileConfigPage = new fileConfigPage_1.FileConfigPage(mockFlatFileWizard.object, TypeMoq.It.isAny(), mockImportModel.object, TypeMoq.It.isAny(), TypeMoq.It.isAny());
        let actualSchemaValues = await fileConfigPage.getSchemaValues();
        should(expectedSchemaValues).deepEqual(actualSchemaValues);
    });
    it('checking if all components are initialized properly', async function () {
        await new Promise(function (resolve) {
            page.registerContent(async (view) => {
                fileConfigPage = new fileConfigPage_1.FileConfigPage(mockFlatFileWizard.object, page, mockImportModel.object, view, TypeMoq.It.isAny());
                pages.set(1, fileConfigPage);
                await fileConfigPage.start();
                resolve();
            });
            wizard.generateScriptButton.hidden = true;
            wizard.pages = [page];
            wizard.open();
        });
        // checking if all the required components are correctly initialized
        should.notEqual(fileConfigPage.serverDropdown, undefined, 'serverDropdown should not be undefined');
        should.notEqual(fileConfigPage.databaseDropdown, undefined, 'databaseDropdown should not be undefined');
        should.notEqual(fileConfigPage.fileTextBox, undefined, 'fileTextBox should not be undefined');
        should.notEqual(fileConfigPage.fileButton, undefined, 'fileButton should not be undefined');
        should.notEqual(fileConfigPage.tableNameTextBox, undefined, 'tableNameTextBox should not be undefined');
        should.notEqual(fileConfigPage.schemaDropdown, undefined, 'schemaDropdown should not be undefined');
        should.notEqual(fileConfigPage.form, undefined, 'form should not be undefined');
        should.notEqual(fileConfigPage.schemaLoader, undefined, 'schemaLoader should not be undefined');
        await fileConfigPage.onPageLeave();
        await fileConfigPage.cleanup();
    });
    it('Dropdown values are correctly set', async function () {
        wizard = azdata.window.createWizard(constants.wizardNameText);
        page = azdata.window.createWizardPage(constants.page1NameText);
        // creating mock server values
        let testActiveConnections = [
            {
                providerName: 'MSSQL',
                connectionId: 'testConnection1Id',
                options: {
                    user: 'testcon1user',
                    server: 'testcon1server',
                    database: 'testdb1'
                }
            },
            {
                providerName: 'MSSQL',
                connectionId: 'testConnection2Id',
                options: {
                    user: 'testcon2user',
                    server: 'testcon2server',
                    database: 'testdb2'
                }
            },
            {
                providerName: 'PGSQL',
                connectionId: 'testConnection3Id',
                options: {
                    server: 'testcon3server',
                    database: 'testdb3'
                }
            }
        ];
        sinon.stub(azdata.connection, 'getActiveConnections').returns(Promise.resolve(testActiveConnections));
        // creating a test active connection. This connection will be the first value in server dropdown array
        let testServerConnection = {
            providerName: 'MSSQL',
            connectionId: 'testConnection2Id',
            options: {
                // default database. This database will be the first value in the database dropdown
                database: 'testdb2',
                user: 'testcon2user',
                server: 'testcon2server'
            }
        };
        mockImportModel.object.server = testServerConnection;
        mockImportModel.object.server.options = testServerConnection.options;
        // expected values for the server dropdown
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
        //  creating mock database values
        let databases = ['testdb1', 'testdb2', 'testdb3'];
        sinon.stub(azdata.connection, 'listDatabases').returns(Promise.resolve(databases));
        mockImportModel.object.database = 'testdb2';
        // expected values for the database dropdown
        let expectedDatabaseDropdownValues = [
            {
                displayName: 'testdb2',
                name: 'testdb2'
            },
            {
                displayName: 'testdb1',
                name: 'testdb1'
            },
            {
                displayName: 'testdb3',
                name: 'testdb3'
            }
        ];
        // mock result for the schema query
        let schemaQueryResult = {
            rowCount: 3,
            rows: [
                [
                    { displayValue: 'schema1', isNull: false, invariantCultureDisplayValue: 'schema1' }
                ],
                [
                    { displayValue: 'schema2', isNull: false, invariantCultureDisplayValue: 'schema2' }
                ],
                [
                    { displayValue: 'schema3', isNull: false, invariantCultureDisplayValue: 'schema3' }
                ]
            ],
            columnInfo: undefined
        };
        mockImportModel.object.schema = 'schema2';
        // expected values for the schema dropdown
        let expectedSchemaValues = [
            { displayName: 'schema2', name: 'schema2' },
            { displayName: 'schema1', name: 'schema1' },
            { displayName: 'schema3', name: 'schema3' }
        ];
        const testQueryProvider = new utils_test_1.TestQueryProvider();
        sinon.stub(azdata.dataprotocol, 'getProvider').returns(testQueryProvider);
        sinon.stub(testQueryProvider, 'runQueryAndReturn').resolves(schemaQueryResult);
        await new Promise(function (resolve) {
            page.registerContent(async (view) => {
                fileConfigPage = new fileConfigPage_1.FileConfigPage(mockFlatFileWizard.object, page, mockImportModel.object, view, TypeMoq.It.isAny());
                pages.set(1, fileConfigPage);
                await fileConfigPage.start();
                fileConfigPage.setupNavigationValidator();
                resolve();
            });
            wizard.generateScriptButton.hidden = true;
            wizard.pages = [page];
            wizard.open();
        });
        await fileConfigPage.onPageEnter();
        should.deepEqual(fileConfigPage.serverDropdown.value, expectedConnectionValues[0], 'Server dropdown value was incorrect');
        should.deepEqual(fileConfigPage.serverDropdown.values, expectedConnectionValues, 'Server dropdown values were incorrect');
        should.deepEqual(fileConfigPage.databaseDropdown.value, expectedDatabaseDropdownValues[0], 'Database dropdown value was incorrect');
        should.deepEqual(fileConfigPage.databaseDropdown.values, expectedDatabaseDropdownValues, 'Database dropdown values were incorrect');
        should.deepEqual(fileConfigPage.schemaDropdown.value, expectedSchemaValues[0], 'Schema dropdown value was incorrect');
        should.deepEqual(fileConfigPage.schemaDropdown.values, expectedSchemaValues, 'Schema dropdown values were incorrect');
    });
});
//# sourceMappingURL=fileConfigPage.test.js.map