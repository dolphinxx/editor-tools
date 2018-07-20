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
                        <li class="nav-item active">
                            <router-link class="nav-link" to="/">首页</router-link>
                        </li>
                        <li class="nav-item">
                            <router-link class="nav-link" to="/split">分章</router-link>
                        </li>
                        <li class="nav-item">
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
    export default {
        name: 'App'
    }
</script>

<style lang="scss">
</style>
