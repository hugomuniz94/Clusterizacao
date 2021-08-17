"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exports.AgentUtils = void 0;
const azdata = require("azdata");
const fs_1 = require("fs");
class AgentUtils {
    static async setupProvidersFromConnection(connection) {
        this._agentService = azdata.dataprotocol.getProvider(connection.providerName, azdata.DataProviderType.AgentServicesProvider);
        this._connectionService = azdata.dataprotocol.getProvider(connection.providerName, azdata.DataProviderType.ConnectionProvider);
        this._queryProvider = azdata.dataprotocol.getProvider(connection.providerName, azdata.DataProviderType.QueryProvider);
    }
    static async getAgentService() {
        if (!AgentUtils._agentService) {
            let currentConnection = await azdata.connection.getCurrentConnection();
            this._agentService = azdata.dataprotocol.getProvider(currentConnection.providerId, azdata.DataProviderType.AgentServicesProvider);
        }
        return AgentUtils._agentService;
    }
    static async getDatabases(ownerUri) {
        if (!AgentUtils._connectionService) {
            let currentConnection = await azdata.connection.getCurrentConnection();
            this._connectionService = azdata.dataprotocol.getProvider(currentConnection.providerId, azdata.DataProviderType.ConnectionProvider);
        }
        return AgentUtils._connectionService.listDatabases(ownerUri).then(result => {
            if (result && result.databaseNames && result.databaseNames.length > 0) {
                return result.databaseNames;
            }
            return undefined;
        });
    }
    static async getQueryProvider() {
        if (!AgentUtils._queryProvider) {
            let currentConnection = await azdata.connection.getCurrentConnection();
            this._queryProvider = azdata.dataprotocol.getProvider(currentConnection.providerId, azdata.DataProviderType.QueryProvider);
        }
        return this._queryProvider;
    }
}
exports.AgentUtils = AgentUtils;
async function exists(path) {
    try {
        await fs_1.promises.access(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.exists = exists;
//# sourceMappingURL=agentUtils.js.map