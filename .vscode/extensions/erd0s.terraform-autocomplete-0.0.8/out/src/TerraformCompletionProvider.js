"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
var resources = require('../../aws-resources.json');
const _ = require("lodash");
var topLevelTypes = ["output", "provider", "resource", "variable", "data"];
var topLevelRegexes = topLevelTypes.map(o => {
    return {
        type: o,
        regex: new RegExp(o + ' "[A-Za-z0-9\-_]+" "[A-Za-z0-9\-_]*" \{')
    };
});
class TerraformCompletionProvider {
    provideCompletionItems(document, position, token) {
        this.document = document;
        this.position = position;
        this.token = token;
        // Check if we're on the top level
        let lineText = document.lineAt(position.line).text;
        let lineTillCurrentPosition = lineText.substr(0, position.character);
        // Are we trying to type a resource type?
        if (this.isTopLevelType(lineTillCurrentPosition)) {
            return this.getTopLevelType(lineTillCurrentPosition);
        }
        // Are we trying to type a variable?
        if (this.isTypingVariable(lineTillCurrentPosition)) {
            // These variables should always just have 3 parts, resource type, resource name, exported field
            var varString = this.getVariableString(lineTillCurrentPosition);
            var parts = varString.split(".");
            if (parts.length == 1) {
                // We're trying to type the resource type
                var resourceTypePrefix = parts[1];
                // Get a list of all the resource types we've defined in this file
                var definedResourceTypes = this.getDefinedResourceTypes(document);
                var finalResourceTypes = _.filter(definedResourceTypes, o => (o.indexOf(resourceTypePrefix) == 0));
                return _.map(finalResourceTypes, o => {
                    return new vscode_1.CompletionItem(o, vscode_1.CompletionItemKind.Field);
                });
            }
            else if (parts.length == 2) {
                // We're trying to type the resource name
                var resourceType = parts[0];
                // Get a list of all the names for this resource type
                var names = this.getNamesForResourceType(document, resourceType);
                return _.map(names, o => new vscode_1.CompletionItem(o, vscode_1.CompletionItemKind.Field));
            }
            else if (parts.length == 3) {
                // We're trying to type the exported field for the var
                var resourceType = parts[0];
                var resourceName = parts[1];
                var attrs = resources[resourceType].attrs;
                var result = _.map(attrs, o => {
                    let c = new vscode_1.CompletionItem(`${o.name} (${resourceType})`, vscode_1.CompletionItemKind.Property);
                    c.detail = o.description;
                    c.insertText = o.name;
                    return c;
                });
                return result;
            }
            // Which part are we completing for?
            return [];
        }
        // Are we trying to type a parameter to a resource?
        let possibleResources = this.checkTopLevelResource(lineTillCurrentPosition);
        if (possibleResources.length > 0) {
            return this.getHintsForStrings(possibleResources);
        }
        // Check if we're in a resource definition
        for (var i = position.line - 1; i >= 0; i--) {
            let line = document.lineAt(i).text;
            let parentType = this.getParentType(line);
            if (parentType && parentType.type == "resource") {
                let resourceType = this.getResourceTypeFromLine(line);
                return this.getItemsForArgs(resources[resourceType].args, resourceType);
            }
            else if (parentType && parentType.type != "resource") {
                // We don't want to accidentally include some other containers stuff
                return [];
            }
        }
        return [];
    }
    getNamesForResourceType(document, resourceType) {
        var r = new RegExp('resource "' + resourceType + '" "([a-zA-Z0-9\-_]+)"');
        var found = [];
        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i).text;
            var result = line.match(r);
            if (result && result.length > 1) {
                found.push(result[1]);
            }
        }
        return _.uniq(found);
    }
    /**
     * Returns a list of resource type strings
     */
    getDefinedResourceTypes(document) {
        var r = /resource "([a-zA-Z0-9\-_]+)"/;
        var found = [];
        for (var i = 0; i < document.lineCount; i++) {
            var line = document.lineAt(i).text;
            var result = line.match(r);
            if (result && result.length > 1) {
                found.push(result[1]);
            }
        }
        return _.uniq(found);
    }
    isTopLevelType(line) {
        for (var i = 0; i < topLevelTypes.length; i++) {
            var resourceType = topLevelTypes[i];
            if (resourceType.indexOf(line) == 0) {
                return true;
            }
        }
        return false;
    }
    getTopLevelType(line) {
        for (var i = 0; i < topLevelTypes.length; i++) {
            var resourceType = topLevelTypes[i];
            if (resourceType.indexOf(line) == 0) {
                return [new vscode_1.CompletionItem(resourceType, vscode_1.CompletionItemKind.Enum)];
            }
        }
        return [];
    }
    isTypingVariable(line) {
        var r = /\$\{[0-9a-zA-Z_\.\-]*$/;
        return r.test(line);
    }
    getVariableString(line) {
        var r = /\$\{([0-9a-zA-Z_\.\-]*)$/;
        var result = line.match(r);
        if (result.length > 1) {
            return result[1];
        }
        return "";
    }
    checkTopLevelResource(lineTillCurrentPosition) {
        let parts = lineTillCurrentPosition.split(" ");
        if (parts.length == 2 && parts[0] == "resource") {
            let r = parts[1].replace(/"/g, '');
            let regex = new RegExp("^" + r);
            var possibleResources = _.filter(_.keys(resources), k => {
                if (regex.test(k)) {
                    return true;
                }
            });
            return possibleResources;
        }
        return [];
    }
    getHintsForStrings(strings) {
        return _.map(strings, s => {
            return new vscode_1.CompletionItem(s, vscode_1.CompletionItemKind.Enum);
        });
    }
    getParentType(line) {
        for (var i = 0; i < topLevelRegexes.length; i++) {
            let tl = topLevelRegexes[i];
            if (tl.regex.test(line)) {
                return tl;
            }
        }
        return false;
    }
    getResourceTypeFromLine(line) {
        var lineParts = line.split(" ");
        var type = lineParts[1];
        return type.replace(/"/g, '');
    }
    getItemsForArgs(args, type) {
        return _.map(args, o => {
            let c = new vscode_1.CompletionItem(`${o.name} (${type})`, vscode_1.CompletionItemKind.Property);
            c.detail = o.description;
            c.insertText = o.name;
            return c;
        });
    }
}
exports.TerraformCompletionProvider = TerraformCompletionProvider;
//# sourceMappingURL=TerraformCompletionProvider.js.map