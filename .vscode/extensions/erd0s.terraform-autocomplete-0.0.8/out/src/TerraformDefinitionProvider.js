"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const opn = require("opn");
var urls = require("../../aws-urls.json");
class TerraformDefinitionProvider {
    provideDefinition(document, position, token) {
        var word = document.getWordRangeAtPosition(position);
        var words = document.getText(word);
        var found = _.get(urls, words);
        if (found) {
            opn(found);
        }
        return null;
    }
}
exports.TerraformDefinitionProvider = TerraformDefinitionProvider;
//# sourceMappingURL=TerraformDefinitionProvider.js.map