"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const TypeMoq = require("typemoq");
const vscode = require("vscode");
const azdata = require("azdata");
const flatFileWizard_1 = require("../../wizard/flatFileWizard");
const utils_test_1 = require("../utils.test");
const should = require("should");
const sinon = require("sinon");
describe('import extension flat file wizard', function () {
    let showErrorMessageSpy;
    this.beforeEach(function () {
        showErrorMessageSpy = sinon.spy(vscode.window, 'showErrorMessage');
    });
    this.afterEach(function () {
        sinon.restore();
    });
    it('opens connectionDialog when there are no active connections', async function () {
        let testConnection = {
            providerName: 'MSSQL',
            connectionId: 'testConnectionId',
            options: {}
        };
        // There is no current connection.
        sinon.stub(azdata.connection, 'getCurrentConnection').returns(undefined);
        // openConnectionDialog returns a test connection
        let openConnectionDialogSpy = sinon.stub(azdata.connection, 'openConnectionDialog').returns(Promise.resolve(testConnection));
        let testFlatFileWizard = new flatFileWizard_1.FlatFileWizard(TypeMoq.It.isAny());
        await testFlatFileWizard.getConnectionId();
        // openConnectionDialog will be called once
        sinon.assert.calledOnce(openConnectionDialogSpy);
    });
    it('shows error message when an invalid connection is selected', async function () {
        // The active connection doesn't have a valid Provider
        let testConnectionProfile = utils_test_1.ImportTestUtils.getTestConnectionProfile();
        sinon.stub(azdata.connection, 'getCurrentConnection').returns(Promise.resolve(testConnectionProfile));
        sinon.stub(azdata.connection, 'openConnectionDialog').returns(undefined);
        let testFlatFileWizard = new flatFileWizard_1.FlatFileWizard(TypeMoq.It.isAny());
        await testFlatFileWizard.getConnectionId();
        sinon.assert.calledOnce(showErrorMessageSpy);
    });
    it('shows error message when no connection is selected', async function () {
        // The active connection doesn't have a valid Provider
        sinon.stub(azdata.connection, 'getCurrentConnection').returns(Promise.resolve(undefined));
        sinon.stub(azdata.connection, 'openConnectionDialog').returns(undefined);
        let testFlatFileWizard = new flatFileWizard_1.FlatFileWizard(TypeMoq.It.isAny());
        await testFlatFileWizard.getConnectionId();
        sinon.assert.calledOnce(showErrorMessageSpy);
    });
    it('getConnection returns active connection', async function () {
        let testConnectionProfile = utils_test_1.ImportTestUtils.getTestConnectionProfile();
        testConnectionProfile.providerId = 'MSSQL';
        //mocking an active connection
        sinon.stub(azdata.connection, 'getCurrentConnection').returns(Promise.resolve(testConnectionProfile));
        let testFlatFileWizard = new flatFileWizard_1.FlatFileWizard(TypeMoq.It.isAny());
        //getConnectionID should return the connectionId of active connection
        let connectionId = await testFlatFileWizard.getConnectionId();
        should(connectionId).equals(testConnectionProfile.connectionId);
    });
    it('should initialize all pages', async function () {
        let testConnectionProfile = utils_test_1.ImportTestUtils.getTestConnectionProfile();
        testConnectionProfile.providerId = 'MSSQL';
        sinon.stub(azdata.connection, 'getCurrentConnection').returns(Promise.resolve(testConnectionProfile));
        let testProvider = {
            providerId: 'testProviderId',
            connectionProfile: utils_test_1.ImportTestUtils.getTestConnectionProfile()
        };
        let testFlatFileWizard = new flatFileWizard_1.FlatFileWizard(TypeMoq.It.isAny());
        await testFlatFileWizard.start(testProvider);
        // asserting all wizard pages are getting created
        should.notEqual(testFlatFileWizard.wizard, undefined);
        should.notEqual(testFlatFileWizard.page1, undefined);
        should.notEqual(testFlatFileWizard.page2, undefined);
        should.notEqual(testFlatFileWizard.page3, undefined);
        should.notEqual(testFlatFileWizard.page4, undefined);
        let expectedPages = [
            testFlatFileWizard.page1,
            testFlatFileWizard.page2,
            testFlatFileWizard.page3,
            testFlatFileWizard.page4
        ];
        should.deepEqual(testFlatFileWizard.wizard.pages, expectedPages);
    });
});
//# sourceMappingURL=flatFileWizard.test.js.map