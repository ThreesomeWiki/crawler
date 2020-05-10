const axios = require('axios');
const cheerio = require('cheerio');
const { promisify } = require('util');
const timeAsync = promisify(setTimeout);

(async () => {
    try {
        const html = (await axios.get('https://fulibus.net/page/1')).data;
        const $ = cheerio.load(html);
        const list = $('html').find('.excerpt');
        const ret = [];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            ret.push({
                image: $(item).find('img').attr('data-src'),
                user: $(item).find('.cat').text(),
                title: $(item).find('h2').text(),
                date: $(item).find('time').text(),
                zan: $(item).find('.post-like > span').text(),
                note: $(item).find('.note').text(),
                link: $(item).find('.focus').attr('href'),
            });
        }
        for (let i = 0; i < ret.length; i++) {
            const item = ret[i];
            await timeAsync(5000);
            console.log('end wait');
            const html = (await axios.get(item.link)).data;
            const $ = cheerio.load(html);
            const content = $('html').find('.article-content').text();
            const imgs = $('html').find('.article-content > p > img');
            const imgsArr = [];
            for (let j = 0; j < imgs.length; j++) {
                imgsArr.push($(imgs[j]).attr('src'));
            }
            console.log(imgsArr);
            item.content = {
                text: content,
                imgs: imgsArr.join(','),
            };
        }
        console.log(ret);
    } catch (e) {
        console.log(e);
    }
})();
