"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorData = void 0;
const azdata = require("azdata");
const agentUtils_1 = require("../agentUtils");
const interfaces_1 = require("../interfaces");
class OperatorData {
    constructor(ownerUri, operatorInfo) {
        this.dialogMode = interfaces_1.AgentDialogMode.CREATE;
        this.ownerUri = ownerUri;
        if (operatorInfo) {
            this.dialogMode = interfaces_1.AgentDialogMode.EDIT;
            this.name = operatorInfo.name;
            this.id = operatorInfo.id;
            this.emailAddress = operatorInfo.emailAddress;
            this.enabled = operatorInfo.enabled;
            this.lastEmailDate = operatorInfo.lastEmailDate;
            this.lastNetSendDate = operatorInfo.lastNetSendDate;
            this.lastPagerDate = operatorInfo.lastPagerDate;
            this.pagerAddress = operatorInfo.pagerAddress;
            this.categoryName = operatorInfo.categoryName;
            this.pagerDays = operatorInfo.pagerDays.toString();
            this.saturdayPagerEndTime = operatorInfo.saturdayPagerEndTime;
            this.saturdayPagerStartTime = operatorInfo.saturdayPagerStartTime;
            this.sundayPagerEndTime = operatorInfo.sundayPagerEndTime;
            this.sundayPagerStartTime = operatorInfo.sundayPagerStartTime;
            this.netSendAddress = operatorInfo.netSendAddress;
            this.weekdayPagerStartTime = operatorInfo.weekdayPagerStartTime;
            this.weekdayPagerEndTime = operatorInfo.weekdayPagerEndTime;
        }
    }
    async initialize() {
    }
    async save() {
        let agentService = await agentUtils_1.AgentUtils.getAgentService();
        let result = await agentService.createOperator(this.ownerUri, this.toAgentOperatorInfo());
        if (!result || !result.success) {
            // TODO handle error here
        }
    }
    toAgentOperatorInfo() {
        return {
            name: this.name,
            id: this.id,
            emailAddress: this.emailAddress,
            enabled: this.enabled,
            lastEmailDate: this.lastEmailDate,
            lastNetSendDate: this.lastNetSendDate,
            lastPagerDate: this.lastPagerDate,
            pagerAddress: this.pagerAddress,
            categoryName: this.categoryName,
            pagerDays: azdata.WeekDays.weekDays,
            saturdayPagerEndTime: this.saturdayPagerEndTime,
            saturdayPagerStartTime: this.saturdayPagerStartTime,
            sundayPagerEndTime: this.sundayPagerEndTime,
            sundayPagerStartTime: this.sundayPagerStartTime,
            netSendAddress: this.netSendAddress,
            weekdayPagerStartTime: this.weekdayPagerStartTime,
            weekdayPagerEndTime: this.weekdayPagerEndTime
        };
    }
}
exports.OperatorData = OperatorData;
//# sourceMappingURL=operatorData.js.map