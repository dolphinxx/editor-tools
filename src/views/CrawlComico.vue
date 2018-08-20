<template>
    <div class="wrapper">
        <div class="row">
            <div class="col-sm-6">
                <div class="form-group input-group">
                    <div class="input-group-prepend"><span class="input-group-text">地址</span></div>
                    <input class="form-control" v-bind:value="url" ref="url">
                </div>
                <div class="form-group input-group">
                    <div class="input-group-prepend"><span class="input-group-text">保存目录</span></div>
                    <input class="form-control" v-model="saveDir">
                    <div class="input-group-append" @click="selectSaveDir">
                        <button class="btn btn-outline-secondary">选择</button>
                    </div>
                </div>
                <div class="form-group">
                    <textarea class="form-control" ref="script"></textarea>
                    <button class="btn btn-default" @click="execute($refs.script.value)">运行</button>
                    <button class="btn btn-default" @click="openDevTools">调试工具</button>
                    <button class="btn btn-primary" @click="fetchTasks" :disabled="fetchTasksState === 'loading'"><span v-if="fetchTasksState === 'loading'" class="fa fa-spinner fa-spin"></span>获取任务</button>
                    <button class="btn btn-primary" @click="processTasks" :disabled="downloadTasksState === 'loading'"><span v-if="downloadTasksState === 'loading'" class="fa fa-spinner fa-spin"></span>下载</button>
                </div>
            </div>
            <div class="col-sm-6">
                <ul>
                    <li v-for="(task, index) in tasks" v-bind:key="index">
                        <div class="info"><span :class="task.state">{{task.state}}</span>
                            <p>{{index + 1}}.{{task.url}}</p></div>
                        <div class="preview" v-if="task.dist"><img :src="`file:///${task.dist}`"></div>
                        <div class="error" v-if="task.error">{{task.error}}</div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
    const {app, dialog, session} = require('electron').remote;
    const fs = require('fs');
    const path = require('path');
    import {decodeBase64Image, getSuffix, serial} from "../utils";
    const request = require('request');
    const Agent = require('socks5-http-client/lib/Agent');

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
        'Referer': 'http://www.comico.com.tw/3298/',
        'Host': 'www.comico.com.tw',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    };
    const imageHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
        'Referer': 'http://www.comico.com.tw/3298/',
        'Host': 'www.comico.com.tw'
    };

    export default {
        name: 'CrawlComico',
        data() {
            return {
                url: 'http://www.comico.com.tw/3298/3/',
                staticPath: app.__static,
                saveDir: null,
                tasks: [],
                fetchTasksState: '',
                downloadTasksState: ''
            }
        },
        mounted() {
        },
        methods: {
            refresh() {
                document.getElementById('webview').reload();
                this.ready = false;
            },
            navigate() {
                this.url = this.$refs.url.value;
                document.getElementById('webview').loadURL(this.url);
                this.ready = false;
            },
            execute(script) {
                document.getElementById('webview').send('script', script);
            },
            fetchTasks() {
                this.tasks = [];
                this.fetchTasksState = 'loading';
                imageHeaders.Referer = this.url;
                request.get({
                    url: this.url,
                    headers: headers,
                    withCredentials: true,
                    encoding: null,
                    gzip: true,
                    timeout: 10000,
                    agentClass: Agent,
                    agentOptions: {
                        socksHost: 'localhost',
                        socksPort: 1080
                    }
                }, (error, response, body) => {
                    console.log(response);
                    this.fetchTasksState = '';
                    if(error) {
                        dialog.showErrorBox("请求失败！", JSON.stringify(error));
                        return;
                    }
                    const contentType = response.headers['content-type'];
                    let charset = 'utf-8';
                    if(contentType) {
                        const index = contentType.lastIndexOf('charset=');
                        if(index !== -1) {
                            charset = contentType.substring(index + 8).trim();
                        }
                    }
                    let html = body.toString(charset);
                    // console.log(html);
                    const matches = html.match(/\},\s*imageData:(\[[^\]]+\])\s*\};/);
                    if(matches.length !== 2) {
                        dialog.showErrorBox("异常内容", '');
                        return;
                    }
                    let data = matches[1];
                    data = data.replace(/\s/g, '').replace(/'/g, '"');
                    console.log(data);
                    for(let task of JSON.parse(data)) {
                        this.tasks.push({url: task, state: 'pending'});
                    }
                });
            },
            processTasks() {
                if (!this.saveDir) {
                    // dialog.showMessageBox({message: "请先选择保存目录", buttons: ["OK"]});
                    this.selectSaveDir(() => this._doProcessTasks());
                    return;
                }
                this._doProcessTasks();
            },
            _doProcessTasks() {
                this.downloadTasksState = 'loading';
                let finished = 0;
                // for(let i = 0;i < this.tasks.length;i++) {
                //     const task = this.tasks[i];
                //     const dist = path.resolve(this.saveDir, i + 1 + '.' + getSuffix(task.url));
                //     this.downloadImage(task.url, dist, () => {
                //         finished++;
                //         if(finished === this.tasks.length) {
                //             this.downloadTasksState = '';
                //         }
                //     });
                // }
                const tasks = [];
                for(let task of this.tasks) {
                    tasks.push(task.url);
                }
                serial(tasks, 0, (task, index, cb) => {
                    const dist = path.resolve(this.saveDir, index + 1 + '.' + getSuffix(task));
                    this.downloadImage(task, dist, cb);
                }, () => {
                    this.downloadTasksState = '';
                    dialog.showMessageBox({message: "下载完成", buttons: ["OK"]});
                });
            },
            downloadImage(url, dist, callback) {
                const index = this.tasks.findIndex(item => item.url === url);
                if (index === -1) {
                    dialog.showErrorBox("找不到任务！", url);
                    return;
                }
                const task = this.tasks[index];
                task.state = 'loading';
                this.$set(this.tasks, index, task);
                imageHeaders.Referer = this.url;
                request.get({
                    url: url,
                    timeout: 10000,
                    encoding: null,
                    agentClass: Agent,
                    agentOptions: {
                        socksHost: 'localhost',
                        socksPort: 1080
                    }
                }, (error, response, body) => {
                    this.fetchTasksState = '';
                    if(error) {
                        dialog.showErrorBox("请求失败！", JSON.stringify(error));
                        task.state = 'failed';
                        task.error = JSON.stringify(error);
                        this.$set(this.tasks, index, task);
                        if(callback) {
                            callback();
                        }
                        return;
                    }
                    console.log(url, response);
                    fs.writeFile(dist, body, (err) => {
                        if (err) {
                            task.state = 'failed';
                            task.error = err.stack;
                            this.$set(this.tasks, index, task);
                            if(callback) {
                                callback();
                            }
                            return;
                        }
                        task.state = 'success';
                        task.dist = dist;
                        this.$set(this.tasks, index, task);
                        if(callback) {
                            callback();
                        }
                    });
                });
            },
            openDevTools() {
                document.getElementById('webview').openDevTools();
            },
            selectSaveDir(callback) {
                dialog.showOpenDialog({properties: ['openDirectory']}, (fileNames) => {
                    if (fileNames.length === 0) {
                        return;
                    }
                    this.saveDir = fileNames[0];
                    if (callback) {
                        callback();
                    }
                });
            }
        }
    }
</script>
<style lang="scss" scoped>
    @import '../styles/variables';

    .wrapper {
        padding-top: 20px;
        background-color: $white;
    }

    webview {
        border: 1px solid red;
        width: 100%;
    }

    li {
        display: block;
        list-style: none;
        margin-bottom: 1rem;
        padding-right: 1rem;
        .info {
            @include clearfix;
            display: block;
            line-height: 1em;
            p {
                text-overflow: ellipsis;
                word-break: keep-all;
                white-space: nowrap;
                overflow: hidden;
            }
            span {
                float: right;
                margin-left: 1rem;
                &.success {
                    color: $success;
                }
                &.failed {
                    color: $danger;
                }
            }
        }
        .preview {
            height: 50px;
            img {
                max-width: 100%;
                max-height: 100%;
            }
        }
        .error {
            color: $danger;
        }
    }
</style>