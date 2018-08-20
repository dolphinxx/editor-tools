<template>
    <div id="app">
        <div>
            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <a class="navbar-brand" href="#">Navbar</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item" :class="$route.name === 'home'?'active':''">
                            <router-link class="nav-link" to="/">首页</router-link>
                        </li>
                        <li class="nav-item" :class="$route.name === 'split'?'active':''">
                            <router-link class="nav-link" to="/split">分章</router-link>
                        </li>
                        <li class="nav-item" :class="$route.name === 'crawlBook'?'active':''">
                            <router-link class="nav-link" to="/crawl/book">爬书</router-link>
                        </li>
                        <li class="nav-item" :class="$route.name === 'crawlComico'?'active':''">
                            <router-link class="nav-link" to="/crawl/comico">Comico爬虫</router-link>
                        </li>
                        <li class="nav-item" :class="$route.name === 'about'?'active':''">
                            <router-link class="nav-link" to="/about">关于</router-link>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
        <router-view/>
    </div>
</template>
<script>
    const {app} = require('electron').remote;
    // const messageEventListener = (event) => {
    //     if(window.ipcMessageEventHandler) {
    //         window.ipcMessageEventHandler(event);
    //         return;
    //     }
    //     console.log('event not catch!', event);
    // };
    export default {
        name: 'App',
        // data() {
        //     return {
        //         staticPath: app.__static
        //     }
        // },
        // beforeDestroy() {
        //     document.getElementById('webview').removeEventListener('ipc-message', messageEventListener);
        // },
        mounted() {
            // const webview = document.getElementById('webview');
            // webview.addEventListener('ipc-message', messageEventListener);
            // window.addEventListener('beforeunload', ()=>{
            //     console.log('unload');
            //     webview.removeEventListener('ipc-message', messageEventListener);
            // });
        }
    }
</script>

<style lang="scss">
</style>
