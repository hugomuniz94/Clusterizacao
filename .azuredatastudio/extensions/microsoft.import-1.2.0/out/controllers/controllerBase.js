"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class ControllerBase {
    constructor(context) {
        this._context = context;
    }
    get extensionContext() {
        return this._context;
    }
    dispose() {
        this.deactivate();
    }
}
exports.default = ControllerBase;
//# sourceMappingURL=controllerBase.js.map