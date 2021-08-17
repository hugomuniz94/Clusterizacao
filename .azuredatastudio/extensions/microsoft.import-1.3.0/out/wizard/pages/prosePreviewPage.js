"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProsePreviewPage = void 0;
const azdata = require("azdata");
const importPage_1 = require("../api/importPage");
const constants = require("../../common/constants");
class ProsePreviewPage extends importPage_1.ImportPage {
    get table() {
        return this._table;
    }
    set table(table) {
        this._table = table;
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
    get refresh() {
        return this._refresh;
    }
    set refresh(refresh) {
        this._refresh = refresh;
    }
    get resultTextComponent() {
        return this._resultTextComponent;
    }
    set resultTextComponent(resultTextComponent) {
        this._resultTextComponent = resultTextComponent;
    }
    get isSuccess() {
        return this._isSuccess;
    }
    set isSuccess(isSuccess) {
        this._isSuccess = isSuccess;
    }
    async start() {
        this.table = this.view.modelBuilder.table().withProperties({
            data: undefined,
            columns: undefined,
            forceFitColumns: azdata.ColumnSizingMode.DataFit
        }).component();
        this.refresh = this.view.modelBuilder.button().withProps({
            label: constants.refreshText,
            isFile: false,
            secondary: true
        }).component();
        this.refresh.onDidClick(async () => {
            await this.onPageEnter();
        });
        this.loading = this.view.modelBuilder.loadingComponent().component();
        this.resultTextComponent = this.view.modelBuilder.text()
            .withProperties({
            value: this.isSuccess ? constants.successTitleText : constants.failureTitleText
        }).component();
        this.form = this.view.modelBuilder.formContainer().withFormItems([
            {
                component: this.resultTextComponent,
                title: ''
            },
            {
                component: this.table,
                title: '',
                actions: [this.refresh]
            }
        ]).component();
        this.loading.component = this.form;
        await this.view.initializeModel(this.loading);
        return true;
    }
    async onPageEnter() {
        this.loading.loading = true;
        let proseResult;
        let error;
        try {
            proseResult = await this.handleProse();
        }
        catch (ex) {
            error = ex.toString();
        }
        this.loading.loading = false;
        if (proseResult) {
            await this.populateTable(this.model.proseDataPreview, this.model.proseColumns.map(c => c.columnName));
            this.isSuccess = true;
            if (this.form) {
                this.resultTextComponent.value = constants.successTitleText;
            }
            return true;
        }
        else {
            await this.populateTable([], []);
            this.isSuccess = false;
            if (this.form) {
                this.resultTextComponent.value = constants.failureTitleText + '\n' + (error !== null && error !== void 0 ? error : '');
            }
            return false;
        }
    }
    async onPageLeave() {
        await this.emptyTable();
        return true;
    }
    async cleanup() {
        delete this.model.proseDataPreview;
        return true;
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator((info) => {
            if (info) {
                // Prose Preview to Modify Columns
                if (info.lastPage === 1 && info.newPage === 2) {
                    return !this.loading.loading && this.table.data && this.table.data.length > 0;
                }
            }
            return !this.loading.loading;
        });
    }
    async handleProse() {
        const response = await this.provider.sendPROSEDiscoveryRequest({
            filePath: this.model.filePath,
            tableName: this.model.table,
            schemaName: this.model.schema,
            fileType: this.model.fileType
        });
        this.model.proseDataPreview = null;
        if (response.dataPreview) {
            this.model.proseDataPreview = response.dataPreview;
        }
        this.model.proseColumns = [];
        if (response.columnInfo) {
            response.columnInfo.forEach((column) => {
                this.model.proseColumns.push({
                    columnName: column.name,
                    dataType: column.sqlType,
                    primaryKey: false,
                    nullable: column.isNullable
                });
            });
            return true;
        }
        return false;
    }
    async populateTable(tableData, columnHeaders) {
        let rows;
        let rowsLength = tableData.length;
        if (rowsLength > 50) {
            rows = tableData;
        }
        else {
            rows = tableData.slice(0, rowsLength);
        }
        this.table.updateProperties({
            data: rows,
            columns: columnHeaders,
            height: 400,
            width: '700',
        });
    }
    async emptyTable() {
        this.table.updateProperties([]);
    }
}
exports.ProsePreviewPage = ProsePreviewPage;
//# sourceMappingURL=prosePreviewPage.js.map