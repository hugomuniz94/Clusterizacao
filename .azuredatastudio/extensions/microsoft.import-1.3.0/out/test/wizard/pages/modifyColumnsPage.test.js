"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const TypeMoq = require("typemoq");
const azdata = require("azdata");
const constants = require("../../../common/constants");
const flatFileWizard_1 = require("../../../wizard/flatFileWizard");
const should = require("should");
const modifyColumnsPage_1 = require("../../../wizard/pages/modifyColumnsPage");
const utils_test_1 = require("../../utils.test");
describe('import extension modify Column Page', function () {
    let wizard;
    let page;
    let modifyColumnsPage;
    let mockFlatFileWizard;
    let mockImportModel;
    let pages = new Map();
    let mockFlatFileProvider;
    beforeEach(function () {
        mockFlatFileProvider = TypeMoq.Mock.ofType(utils_test_1.TestFlatFileProvider);
        mockFlatFileWizard = TypeMoq.Mock.ofType(flatFileWizard_1.FlatFileWizard, TypeMoq.MockBehavior.Loose, undefined, mockFlatFileProvider.object);
        mockImportModel = TypeMoq.Mock.ofType(utils_test_1.TestImportDataModel, TypeMoq.MockBehavior.Loose);
        wizard = azdata.window.createWizard(constants.wizardNameText);
        page = azdata.window.createWizardPage(constants.page3NameText);
    });
    it('checking if all components are initialized properly', async function () {
        await new Promise(function (resolve) {
            page.registerContent(async (view) => {
                modifyColumnsPage = new modifyColumnsPage_1.ModifyColumnsPage(mockFlatFileWizard.object, page, mockImportModel.object, view, TypeMoq.It.isAny());
                pages.set(1, modifyColumnsPage);
                await modifyColumnsPage.start();
                resolve();
            });
            wizard.generateScriptButton.hidden = true;
            wizard.pages = [page];
            wizard.open();
        });
        // checking if all the components are initialized properly
        should.notEqual(modifyColumnsPage.table, undefined, 'table should not be undefined');
        should.notEqual(modifyColumnsPage.text, undefined, 'text should not be undefined');
        should.notEqual(modifyColumnsPage.loading, undefined, 'loading should not be undefined');
        should.notEqual(modifyColumnsPage.form, undefined, 'form should not be undefined');
    });
    it('handleImport updates table value correctly when import is successful', async function () {
        let testProseColumns = [
            {
                columnName: 'column1',
                dataType: 'nvarchar(50)',
                primaryKey: false,
                nullable: false
            },
            {
                columnName: 'column2',
                dataType: 'nvarchar(50)',
                primaryKey: false,
                nullable: false
            }
        ];
        let testTableData = [
            ['column1', 'nvarchar(50)', false, false],
            ['column2', 'nvarchar(50)', false, false]
        ];
        mockImportModel.object.proseColumns = testProseColumns;
        await new Promise(function (resolve) {
            page.registerContent(async (view) => {
                modifyColumnsPage = new modifyColumnsPage_1.ModifyColumnsPage(mockFlatFileWizard.object, page, mockImportModel.object, view, TypeMoq.It.isAny());
                pages.set(1, modifyColumnsPage);
                await modifyColumnsPage.start();
                resolve();
            });
            wizard.generateScriptButton.hidden = true;
            wizard.pages = [page];
            wizard.open();
        });
        await modifyColumnsPage.onPageEnter();
        // checking if all the required components are correctly initialized
        should.deepEqual(modifyColumnsPage.table.data, testTableData);
    });
});
//# sourceMappingURL=modifyColumnsPage.test.js.map