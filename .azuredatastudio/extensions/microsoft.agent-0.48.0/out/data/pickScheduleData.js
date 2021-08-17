"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickScheduleData = void 0;
const agentUtils_1 = require("../agentUtils");
const interfaces_1 = require("../interfaces");
class PickScheduleData {
    constructor(ownerUri, jobName) {
        this.dialogMode = interfaces_1.AgentDialogMode.VIEW;
        this.ownerUri = ownerUri;
        this.jobName = jobName;
    }
    async initialize() {
        let agentService = await agentUtils_1.AgentUtils.getAgentService();
        try {
            let result = await agentService.getJobSchedules(this.ownerUri);
            this.initialized = true;
            if (result && result.success) {
                this.schedules = result.schedules;
                return this.schedules;
            }
            return undefined;
        }
        catch (error) {
            throw error;
        }
    }
    async save() {
        this.selectedSchedule.jobName = this.jobName;
    }
    isInitialized() {
        return this.initialized;
    }
}
exports.PickScheduleData = PickScheduleData;
//# sourceMappingURL=pickScheduleData.js.map