module.exports = {
    css: {
        sourceMap: true,
        // loaderOptions: {
        //     sass: {
        //         data: `@import "@/styles/_variables.scss";`
        //     }
        // },
        modules: true,
        loaderOptions: {
            css: {
                localIdentName: '[local]'
            }
        }
    }
};