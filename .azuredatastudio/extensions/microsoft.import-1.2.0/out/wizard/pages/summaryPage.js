"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryPage = void 0;
const azdata = require("azdata");
const importPage_1 = require("../api/importPage");
const constants = require("../../common/constants");
const os_1 = require("os");
class SummaryPage extends importPage_1.ImportPage {
    get table() {
        return this._table;
    }
    set table(table) {
        this._table = table;
    }
    get statusText() {
        return this._statusText;
    }
    set statusText(statusText) {
        this._statusText = statusText;
    }
    get loading() {
        return this._loading;
    }
    set loading(loading) {
        this._loading = loading;
    }
    get form() {
        return this._form;
    }
    set form(form) {
        this._form = form;
    }
    async start() {
        this.table = this.view.modelBuilder.table().component();
        this.statusText = this.view.modelBuilder.text().component();
        this.loading = this.view.modelBuilder.loadingComponent().withItem(this.statusText).component();
        this.form = this.view.modelBuilder.formContainer().withFormItems([
            {
                component: this.table,
                title: constants.importInformationText
            },
            {
                component: this.loading,
                title: constants.importStatusText
            }
        ]).component();
        await this.view.initializeModel(this.form);
        return true;
    }
    async onPageEnter() {
        this.loading.loading = true;
        this.populateTable();
        await this.handleImport();
        this.loading.loading = false;
        this.instance.setImportAnotherFileVisibility(true);
        return true;
    }
    async onPageLeave() {
        this.instance.setImportAnotherFileVisibility(false);
        return true;
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator((info) => {
            return !this.loading.loading;
        });
    }
    populateTable() {
        this.table.updateProperties({
            data: [
                [constants.serverNameText, this.model.server.options.server],
                [constants.databaseText, this.model.database],
                [constants.tableNameText, this.model.table],
                [constants.tableSchemaText, this.model.schema],
                [constants.fileImportText, this.model.filePath]
            ],
            columns: ['Object type', 'Name'],
            width: 600,
            height: 200
        });
    }
    async handleImport() {
        var _a;
        let i = 0;
        const changeColumnSettingsErrors = [];
        for (let val of this.model.proseColumns) {
            let columnChangeParams = {
                index: i++,
                newName: val.columnName,
                newDataType: val.dataType,
                newNullable: val.nullable,
                newInPrimaryKey: val.primaryKey
            };
            const changeColumnResult = await this.provider.sendChangeColumnSettingsRequest(columnChangeParams);
            if ((_a = changeColumnResult === null || changeColumnResult === void 0 ? void 0 : changeColumnResult.result) === null || _a === void 0 ? void 0 : _a.errorMessage) {
                changeColumnSettingsErrors.push(changeColumnResult.result.errorMessage);
            }
        }
        // Stopping import if there are errors in change column setting.
        if (changeColumnSettingsErrors.length !== 0) {
            let updateText;
            updateText = changeColumnSettingsErrors.join(os_1.EOL);
            this.statusText.updateProperties({
                value: updateText
            });
            return;
        }
        let result;
        let err;
        let includePasswordInConnectionString = (this.model.server.options.authenticationType === 'Integrated') ? false : true;
        try {
            result = await this.provider.sendInsertDataRequest({
                connectionString: await azdata.connection.getConnectionString(this.model.server.connectionId, includePasswordInConnectionString),
                //TODO check what SSMS uses as batch size
                batchSize: 500
            });
        }
        catch (e) {
            err = e.toString();
        }
        let updateText;
        if (!result || !result.result.success) {
            updateText = constants.summaryErrorSymbol;
            if (!result) {
                updateText += err;
            }
            else {
                updateText += result.result.errorMessage;
            }
        }
        else {
            // TODO: When sql statements are in, implement this.
            //let rows = await this.getCountRowsInserted();
            //if (rows < 0) {
            updateText = constants.updateText;
            //} else {
            //updateText = localize('flatFileImport.success.rows', '✔ You have successfully inserted {0} rows.', rows);
            //}
        }
        this.statusText.updateProperties({
            value: updateText
        });
    }
}
exports.SummaryPage = SummaryPage;
//# sourceMappingURL=summaryPage.js.map