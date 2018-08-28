import {cleanDir, getAppDir} from "./utils";
import readline from "readline";
import fs from "fs";
import * as path from "path";

const {dialog} = require("electron").remote;
import archiver from "archiver";
const splitDir = getAppDir("split");

export function split(file: string, charset: string, regex: string, replacement: string, callback: Function) {
    cleanDir(splitDir);
    const result: Array<any> = [];
    let buff: Array<any> = [];
    let chapterName: string | null = null;
    const regExp = new RegExp(regex);
    if (replacement === '') {
        replacement = '$0';
    }

    const lineReader = readline.createInterface({
        input: fs.createReadStream(file, {encoding: charset})
    });
    lineReader.on('line', line => {
        line = line.trim();
        if (line.length === 0) {
            return;
        }
        const match = regExp.exec(line);
        if (match !== null) {
            let name = replacement.replace(/\$(\d+)/g, function (m, p1) {
                return match[parseInt(p1)];
            });
            if (buff.length > 0) {
                const dist = path.resolve(splitDir, result.length + 1 + '.' + chapterName + '.txt');
                fs.writeFileSync(dist, buff.join('\n'), {encoding: 'UTF-8'});
                result.push({name: chapterName, path: dist});
                buff = [];
            } else if (chapterName != null) {
                // 空章
                result.push({name: chapterName, dist: null});
            }
            chapterName = name;
        } else {
            buff.push(line);
        }
    });
    lineReader.on('close', () => {
        if (buff.length > 0) {
            const dist = path.resolve(splitDir, result.length + 1 + '.' + chapterName + '.txt');
            fs.writeFileSync(dist, buff.join('\n'), {encoding: 'UTF-8'});
            result.push({name: chapterName, path: dist});
            buff = [];
        }
        callback(result);
    });
}

export function exportResult() {
    dialog.showSaveDialog({filters: [{name: 'zip', extensions: ['zip']}]}, function (fileName) {
        if (fileName === undefined) return;
        // const zip = new AdmZip();
        // fs.readdir(splitDir, (err: Error, files: Array<string>) => {
        //     if (err !== null) {
        //         dialog.showErrorBox("出错了！", err.message);
        //         return;
        //     }
        //     if (files.length === 0) {
        //         dialog.showMessageBox({message: "没有文件可导出！", buttons: ["OK"]});
        //         return;
        //     }
        //     console.log(files);
        //     for (let file of files) {
        //         zip.addLocalFile(path.resolve(splitDir, file));
        //     }
        //     zip.writeZip(fileName);
        //     dialog.showMessageBox({message: "导出成功！", buttons: ["OK"]});
        // });
        const output = fs.createWriteStream(fileName);
        const archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });
        output.on('close', function () {
            dialog.showMessageBox({message: "保存成功！ :-)", buttons: ["OK"]});
        });
        archive.on('error', function (err:Error) {
            dialog.showErrorBox("出错了！", err.message);
        });
        archive.pipe(output);
        archive.directory(splitDir, false);
        archive.finalize();
    });
}