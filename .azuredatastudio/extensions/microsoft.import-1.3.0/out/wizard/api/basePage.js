"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const azdata = require("azdata");
class BasePage {
    /**
     * This method is called when the user is leaving the page.
     */
    async onPageLeave() {
        return true;
    }
    /**
     * Override this method to cleanup what you don't need cached in the page.
     */
    async cleanup() {
        return true;
    }
    async getServerValues() {
        let cons = await azdata.connection.getActiveConnections();
        // This user has no active connections ABORT MISSION
        if (!cons || cons.length === 0) {
            return undefined;
        }
        let count = -1;
        let idx = -1;
        let values = cons.map(c => {
            // Handle the code to remember what the user's choice was from before
            count++;
            if (idx === -1) {
                if (this.model.server && c.connectionId === this.model.server.connectionId) {
                    idx = count;
                }
                else if (this.model.serverId && c.connectionId === this.model.serverId) {
                    idx = count;
                }
            }
            let usr = c.options.user;
            let srv = c.options.server;
            if (!usr) {
                usr = 'default';
            }
            let finalName = `${srv} (${usr})`;
            return {
                connection: c,
                displayName: finalName,
                name: c.connectionId
            };
        });
        if (idx >= 0) {
            let tmp = values[0];
            values[0] = values[idx];
            values[idx] = tmp;
        }
        else {
            this.deleteServerValues();
        }
        return values;
    }
    async getDatabaseValues() {
        let idx = -1;
        let count = -1;
        let values = (await azdata.connection.listDatabases(this.model.server.connectionId)).map(db => {
            count++;
            if (this.model.database && db === this.model.database) {
                idx = count;
            }
            return {
                displayName: db,
                name: db
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
    }
}
exports.BasePage = BasePage;
//# sourceMappingURL=basePage.js.map