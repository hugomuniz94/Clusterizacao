/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class CreateSessionData {
    constructor(ownerUri, templates) {
        this.templates = new Array();
        this.ownerUri = ownerUri;
        this.templates = templates;
    }
    getTemplateNames() {
        return this.templates.map(e => e.name);
    }
    selectTemplate(name) {
        return this.templates.find((t) => { return t.name === name; });
    }
}
exports.CreateSessionData = CreateSessionData;
//# sourceMappingURL=createSessionData.js.map