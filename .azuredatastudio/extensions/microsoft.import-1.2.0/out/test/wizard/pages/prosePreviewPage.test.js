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
const utils_test_1 = require("../../utils.test");
const prosePreviewPage_1 = require("../../../wizard/pages/prosePreviewPage");
describe('import extension prose preview tests', function () {
    // declaring mock variables
    let mockFlatFileWizard;
    let mockImportModel;
    // declaring instance variables
    let wizard;
    let page;
    let pages = new Map();
    let prosePreviewPage;
    beforeEach(async function () {
        // initializing mock variables
        mockFlatFileWizard = TypeMoq.Mock.ofType(flatFileWizard_1.FlatFileWizard, TypeMoq.MockBehavior.Loose, undefined, TypeMoq.It.isAny());
        mockImportModel = TypeMoq.Mock.ofType(utils_test_1.TestImportDataModel, TypeMoq.MockBehavior.Loose);
        // creating a wizard and adding page that will contain the fileConfigPage
        wizard = azdata.window.createWizard(constants.wizardNameText);
        page = azdata.window.createWizardPage(constants.page2NameText);
    });
    it('checking if all components are initialized properly', async function () {
        // Opening the wizard and initializing the page as ProsePreviewPage
        await new Promise(function (resolve) {
            page.registerContent(async (view) => {
                prosePreviewPage = new prosePreviewPage_1.ProsePreviewPage(mockFlatFileWizard.object, page, mockImportModel.object, view, TypeMoq.It.isAny());
                pages.set(1, prosePreviewPage);
                await prosePreviewPage.start();
                prosePreviewPage.setupNavigationValidator();
                await prosePreviewPage.onPageEnter();
                resolve();
            });
            wizard.generateScriptButton.hidden = true;
            wizard.pages = [page];
            wizard.open();
        });
        // checking if all the required components are correctly initialized
        should.notEqual(prosePreviewPage.table, undefined, 'table should not be undefined');
        should.notEqual(prosePreviewPage.refresh, undefined, 'refresh should not be undefined');
        should.notEqual(prosePreviewPage.loading, undefined, 'loading should not be undefined');
        should.notEqual(prosePreviewPage.form, undefined, 'form should not be undefined');
        should.notEqual(prosePreviewPage.resultTextComponent, undefined, 'resultTextComponent should not be undefined');
        // calling the clean up code
        await prosePreviewPage.onPageLeave();
        await prosePreviewPage.cleanup();
    });
});
//# sourceMappingURL=prosePreviewPage.test.js.map