const { imgur } = require('../config.json');
const XMLHttpRequest = require('xhr2');
module.exports = {
    name: 'hedgehog',
    cooldown: 1,
    description: 'Get an image of a random hedgehog!',
    pagable: false,
    execute(message, args) {
        getImageId();

        function getImageId() {
            const imgur_url = `https://api.imgur.com/3/gallery/search/top/${Math.floor(Math.random() * 10)}?q='hedgehog NOT sonic'`;

            const xhr = new XMLHttpRequest();

            xhr.addEventListener('load', interpretData);
        
            xhr.addEventListener('error', (e) =>  {
                message.reply('oh... oh no');
                console.log(e);
            });
        
            xhr.open('GET', imgur_url);
            xhr.setRequestHeader('Authorization', `Client-ID ${imgur.clientId}`);
            xhr.send();
        }

        function interpretData(e) {
            const xhr = e.target;
            const obj = JSON.parse(xhr.responseText);

            if(!obj.data || obj.data.length == 0) {
                getImageId();
            }
            
            const random = obj['data'][Math.floor(Math.random() * obj['data'].length)];
            let image;
            if(random['is_album']) {
                image = random['images'][Math.floor(Math.random() * random['images'].length)];
            }
            else {
                image = random;
            }

            message.reply(image['link']);
        }
    }
}