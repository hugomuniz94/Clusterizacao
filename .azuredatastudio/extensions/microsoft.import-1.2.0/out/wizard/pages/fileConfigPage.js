"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileConfigPage = void 0;
const azdata = require("azdata");
const vscode = require("vscode");
const importPage_1 = require("../api/importPage");
const constants = require("../../common/constants");
const fs = require("fs");
class FileConfigPage extends importPage_1.ImportPage {
    constructor() {
        super(...arguments);
        this.tableNames = [];
        // private async populateTableNames(): Promise<boolean> {
        // 	this.tableNames = [];
        // 	let databaseName = (<azdata.CategoryValue>this.databaseDropdown.value).name;
        //
        // 	if (!databaseName || databaseName.length === 0) {
        // 		this.tableNames = [];
        // 		return false;
        // 	}
        //
        // 	let connectionUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
        // 	let queryProvider = azdata.dataprotocol.getProvider<azdata.QueryProvider>(this.model.server.providerName, azdata.DataProviderType.QueryProvider);
        // 	let results: azdata.SimpleExecuteResult;
        //
        // 	try {
        // 		//let query = sqlstring.format('USE ?; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'', [databaseName]);
        // 		//results = await queryProvider.runQueryAndReturn(connectionUri, query);
        // 	} catch (e) {
        // 		return false;
        // 	}
        //
        // 	this.tableNames = results.rows.map(row => {
        // 		return row[0].displayValue;
        // 	});
        //
        // 	return true;
        // }
    }
    get serverDropdown() {
        return this._serverDropdown;
    }
    set serverDropdown(serverDropdown) {
        this._serverDropdown = serverDropdown;
    }
    get databaseDropdown() {
        return this._databaseDropdown;
    }
    set databaseDropdown(databaseDropdown) {
        this._databaseDropdown = databaseDropdown;
    }
    get fileTextBox() {
        return this._fileTextBox;
    }
    set fileTextBox(fileTextBox) {
        this._fileTextBox = fileTextBox;
    }
    get fileButton() {
        return this._fileButton;
    }
    set fileButton(fileButton) {
        this._fileButton = fileButton;
    }
    get tableNameTextBox() {
        return this._tableNameTextBox;
    }
    set tableNameTextBox(tableNameTextBox) {
        this._tableNameTextBox = tableNameTextBox;
    }
    get schemaDropdown() {
        return this._schemaDropdown;
    }
    set schemaDropdown(schemaDropdown) {
        this._schemaDropdown = schemaDropdown;
    }
    get form() {
        return this._form;
    }
    set form(form) {
        this._form = form;
    }
    get schemaLoader() {
        return this._schemaLoader;
    }
    set schemaLoader(schemaLoader) {
        this._schemaLoader = schemaLoader;
    }
    async start() {
        let schemaComponent = await this.createSchemaDropdown();
        let tableNameComponent = await this.createTableNameBox();
        let fileBrowserComponent = await this.createFileBrowser();
        let databaseComponent = await this.createDatabaseDropdown();
        let serverComponent = await this.createServerDropdown();
        this.form = this.view.modelBuilder.formContainer()
            .withFormItems([
            serverComponent,
            databaseComponent,
            fileBrowserComponent,
            tableNameComponent,
            schemaComponent
        ]).component();
        await this.view.initializeModel(this.form);
        return true;
    }
    async onPageEnter() {
        this.serverDropdown.focus();
        let r1 = await this.populateServerDropdown();
        let r2 = await this.populateDatabaseDropdown();
        let r3 = await this.populateSchemaDropdown();
        return r1 && r2 && r3;
    }
    async onPageLeave() {
        delete this.model.serverId;
        return true;
    }
    async cleanup() {
        delete this.model.filePath;
        delete this.model.table;
        return true;
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator((info) => {
            if (this.schemaLoader.loading || this.databaseDropdown.loading) {
                return false;
            }
            return true;
        });
    }
    async createServerDropdown() {
        this.serverDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true
        }).component();
        // Handle server changes
        this.serverDropdown.onValueChanged(async () => {
            const connectionValue = this.serverDropdown.value;
            if (!connectionValue) {
                return;
            }
            this.model.server = connectionValue.connection;
            await this.populateDatabaseDropdown();
            await this.populateSchemaDropdown();
        });
        return {
            component: this.serverDropdown,
            title: constants.serverDropDownTitleText
        };
    }
    async populateServerDropdown() {
        let values = await this.getServerValues();
        if (values === undefined) {
            return false;
        }
        this.model.server = values[0].connection;
        this.serverDropdown.values = values;
        return true;
    }
    async createDatabaseDropdown() {
        this.databaseDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true
        }).component();
        // Handle database changes
        this.databaseDropdown.onValueChanged(async () => {
            const nameValue = this.databaseDropdown.value;
            if (!nameValue) {
                return;
            }
            this.model.database = nameValue.name;
            if (!this.model.server) {
                return;
            }
            let connectionProvider = azdata.dataprotocol.getProvider(this.model.server.providerName, azdata.DataProviderType.ConnectionProvider);
            let connectionUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
            connectionProvider.changeDatabase(connectionUri, this.model.database);
            this.populateSchemaDropdown();
        });
        return {
            component: this.databaseDropdown,
            title: constants.databaseDropdownTitleText
        };
    }
    async populateDatabaseDropdown() {
        this.databaseDropdown.loading = true;
        this.databaseDropdown.values = [];
        this.schemaDropdown.values = [];
        if (!this.model.server) {
            //TODO handle error case
            this.databaseDropdown.loading = false;
            return false;
        }
        let defaultServerDatabase = this.model.server.options.database;
        let values;
        try {
            values = await this.getDatabaseValues();
        }
        catch (error) {
            // This code is used in case of contained databases when the query will return an error.
            console.log(error);
            values = [{ displayName: defaultServerDatabase, name: defaultServerDatabase }];
            this.databaseDropdown.editable = false;
        }
        this.model.database = defaultServerDatabase;
        this.databaseDropdown.updateProperties({
            values: values
        });
        this.databaseDropdown.value = { displayName: this.model.database, name: this.model.database };
        this.databaseDropdown.loading = false;
        return true;
    }
    async createFileBrowser() {
        this.fileTextBox = this.view.modelBuilder.inputBox().withProps({
            required: true,
            validationErrorMessage: constants.invalidFileLocationError
        }).withValidation((component) => {
            return fs.existsSync(component.value);
        }).component();
        this.fileButton = this.view.modelBuilder.button().withProperties({
            label: constants.browseFilesText,
        }).component();
        this.fileButton.onDidClick(async (click) => {
            let fileUris = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                openLabel: constants.openFileText,
                filters: {
                    'CSV/TXT Files': ['csv', 'txt'],
                    'All Files': ['*']
                }
            });
            if (!fileUris || fileUris.length === 0) {
                return;
            }
            let fileUri = fileUris[0];
            this.fileTextBox.value = fileUri.fsPath;
            // Get the name of the file.
            let nameStart = fileUri.path.lastIndexOf('/');
            let nameEnd = fileUri.path.lastIndexOf('.');
            // Handle files without extensions
            if (nameEnd === 0) {
                nameEnd = fileUri.path.length;
            }
            let extension = fileUri.path.substring(nameEnd + 1, fileUri.path.length);
            /**
             * FileType should be TXT for txt files and files with unknown types.
             *  CSVs and TSVs are treated as the CSV file while learning in the prose library.
             */
            switch (extension.toLowerCase()) {
                case 'json':
                    this.model.fileType = 'JSON';
                    break;
                case 'csv':
                case 'tsv':
                    this.model.fileType = 'CSV';
                    break;
                default:
                    this.model.fileType = 'TXT';
            }
            this.tableNameTextBox.value = fileUri.path.substring(nameStart + 1, nameEnd);
            this.model.table = this.tableNameTextBox.value;
            this.tableNameTextBox.validate();
            // Let then model know about the file path
            this.model.filePath = fileUri.fsPath;
        });
        return {
            component: this.fileTextBox,
            title: constants.fileTextboxTitleText,
            actions: [this.fileButton]
        };
    }
    async createTableNameBox() {
        this.tableNameTextBox = this.view.modelBuilder.inputBox().withValidation((name) => {
            let tableName = name.value;
            if (!tableName || tableName.length === 0) {
                return false;
            }
            // This won't actually do anything until table names are brought back in.
            if (this.tableNames.indexOf(tableName) !== -1) {
                return false;
            }
            return true;
        }).withProperties({
            required: true,
        }).component();
        this.tableNameTextBox.onTextChanged((tableName) => {
            this.model.table = tableName;
        });
        return {
            component: this.tableNameTextBox,
            title: constants.tableTextboxTitleText,
        };
    }
    async createSchemaDropdown() {
        this.schemaDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true
        }).component();
        this.schemaLoader = this.view.modelBuilder.loadingComponent().withItem(this.schemaDropdown).component();
        this.schemaDropdown.onValueChanged(() => {
            const schemaValue = this.schemaDropdown.value;
            if (!schemaValue) {
                return;
            }
            this.model.schema = schemaValue.name;
        });
        return {
            component: this.schemaLoader,
            title: constants.schemaTextboxTitleText,
        };
    }
    async populateSchemaDropdown() {
        var _a;
        this.schemaLoader.loading = true;
        let values = await this.getSchemaValues();
        this.model.schema = (_a = values[0]) === null || _a === void 0 ? void 0 : _a.name;
        this.schemaDropdown.values = values;
        this.schemaLoader.loading = false;
        return true;
    }
    async getSchemaValues() {
        if (!this.model.server) {
            return [];
        }
        let connectionUri = await azdata.connection.getUriForConnection(this.model.server.connectionId);
        let queryProvider = azdata.dataprotocol.getProvider(this.model.server.providerName, azdata.DataProviderType.QueryProvider);
        let results = await queryProvider.runQueryAndReturn(connectionUri, constants.selectSchemaQuery);
        let idx = -1;
        let count = -1;
        let values = results.rows.map(row => {
            let schemaName = row[0].displayValue;
            count++;
            if (this.model.schema && schemaName === this.model.schema) {
                idx = count;
            }
            let val = row[0].displayValue;
            return {
                name: val,
                displayName: val
            };
        });
        if (idx >= 0) {
            let tmp = values[0];
            values[0] = values[idx];
            values[idx] = tmp;
        }
        return values;
    }
    deleteServerValues() {
        delete this.model.server;
        delete this.model.serverId;
        delete this.model.database;
        delete this.model.schema;
    }
    deleteDatabaseValues() {
        delete this.model.database;
        delete this.model.schema;
    }
}
exports.FileConfigPage = FileConfigPage;
//# sourceMappingURL=fileConfigPage.js.map