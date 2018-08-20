<template>
    <div class="row">
        <div id="form" class="form col-sm-6">
            <h2>分章</h2>
            <div class="form-row">
                <div class="form-group col-6">
                    <label>分章规则</label>
                    <select id="regexInput" class="form-control" v-model="regex">
                        <option v-for="option in regexList" v-bind:key="option.regex" :value="option.regex">{{option.regex}}</option>
                    </select>
                </div>
                <div class="form-group col-6">
                    <label>替换规则</label>
                    <input id="replaceInput" class="form-control" v-model="replace">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group col-6">
                    <label>选择文件</label>
                    <div class="custom-file">
                        <input type="file" class="custom-file-input" id="fileInput" v-on:change="handleFileChange">
                        <label class="custom-file-label" for="fileInput">选择</label>
                    </div>
                    <small id="show" class="form-text text-muted">{{file}}</small>
                </div>
                <div class="form-group col-6">
                    <label>文件编码</label>
                    <select id="encodingInput" class="form-control" v-model="charset">
                        <option value="GBK">GBK</option>
                        <option value="UTF-8">UTF-8</option>
                    </select>
                    <small class="form-text text-muted">如果右侧乱码，请换个编码</small>
                </div>
            </div>

            <div>
                <button class="btn btn-primary btn-sm" v-bind:disabled="!file" v-on:click="splitFile">开始分章</button>
                <button class="btn btn-success btn-sm" :disabled="!splitFinished" v-on:click="exportResult">导出结果</button>
                <button class="btn btn-default btn-sm" v-on:click="manageRegex">管理规则</button>
            </div>
        </div>
        <div id="preview" class="col-sm-6">
            <h2>预览</h2>
            <div id="previewContainer">
                <p v-if="splitFinished">共<code>{{chapters.length}}</code>章</p>
                <ul>
                    <li v-for="(chapter, index) in chapters" v-bind:key="chapter.name">
                        <span>{{chapter.name}}</span>
                        <button class="btn btn-default btn-sm" v-on:click="toggleContent(index)">{{chapter.show?'收起':'查看'}}</button>
                        <div :style="`display: ${chapter.show?'block':'hidden'};`" v-if="chapter.show" v-html="chapter.content"></div>
                    </li>
                </ul>
            </div>
        </div>
        <Modal title="管理规则" ref="modal">
            <div class="form">
                <div class="row">
                    <div class="form-group col-sm-6">
                        <label class="col-form-label">规则</label>
                        <input class="form-control" v-model="formRegex">
                    </div>
                    <div class="form-group col-sm-6">
                        <label class="col-form-label">替换</label>
                        <input class="form-control" v-model="formReplace">
                    </div>
                </div>
                <p><small><code>$0</code>=匹配到的文本</small></p>
                <p><small><code>$1-n</code>=匹配到的第n个括号内文本</small></p>
                <div class="form-group">
                    <button class="btn btn-primary" v-on:click="addRegex" :disabled="!formRegex || !formReplace">添加</button>
                </div>
            </div>
            <table class="table">
                <tr>
                    <th>规则</th>
                    <th>替换</th>
                    <th>操作</th>
                </tr>
                <tr v-for="(r, index) in regexList" v-bind:key="r.regex">
                    <td><code>{{r.regex}}</code></td>
                    <td><code>{{r.replace}}</code></td>
                    <td><button class="btn btn-danger btn-sm" v-on:click="removeRegex(index)">删除</button></td>
                </tr>
            </table>
        </Modal>
    </div>
</template>
<script>
    import Modal from "../components/Modal";
    const $ = require('jquery');
    const fs = require('fs');
    const path = require('path');
    const readline = require('readline');
    const {app, dialog} = require('electron').remote;
    import {cleanDir, getAppDir, renderArticle} from "../utils";
    import storage from "../storage";
    import {split, exportResult} from "../splitter";

    export default {
        name: 'Split',
        components: {Modal},
        watch: {
          regex: 'onRegexChange'
        },
        data() {
          return {
              regexList: [],
              chapters: [],
              file: null,
              regex: null,
              replace: null,
              charset: null,
              formRegex: '',
              formReplace: '',
              splitFinished: false
          }
        },
        beforeMount() {
          this.regexList = storage.getRegexList();
          this.regex = this.regexList[0].regex;
          this.replace = this.regexList[0].replace;
          this.charset = 'UTF-8';
        },
        mounted() {
        },
        methods: {
            onRegexChange(value) {
                this.replace = this.regexList[this.regexList.findIndex(item => item.regex === value)].replace;
            },
            handleFileChange(event) {
                if (event.target.files.length > 0) {
                    this.file = event.target.files[0].path;
                } else {
                    this.file = '';
                }
            },
            splitFile() {
               this.chapters = [];
               this.splitFinished = false;
               split(this.file, this.charset, this.regex, this.replace, result => {
                   this.splitFinished = true;
                   this.chapters = result;
               });
                // ipcRenderer.send('split-chapter', {file: this.file, charset:this.charset, regex: this.regex, replace: this.replace});
                // ipcRenderer.once('split-chapter-finished', (event, arg) => {
                //     this.splitFinished = true;
                //     this.chapters = arg;
                // });
            },
            exportResult() {
                // ipcRenderer.send('export-split-chapter-result');
                exportResult();
            },
            toggleContent(index) {
                const chapter = this.chapters[index];
                console.log(chapter.show);
                if(chapter.content) {
                    chapter.show = !chapter.show;
                } else {
                    chapter.content = renderArticle(fs.readFileSync(chapter.path, {encoding: 'UTF-8'}));
                    chapter.show = true;
                }
                this.$set(this.chapters, index, chapter);
            },
            manageRegex() {
                this.$refs.modal.show();
            },
            hide() {
                this.showRegexModal = false;
                console.log(this.showRegexModal);
            },
            addRegex() {
                this.regexList.push({regex: this.formRegex, replace: this.formReplace});
                storage.setRegexList(this.regexList);
                this.formRegex = '';
                this.formReplace = '';
            },
            removeRegex(index) {
                this.regexList.splice(index, 1);
                storage.setRegexList(this.regexList);
            }
        }
    }
</script>
<style lang="scss" scoped>
    @import "../styles/variables";
    #form {
        float: left;
        width: 400px;
        padding: 12px;
    }

    #preview {
        height: 100vh;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 12px;
    }

    #preview li {
        list-style: decimal outside;
        position: relative;
        padding: 5px 0;
    }

    #preview li button {
        position: absolute;
        right: 0;
        top: 0;
    }

    #preview li p {
        text-indent: 2em;
    }

    form {
        p {
            margin-bottom: 0.5em;
        }
    }
    .modal-body {
        overflow-x: hidden;
        overflow-y: auto;
    }
</style>