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

const Base64Pattern = /^data:([A-Za-z-+]+)\/([A-Za-z-+]+);base64,(.+)$/;
export function decodeBase64Image(dataString) {
    const matches = dataString.match(Base64Pattern),
        response:any = {};
    if (matches.length !== 4) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.subtype = matches[2];
    response.data = new Buffer(matches[3], 'base64');

    return response;
};

export function getSuffix(url) {
    let queryIndex = url.indexOf('?');
    if(queryIndex !== -1) {
        url = url.substring(0, queryIndex);
    }
    let hashIndex = url.indexOf('#');
    if(hashIndex !== -1) {
        url = url.substring(0, hashIndex);
    }
    let dotIndex = url.lastIndexOf('.');
    if(dotIndex === -1) {
        return null;
    }
    return url.substring(dotIndex + 1);
};

export function serial(tasks, index, consumer, callback) {
    const current = tasks.shift();
    if (!current) {
        callback();
        return;
    }
    consumer(current, index, () => serial(tasks, index + 1, consumer, callback));
};