"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerInstance = exports.ApiType = void 0;
const vscode = require("vscode");
var ApiType;
(function (ApiType) {
    ApiType["FlatFileProvider"] = "FlatFileProvider";
})(ApiType = exports.ApiType || (exports.ApiType = {}));
class ServiceApiManager {
    constructor() {
        this.featureEventChannels = {};
        this._onRegisteredModelView = new vscode.EventEmitter();
    }
    onRegisteredApi(type) {
        let featureEmitter = this.featureEventChannels[type];
        if (!featureEmitter) {
            featureEmitter = new vscode.EventEmitter();
            this.featureEventChannels[type] = featureEmitter;
        }
        return featureEmitter.event;
    }
    registerApi(type, feature) {
        let featureEmitter = this.featureEventChannels[type];
        if (featureEmitter) {
            featureEmitter.fire(feature);
        }
        // TODO handle unregistering API on close
        return {
            dispose: () => undefined
        };
    }
    get onRegisteredModelView() {
        return this._onRegisteredModelView.event;
    }
    registerModelView(id, modelView) {
        this._onRegisteredModelView.fire({
            id: id,
            modelView: modelView
        });
    }
}
exports.managerInstance = new ServiceApiManager();
//# sourceMappingURL=serviceApiManager.js.map