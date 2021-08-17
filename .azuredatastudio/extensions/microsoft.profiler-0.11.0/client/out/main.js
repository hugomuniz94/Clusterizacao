/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mainController_1 = require("./mainController");
const apiWrapper_1 = require("./apiWrapper");
function activate(context) {
    let apiWrapper = new apiWrapper_1.ApiWrapper();
    exports.controller = new mainController_1.MainController(context, apiWrapper);
    exports.controller.activate();
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (exports.controller) {
        exports.controller.deactivate();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map