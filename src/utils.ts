const fs = require("fs");
const path = require("path");
const {app} = require('electron').remote;

export function removeDir(dir: String) {
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
        fs.rmdirSync(dir);
        return;
    }
    files.forEach((file: String) => {
        const f = path.resolve(dir, file);
        const stat = fs.statSync(f);
        if (stat.isFile()) {
            fs.unlinkSync(f);
        } else {
            removeDir(f);
        }
    });
}

export function cleanDir(dir: String) {
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
        return;
    }
    files.forEach((file: String) => {
        const f = path.resolve(dir, file);
        const stat = fs.statSync(f);
        if (stat.isFile()) {
            fs.unlinkSync(f);
        } else {
            removeDir(f);
        }
    });
}

export function getAppDir(subDirectory?: String) {
    const appDir = app.getPath('userData');
    try {
        fs.statSync(appDir);
    } catch (e) {
        fs.mkdirSync(appDir);
    }

    if (!subDirectory) {
        return appDir;
    }
    const subDir = path.resolve(appDir, subDirectory);
    try {
        fs.statSync(subDir)
    } catch (e) {
        fs.mkdirSync(subDir);
    }
    return subDir;
}

export function renderArticle(raw: String): String {
    return '<p>' + raw.replace(/\n/g, '</p><p>') + '</p>';
}
