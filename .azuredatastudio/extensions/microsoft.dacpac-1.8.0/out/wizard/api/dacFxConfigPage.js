"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DacFxConfigPage = void 0;
const path = require("path");
const loc = require("../../localizedConstants");
const dataTierApplicationWizard_1 = require("../dataTierApplicationWizard");
const basePage_1 = require("./basePage");
const utils_1 = require("./utils");
const fileLocationHelper_1 = require("../common/fileLocationHelper");
class DacFxConfigPage extends basePage_1.BasePage {
    constructor(instance, wizardPage, model, view) {
        super(instance, wizardPage, model, view);
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator(() => {
            return true;
        });
    }
    async createServerDropdown(isTargetServer) {
        const serverDropDownTitle = isTargetServer ? loc.targetServer : loc.sourceServer;
        this.serverDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true,
            ariaLabel: serverDropDownTitle
        }).component();
        // Handle server changes
        this.serverDropdown.onValueChanged(async () => {
            const serverDropdownValue = this.serverDropdown.value;
            if (!serverDropdownValue) {
                return;
            }
            this.model.server = serverDropdownValue.connection;
            this.model.serverName = serverDropdownValue.displayName;
            if (this.databaseDropdown) {
                await this.populateDatabaseDropdown();
            }
            else {
                await this.getDatabaseValues();
            }
        });
        return {
            component: this.serverDropdown,
            title: serverDropDownTitle
        };
    }
    async populateServerDropdown() {
        let values = await this.getServerValues();
        if (values === undefined) {
            return false;
        }
        this.model.server = values[0].connection;
        this.model.serverName = values[0].displayName;
        this.serverDropdown.updateProperties({
            values: values
        });
        return true;
    }
    async createDatabaseTextBox(title) {
        this.databaseTextBox = this.view.modelBuilder.inputBox()
            .withValidation(component => !this.databaseNameExists(component.value))
            .withProperties({
            required: true,
            validationErrorMessage: loc.databaseNameExistsErrorMessage
        }).component();
        this.databaseTextBox.ariaLabel = title;
        this.databaseTextBox.onTextChanged(async () => {
            this.model.database = this.databaseTextBox.value;
        });
        return {
            component: this.databaseTextBox,
            title: title
        };
    }
    async createDatabaseDropdown() {
        const databaseDropdownTitle = loc.sourceDatabase;
        this.databaseDropdown = this.view.modelBuilder.dropDown().withProperties({
            required: true,
            ariaLabel: databaseDropdownTitle
        }).component();
        // Handle database changes
        this.databaseDropdown.onValueChanged(() => {
            const databaseDropdownValue = this.databaseDropdown.value;
            if (!databaseDropdownValue) {
                return;
            }
            this.model.database = databaseDropdownValue;
            this.fileTextBox.value = this.generateFilePathFromDatabaseAndTimestamp();
            this.model.filePath = this.fileTextBox.value;
        });
        this.databaseLoader = this.view.modelBuilder.loadingComponent().withItem(this.databaseDropdown).withProperties({
            required: true
        }).component();
        return {
            component: this.databaseLoader,
            title: databaseDropdownTitle
        };
    }
    async populateDatabaseDropdown() {
        this.databaseLoader.loading = true;
        this.databaseDropdown.updateProperties({ values: [] });
        if (!this.model.server) {
            this.databaseLoader.loading = false;
            return false;
        }
        let values;
        try {
            values = await this.getDatabaseValues();
        }
        catch (e) {
            // if the user doesn't have access to master, just set the database to the one the current connection is to
            values = [this.model.server.databaseName];
            console.warn(e);
        }
        // only update values and regenerate filepath if this is the first time and database isn't set yet
        if (this.model.database !== values[0]) {
            // db should only get set to the dropdown value if it isn't deploy with create database
            if (!(this.instance.selectedOperation === dataTierApplicationWizard_1.Operation.deploy && !this.model.upgradeExisting)) {
                this.model.database = values[0];
            }
            // filename shouldn't change for deploy because the file exists and isn't being generated as for extract and export
            if (this.instance.selectedOperation !== dataTierApplicationWizard_1.Operation.deploy) {
                this.model.filePath = this.generateFilePathFromDatabaseAndTimestamp();
                this.fileTextBox.value = this.model.filePath;
            }
        }
        this.databaseDropdown.updateProperties({
            values: values
        });
        this.databaseLoader.loading = false;
        return true;
    }
    async createFileBrowserParts() {
        this.fileTextBox = this.view.modelBuilder.inputBox().withValidation(component => utils_1.isValidBasename(component.value))
            .withProperties({
            required: true,
            ariaLive: 'polite'
        }).component();
        // Set validation error message if file name is invalid
        this.fileTextBox.onTextChanged(text => {
            const errorMessage = utils_1.isValidBasenameErrorMessage(text);
            if (errorMessage) {
                this.fileTextBox.updateProperty('validationErrorMessage', errorMessage);
            }
        });
        this.fileTextBox.ariaLabel = loc.fileLocation;
        this.fileButton = this.view.modelBuilder.button().withProps({
            title: loc.selectFile,
            ariaLabel: loc.selectFile,
            iconPath: path.join(this.instance.extensionContextExtensionPath, 'images', 'folder.svg'),
        }).component();
    }
    generateFilePathFromDatabaseAndTimestamp() {
        return this.model.database ? path.join(this.getRootPath(), utils_1.sanitizeStringForFilename(this.model.database) + '-' + this.getDateTime() + this.fileExtension) : '';
    }
    getDateTime() {
        let now = new Date();
        return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes();
    }
    getRootPath() {
        // use previous file location if there was one
        if (this.fileTextBox.value && path.dirname(this.fileTextBox.value)) {
            return path.dirname(this.fileTextBox.value);
        }
        else { // otherwise use the default save location setting or the home directory
            return fileLocationHelper_1.defaultSaveLocation();
        }
    }
    appendFileExtensionIfNeeded() {
        // make sure filepath ends in proper file extension if it's a valid name
        if (!this.model.filePath.endsWith(this.fileExtension) && utils_1.isValidBasename(this.model.filePath)) {
            this.model.filePath += this.fileExtension;
            this.fileTextBox.value = this.model.filePath;
        }
    }
    // Compares database name with existing databases on the server
    databaseNameExists(n) {
        for (let i = 0; i < this.databaseValues.length; ++i) {
            if (this.databaseValues[i].toLowerCase() === n.toLowerCase()) {
                // database name exists
                return true;
            }
        }
        return false;
    }
}
exports.DacFxConfigPage = DacFxConfigPage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/api/dacFxConfigPage.js.map
