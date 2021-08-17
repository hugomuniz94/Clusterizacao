"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const mainController_1 = require("./controllers/mainController");
let controllers = [];
async function activate(context) {
    // Start the main controller
    let mainController = new mainController_1.default(context);
    controllers.push(mainController);
    context.subscriptions.push(mainController);
    await mainController.activate();
}
exports.activate = activate;
function deactivate() {
    for (let controller of controllers) {
        controller.deactivate();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map