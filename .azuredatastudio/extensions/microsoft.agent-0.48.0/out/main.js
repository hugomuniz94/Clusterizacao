"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const mainController_1 = require("./mainController");
let controller;
function activate(context) {
    controller = new mainController_1.MainController(context);
    controller.activate();
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (controller) {
        controller.deactivate();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map