const { downloadImage, timeAsync, get } = require('../util');
const cheerio = require('cheerio');
const path = require('path');

(async () => {
    await timeAsync(5000);
    console.log('wait end');
    const page = await get('https://www.38te.com/cartoon/1288');
    const $ = cheerio.load(page.data);
    const list = $('html').find('#detail-list-select > li');
    for (let i = 0; i < list.length; i++) {
        const secondPageUrl = 'https://www.38te.com' + $(list[i]).find('a').attr('href');
        await timeAsync(4000);
        console.log('wait end');
        const secondPage = await get(secondPageUrl);
        const $1 = cheerio.load(secondPage.data);
        const images = $1('html').find('.comicpage > div > img');
        for (let j = 0; j < images.length; j++) {
            const imageUrl = $1(images[j]).attr('data-original');
            const imageName = imageUrl.split('/').reverse()[0];
            await timeAsync(5000);
            console.log('wait end');
            await downloadImage(imageUrl, path.resolve(__dirname, `../image/${imageName}`));
        }
    }
})();
