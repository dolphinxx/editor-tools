<template>
    <div class="wrapper">
        <div class="row">
            <div class="col-sm-6">
                <div class="form-group input-group">
                    <div class="input-group-prepend"><span class="input-group-text">地址</span></div>
                    <input class="form-control" v-bind:value="url" ref="url">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" @click="refresh">刷新</button>
                        <button class="btn btn-outline-secondary" @click="navigate">确定</button>
                    </div>
                </div>
                <div class="form-group input-group">
                    <div class="input-group-prepend"><span class="input-group-text">保存目录</span></div>
                    <input class="form-control" v-model="saveDir">
                    <div class="input-group-append" @click="selectSaveDir"><button class="btn btn-outline-secondary">选择</button></div>
                </div>
                <div class="form-group">
                    <textarea class="form-control" ref="script"></textarea>
                    <button class="btn btn-default" @click="execute($refs.script.value)">运行</button>
                    <button class="btn btn-default" @click="openDevTools">调试工具</button>
                    <button class="btn btn-primary" @click="fetchTasks" :disabled="!ready">获取任务</button>
                    <button class="btn btn-primary" @click="processTasks" :disabled="!ready">下载</button>
                </div>
                <webview id="webview" :url="url" nodeintegration=""  :preload="`${staticPath}/inject.js`" disablewebsecurity plugins></webview>
            </div>
            <div class="col-sm-6">
                <ul>
                    <li v-for="(task, index) in tasks" v-bind:key="index">
                        <div class="info"><span :class="task.state">{{task.state}}</span><p>{{index + 1}}.{{task.url}}</p></div>
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
    import {decodeBase64Image} from "../utils";

    const blockingResourceTypes = ['xhr', 'other', 'stylesheet', 'subFrame'];
    const blockingPattern = /googleapis\.|google\.|facebook\./ig;

    export default {
        name: 'CrawlBook',
        data() {
            return {
                url: 'http://www.comico.com.tw/3298/3/',
                staticPath: app.__static,
                saveDir: null,
                ready: false,
                tasks: []
            }
        },
        mounted() {
            const webview = document.getElementById('webview');
            webview.addEventListener('ipc-message', (event) => {
                if (event.channel === 'loaded') {
                    alert('加载完成！');
                    this.ready = true;
                    return;
                }
                if (event.channel === 'tasks') {
                    for (let task of event.args[0]) {
                        this.tasks.push({url: task, state: 'pending'});
                    }
                    return;
                }
                if (event.channel === 'crawled') {
                    const url = event.args[0].url;
                    const buffer = decodeBase64Image(event.args[0].data);
                    const index = this.tasks.findIndex(item => item.url === url);
                    if (index === -1) {
                        return;
                    }
                    if (!buffer.type) {
                        this.tasks[index].state = 'failed';
                        this.tasks[index].error = '无法识别的类型:' + buffer.type;
                        this.$set(this.tasks, index, this.tasks[index]);
                        return;
                    }
                    const dist = path.resolve(this.saveDir, index + 1 + '.' + buffer.subtype);
                    fs.writeFile(dist, buffer.data, (err) => {
                        if (err) {
                            this.tasks[index].state = 'failed';
                            this.tasks[index].error = err.stack;
                            this.$set(this.tasks, index, this.tasks[index]);
                            return;
                        }
                        this.tasks[index].state = 'success';
                        this.tasks[index].dist = dist;
                        this.$set(this.tasks, index, this.tasks[index]);
                    });

                }
            });
            session.defaultSession.webRequest.onBeforeRequest(['*://*./*'], function (details, callback) {
                var test_url = details.url;
                // if(details.resourceType === 'image') {
                //
                // }
                if (details.webContentsId !== 3) {
                    callback({cancel: false});
                    return;
                }
                if (test_url.startsWith('chrome-devtools:')) {
                    callback({cancel: false});
                    return;
                }
                if (blockingResourceTypes.indexOf(details.resourceType) !== -1) {
                    callback({cancel: true});
                    return;
                }
                if (blockingPattern.test(test_url)) {
                    callback({cancel: true});
                    return;
                }
                callback({cancel: false})
            });
            // const attachDebugger = () => {
            //     const debug = document.getElementById('webview').getWebContents().debugger;
            //     debug.attach('1.1');
            //     debug.on('message', (event, method, params) => {
            //         if(method === 'Network.responseReceived') {
            //         console.log(event, method, params);
            //             if (/https?:\/\/comicimg\.comico\.com\.tw\/onetimecontents\/pc\/\d+\/\d+\/[a-z\-_\d]+_\d+_\d+\.jpg\?px-time=\d+&px-hash=[a-z\-_\d]+/.test(params.response.url)) {
            //                         debug.sendCommand('Network.getResponseBody', { requestId: params.requestId }, (err, data) => {
            //                             console.log(err, data);
            //                             if (err.code === undefined) {
            //                                 // XXX may check data.base64encoded boolean and decode ? Maybe not here...
            //                                 // if (data.base64encoded) ... Buffer.from(data.body, 'base64');
            //                                 // this.$store.dispatch('updateStaticSource', data.body)
            //                             }
            //                         })
            //                     }
            //         }
            //         // if (method === 'Network.responseReceived') {
            //         //     webview.reload()
            //         // }
            //         // if (method === 'Network.requestWillBeSent') {
            //         //     if (params.request.url === webview.getURL()) {
            //         //         debug.sendCommand('Network.getResponseBody', { requestId: params.requestId }, (err, data) => {
            //         //             if (err.code === undefined) {
            //         //                 // XXX may check data.base64encoded boolean and decode ? Maybe not here...
            //         //                 // if (data.base64encoded) ... Buffer.from(data.body, 'base64');
            //         //                 this.$store.dispatch('updateStaticSource', data.body)
            //         //             }
            //         //         })
            //         //     }
            //         // }
            //     });
            //     debug.sendCommand('Network.enable');
            //     webview.removeEventListener('did-start-loading', attachDebugger)
            // };
            // webview.addEventListener('did-start-loading', attachDebugger);
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
                if (!this.ready) {
                    dialog.showMessageBox({message: "网页还没有准备好", buttons: ["OK"]});
                    return;
                }
                this.execute("var result=[];$('._comicImage img.comic-image__image').each(function(){result.push($(this).attr('src'))});inject.ipcRenderer.sendToHost('tasks', result)");
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
                for (let task of this.tasks) {
                    this.execute(`inject.crawlImage('${task.url}', (data) => {inject.ipcRenderer.sendToHost('crawled', {url: '${task.url}', data})})`);
                }
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