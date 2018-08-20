import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Split from './views/Split.vue'
import CrawlBook from './views/CrawlBook.vue'
import CrawlComico from './views/CrawlComico.vue'

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/about',
            name: 'about',
            component: About
        },
        {
            path: '/split',
            name: 'split',
            component: Split
        },
        {
            path: '/crawl/book',
            name: 'crawlBook',
            component: CrawlBook
        },
        {
            path: '/crawl/comico',
            name: 'crawlComico',
            component: CrawlComico
        }
    ]
})
