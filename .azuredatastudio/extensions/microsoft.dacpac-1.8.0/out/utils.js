"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryGetFileSize = exports.getPackageInfo = void 0;
const fs = require("fs");
function getPackageInfo(packageJson) {
    if (packageJson) {
        return {
            name: packageJson.name,
            version: packageJson.version,
            aiKey: packageJson.aiKey
        };
    }
    return undefined;
}
exports.getPackageInfo = getPackageInfo;
/**
 * Get file size from the file stats using the file path uri
 * If the file does not exists, purposely returning undefined instead of throwing an error for telemetry purpose.
 * @param uri The file path
 */
async function tryGetFileSize(uri) {
    try {
        const stats = await fs.promises.stat(uri);
        return stats === null || stats === void 0 ? void 0 : stats.size;
    }
    catch (e) {
        return undefined;
    }
}
exports.tryGetFileSize = tryGetFileSize;
//# sourceMappingURL=https://sqlopsbuilds.blob.core.windows.net/sourcemaps/29c02e5746aea3bf4a7c52cfcd542ba498a90577/extensions/dacpac/out/utils.js.map
