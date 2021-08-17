"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageServerInstaller = exports.isValidVersionString = exports.defaultVersionString = void 0;
const vscode = require("vscode");
const del = require("del");
const fs = require("fs");
const path = require("path");
const semver = require("semver");
const utils_1 = require("./utils");
const js_releases_1 = require("@hashicorp/js-releases");
const extensionVersion = vscode.extensions.getExtension('hashicorp.terraform').packageJSON.version;
exports.defaultVersionString = "latest";
function isValidVersionString(value) {
    return semver.validRange(value, { includePrerelease: true, loose: true }) !== null;
}
exports.isValidVersionString = isValidVersionString;
class LanguageServerInstaller {
    constructor(lsPath, reporter) {
        this.lsPath = lsPath;
        this.reporter = reporter;
        this.userAgent = `Terraform-VSCode/${extensionVersion} VSCode/${vscode.version}`;
    }
    getRequiredVersionRelease(versionString) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const release = yield js_releases_1.getRelease("terraform-ls", versionString, this.userAgent);
                console.log(`Found Terraform language server version ${release.version} which satisfies range '${versionString}'`);
                return release;
            }
            catch (err) {
                if (versionString == exports.defaultVersionString) {
                    throw err;
                }
                console.log(`Error while finding Terraform language server release which satisfies range '${versionString}' and will reattempt with '${exports.defaultVersionString}': ${err}`);
                vscode.window.showWarningMessage(`No version matching ${versionString} found, searching for ${exports.defaultVersionString} instead`);
            }
            // Attempt to find the latest release
            const release = yield js_releases_1.getRelease("terraform-ls", exports.defaultVersionString, this.userAgent);
            console.log(`Found Default Terraform language server version ${release.version} which satisfies range '${exports.defaultVersionString}'`);
            return release;
        });
    }
    needsInstall(requiredVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            // Silently default to latest if an invalid version string is passed.
            // Actually telling the user about a bad string is left to the main extension code instead of here
            const versionString = isValidVersionString(requiredVersion) ? requiredVersion : exports.defaultVersionString;
            try {
                this.release = yield this.getRequiredVersionRelease(versionString);
            }
            catch (err) {
                console.log(`Error while finding Terraform language server release which satisfies range '${versionString}': ${err}`);
                // if the releases site is inaccessible, report it and skip the install
                this.reporter.sendTelemetryException(err);
                return false;
            }
            let installedVersion;
            try {
                installedVersion = yield getLsVersion(this.lsPath);
                console.log(`Currently installed Terraform language server is version '${installedVersion}`);
            }
            catch (err) {
                // Most of the time, getLsVersion will produce "ENOENT: no such file or directory"
                // on a fresh installation (unlike upgrade). It’s also possible that the file or directory
                // is inaccessible for some other reason, but we catch that separately.
                if (err.code !== 'ENOENT') {
                    this.reporter.sendTelemetryException(err);
                    throw err;
                }
                return true; // yes to new install
            }
            this.reporter.sendTelemetryEvent('foundLsInstalled', { terraformLsVersion: installedVersion });
            if (semver.eq(this.release.version, installedVersion, { includePrerelease: true })) {
                // Already at the specified version
                return false;
            }
            else if (semver.gt(this.release.version, installedVersion, { includePrerelease: true })) {
                // Upgrade
                const selected = yield vscode.window.showInformationMessage(`A new language server release is available: ${this.release.version}. Install now?`, 'Install', 'Cancel');
                return (selected === "Install");
            }
            else {
                // Downgrade
                const selected = yield vscode.window.showInformationMessage(`An older language server release is available: ${this.release.version}. Install now?`, 'Install', 'Cancel');
                return (selected === "Install");
            }
        });
    }
    install() {
        return __awaiter(this, void 0, void 0, function* () {
            this.reporter.sendTelemetryEvent('installingLs', { terraformLsVersion: this.release.version });
            try {
                yield this.installPkg(this.release);
            }
            catch (err) {
                vscode.window.showErrorMessage(`Unable to install terraform-ls: ${err.message}`);
                throw err;
            }
            this.showChangelog(this.release.version);
        });
    }
    installPkg(release) {
        return __awaiter(this, void 0, void 0, function* () {
            const installDir = this.lsPath.installPath();
            const destination = path.resolve(installDir, `terraform-ls_v${release.version}.zip`);
            fs.mkdirSync(installDir, { recursive: true }); // create install directory if missing
            const os = goOs();
            const arch = goArch();
            const build = release.getBuild(os, arch);
            if (!build) {
                throw new Error(`Install error: no matching terraform-ls binary for ${os}/${arch}`);
            }
            try {
                this.removeOldBinary();
            }
            catch (_a) {
                // ignore missing binary (new install)
            }
            return vscode.window.withProgress({
                cancellable: true,
                location: vscode.ProgressLocation.Notification,
                title: "Installing terraform-ls"
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                progress.report({ increment: 30 });
                yield release.download(build.url, destination, this.userAgent);
                progress.report({ increment: 30 });
                yield release.verify(destination, build.filename);
                progress.report({ increment: 30 });
                return release.unpack(installDir, destination);
            }));
        });
    }
    removeOldBinary() {
        fs.unlinkSync(this.lsPath.binPath());
    }
    cleanupZips() {
        return __awaiter(this, void 0, void 0, function* () {
            const pattern = path.resolve(this.lsPath.installPath(), 'terraform-ls*.zip');
            return del(pattern, { force: true });
        });
    }
    showChangelog(version) {
        vscode.window.showInformationMessage(`Installed terraform-ls ${version}.`, "View Changelog")
            .then(selected => {
            if (selected === "View Changelog") {
                vscode.env.openExternal(vscode.Uri.parse(`https://github.com/hashicorp/terraform-ls/releases/tag/v${version}`));
            }
        });
        return;
    }
}
exports.LanguageServerInstaller = LanguageServerInstaller;
function getLsVersion(lsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const binPath = lsPath.binPath();
        fs.accessSync(binPath, fs.constants.X_OK);
        try {
            const jsonCmd = yield utils_1.exec(binPath, ['version', '-json']);
            const jsonOutput = JSON.parse(jsonCmd.stdout);
            return jsonOutput.version;
        }
        catch (err) {
            // assume older version of LS which didn't have json flag
            if (err.status != 0) {
                const plainCmd = yield utils_1.exec(binPath, ['-version']);
                return plainCmd.stdout || plainCmd.stderr;
            }
            else {
                throw err;
            }
        }
    });
}
function goOs() {
    const platform = process.platform.toString();
    if (platform === 'win32') {
        return 'windows';
    }
    if (platform === 'sunos') {
        return 'solaris';
    }
    return platform;
}
function goArch() {
    const arch = process.arch;
    if (arch === 'ia32') {
        return '386';
    }
    if (arch === 'x64') {
        return 'amd64';
    }
    return arch;
}
//# sourceMappingURL=languageServerInstaller.js.map