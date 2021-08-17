"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const azdata = require("azdata");
const loc = require("../../localizedConstants");
const systemDbs = ['master', 'msdb', 'tempdb', 'model'];
class BasePage {
    constructor(instance, wizardPage, model, view) {
        this.instance = instance;
        this.wizardPage = wizardPage;
        this.model = model;
        this.view = view;
    }
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
        let cons = await azdata.connection.getConnections(/* activeConnectionsOnly */ true);
        // This user has no active connections ABORT MISSION
        if (!cons || cons.length === 0) {
            return undefined;
        }
        // reverse list so that most recent connections are first
        cons.reverse();
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
                usr = loc.defaultText;
            }
            let finalName;
            // show connection name if there is one
            if (c.options.connectionName) {
                finalName = `${c.options.connectionName}`;
            }
            else {
                finalName = `${srv} (${usr})`;
            }
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
        // only leave unique server connections
        values = values.reduce((uniqueValues, conn) => {
            let exists = uniqueValues.find(x => x.displayName === conn.displayName);
            if (!exists) {
                uniqueValues.push(conn);
            }
            return uniqueValues;
        }, []);
        return values;
    }
    async getDatabaseValues() {
        let idx = -1;
        let count = -1;
        this.databaseValues = (await azdata.connection.listDatabases(this.model.server.connectionId))
            // filter out system dbs
            .filter(db => systemDbs.find(systemdb => db === systemdb) === undefined)
            .map(db => {
            count++;
            if (this.model.database && db === this.model.database) {
                idx = count;
            }
            return db;
        });
        if (idx >= 0) {
            let tmp = this.databaseValues[0];
            this.databaseValues[0] = this.databaseValues[idx];
            this.databaseValues[idx] = tmp;
        }
        else {
            this.deleteDatabaseValues();
        }
        return this.databaseValues;
    }
    deleteServerValues() {
        delete this.model.server;
        delete this.model.serverId;
        delete this.model.database;
    }
    deleteDatabaseValues() {
        return;
    }
}
exports.BasePage = BasePage;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/wizard/api/basePage.js.map
