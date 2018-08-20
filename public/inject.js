const {ipcRenderer} = require('electron');
ipcRenderer.on('script', (event, message) => {
    eval(message);
});

function __serial(tasks, index, consumer, callback) {
    const current = tasks.shift();
    if (!current) {
        callback();
        return;
    }
    consumer(current, index, () => __serial(tasks, index + 1, consumer, callback));
};
window.inject = {
    ipcRenderer,
    getSuffix(url) {
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
    },
    getImageData(url, callback) {
        var image = new Image();
        image.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            let suffix = inject.getSuffix(url) || 'png';
            if(suffix === 'jpg') {
                suffix = 'jpeg';
            }
            callback(canvas.toDataURL('image/' + suffix, 1.0));
        };
        image.src = url;
    },
    crawlImage(url, callback) {
        inject.getImageData(url, (data) => {
            callback(data);
        });
    },
    crawl(tasks, callback) {
        __serial(tasks, (img, index, cb) => inject.crawlImage(img, () => {
            ipcRenderer.sendToHost('crawled', {
                url,
                data
            });
            cb();
        }), callback);
    }
};

function execute() {
    $(document).ready(function () {
        window.$ = $;
        ipcRenderer.sendToHost('loaded');
    });
}

window.onload = function () {
    // if(window.jQuery) {
    //     jQuery(function(){
    //        execute();
    //     });
    // } else {
    var script = document.createElement("script");
    script.src = "https://cdn.staticfile.org/jquery/3.3.1/jquery.slim.js";
    script.onload = script.onreadystatechange = function () {
        execute();
    };
    document.head.appendChild(script);
    // }
};