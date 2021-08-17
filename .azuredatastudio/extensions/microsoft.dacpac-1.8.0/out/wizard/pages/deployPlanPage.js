"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployPlanPage = void 0;
const parser = require("htmlparser2");
const loc = require("../../localizedConstants");
const dacFxConfigPage_1 = require("../api/dacFxConfigPage");
var deployPlanXml;
(function (deployPlanXml) {
    deployPlanXml["AlertElement"] = "Alert";
    deployPlanXml["OperationElement"] = "Operation";
    deployPlanXml["ItemElement"] = "Item";
    deployPlanXml["NameAttribute"] = "Name";
    deployPlanXml["ValueAttribute"] = "Value";
    deployPlanXml["TypeAttribute"] = "Type";
    deployPlanXml["IdAttribute"] = "Id";
    deployPlanXml["DataIssueAttribute"] = "DataIssue";
})(deployPlanXml || (deployPlanXml = {}));
class TableObject {
}
class DeployPlanResult {
}
class DeployPlanPage extends dacFxConfigPage_1.DacFxConfigPage {
    constructor(instance, wizardPage, model, view) {
        super(instance, wizardPage, model, view);
    }
    async start() {
        this.table = this.view.modelBuilder.table().withProperties({
            ariaLabel: loc.deployPlanTableTitle
        }).component();
        this.loader = this.view.modelBuilder.loadingComponent().withItem(this.table).component();
        this.dataLossComponentGroup = await this.createDataLossComponents();
        this.noDataLossTextComponent = await this.createNoDataLossText();
        this.formBuilder = this.view.modelBuilder.formContainer()
            .withFormItems([
            {
                component: this.loader,
                title: ''
            },
            this.dataLossComponentGroup
        ], {
            horizontal: true,
        });
        this.form = this.formBuilder.component();
        await this.view.initializeModel(this.form);
        return true;
    }
    async onPageEnter() {
        // reset checkbox settings
        this.formBuilder.addFormItem(this.dataLossComponentGroup, { horizontal: true, componentWidth: 400 });
        this.dataLossCheckbox.checked = false;
        this.dataLossCheckbox.enabled = false;
        this.model.potentialDataLoss = false;
        this.formBuilder.removeFormItem(this.noDataLossTextComponent);
        this.loader.loading = true;
        this.table.data = [];
        await this.populateTable();
        this.loader.loading = false;
        return true;
    }
    async populateTable() {
        let report = await this.instance.generateDeployPlan();
        let result = this.parseXml(report);
        this.table.updateProperties({
            data: this.getColumnData(result),
            columns: this.getTableColumns(result.dataLossAlerts.size > 0),
            width: 875,
            height: 300
        });
        if (result.dataLossAlerts.size > 0) {
            // update message to list how many operations could result in data loss
            this.dataLossText.updateProperties({
                value: loc.dataLossTextWithCount(result.dataLossAlerts.size)
            });
            this.dataLossCheckbox.enabled = true;
            this.model.potentialDataLoss = true;
        }
        else {
            // check checkbox to enable Next button and remove checkbox because there won't be any possible data loss
            this.dataLossCheckbox.checked = true;
            this.formBuilder.removeFormItem(this.dataLossComponentGroup);
            this.formBuilder.addFormItem(this.noDataLossTextComponent, { componentWidth: 300, horizontal: true });
        }
    }
    async createDataLossCheckbox() {
        this.dataLossCheckbox = this.view.modelBuilder.checkBox()
            .withValidation(component => component.checked === true)
            .withProperties({
            label: loc.proceedDataLossMessage,
        }).component();
        return {
            component: this.dataLossCheckbox,
            title: '',
            required: true
        };
    }
    async createNoDataLossText() {
        let noDataLossText = this.view.modelBuilder.text()
            .withProperties({
            value: loc.noDataLossMessage
        }).component();
        return {
            title: '',
            component: noDataLossText
        };
    }
    async createDataLossComponents() {
        let dataLossComponent = await this.createDataLossCheckbox();
        this.dataLossText = this.view.modelBuilder.text()
            .withProperties({
            value: loc.dataLossMessage
        }).component();
        return {
            title: '',
            components: [
                {
                    component: this.dataLossText,
                    layout: {
                        componentWidth: 400,
                        horizontal: true
                    },
                    title: ''
                },
                dataLossComponent
            ]
        };
    }
    getColumnData(result) {
        // remove data loss column data if there aren't any alerts
        let columnData = result.columnData;
        if (result.dataLossAlerts.size === 0) {
            columnData.forEach(entry => {
                entry.shift();
            });
        }
        return columnData;
    }
    getTableColumns(dataloss) {
        let columns = [
            {
                value: loc.operation,
                width: 75,
                cssClass: 'align-with-header',
                toolTip: loc.operationTooltip
            },
            {
                value: loc.type,
                width: 100,
                cssClass: 'align-with-header',
                toolTip: loc.typeTooltip
            },
            {
                value: loc.object,
                width: 300,
                cssClass: 'align-with-header',
                toolTip: loc.objectTooltip
            }
        ];
        if (dataloss) {
            columns.unshift({
                value: loc.dataLoss,
                width: 50,
                cssClass: 'center-align',
                toolTip: loc.dataLossTooltip
            });
        }
        return columns;
    }
    parseXml(report) {
        let operations = new Array();
        let dataLossAlerts = new Set();
        let currentOperation = '';
        let dataIssueAlert = false;
        let currentReportSection;
        let currentTableObj;
        let p = new parser.Parser({
            onopentagname(name) {
                if (name === deployPlanXml.AlertElement) {
                    currentReportSection = deployPlanXml.AlertElement;
                }
                else if (name === deployPlanXml.OperationElement) {
                    currentReportSection = deployPlanXml.OperationElement;
                }
                else if (name === deployPlanXml.ItemElement) {
                    currentTableObj = new TableObject();
                }
            },
            onattribute: function (name, value) {
                if (currentReportSection === deployPlanXml.AlertElement) {
                    switch (name) {
                        case deployPlanXml.NameAttribute: {
                            // only care about showing data loss alerts
                            if (value === deployPlanXml.DataIssueAttribute) {
                                dataIssueAlert = true;
                            }
                            break;
                        }
                        case deployPlanXml.IdAttribute: {
                            if (dataIssueAlert) {
                                dataLossAlerts.add(value);
                            }
                            break;
                        }
                    }
                }
                else if (currentReportSection === deployPlanXml.OperationElement) {
                    switch (name) {
                        case deployPlanXml.NameAttribute: {
                            currentOperation = value;
                            break;
                        }
                        case deployPlanXml.ValueAttribute: {
                            currentTableObj.object = value;
                            break;
                        }
                        case deployPlanXml.TypeAttribute: {
                            currentTableObj.type = value;
                            break;
                        }
                        case deployPlanXml.IdAttribute: {
                            if (dataLossAlerts.has(value)) {
                                currentTableObj.dataloss = true;
                            }
                            break;
                        }
                    }
                }
            },
            onclosetag: function (name) {
                if (name === deployPlanXml.ItemElement) {
                    currentTableObj.operation = currentOperation;
                    operations.push(currentTableObj);
                }
            }
        }, { xmlMode: true, decodeEntities: true });
        p.parseChunk(report);
        let data = new Array();
        operations.forEach(operation => {
            let isDataLoss = operation.dataloss ? '⚠️' : '';
            data.push([isDataLoss, operation.operation, operation.type, operation.object]);
        });
        return {
            columnData: data,
            dataLossAlerts: dataLossAlerts
        };
    }
    setupNavigationValidator() {
        this.instance.registerNavigationValidator(() => {
            return true;
        });
    }
}
exports.DeployPlanPage = DeployPlanPage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/pages/deployPlanPage.js.map
