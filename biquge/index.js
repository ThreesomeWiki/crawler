const axios = require('axios');
const cheerio = require('cheerio');
const { promisify } = require('util');
const path = require('path');
const timeAsync = promisify(setTimeout);
const writeFileAsync = promisify(require('fs').writeFile);
const stat = promisify(require('fs').stat);
const makeDir = promisify(require('fs').mkdir);

const config = {
    headers: {
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
    },
};

(async () => {
    try {
        await timeAsync(5000);
        const indexPage = await axios.get('https://www.biquge.com.cn/book/7574/', config);
        const $ = cheerio.load(indexPage.data);
        const title = $('html').find('dt').text().replace(/ /g, '');
        console.log('title:', title);
        const exitDir = await stat(path.resolve(__dirname, `./article/${title}`)).catch(() => '');
        if (!exitDir) {
            await makeDir(path.resolve(__dirname, `./article/${title}`));
        }
        const list = $('html').find('#list > dl > dd');
        console.log(list.length);
        for (let i = 0; i < list.length; i++) {
            const link = `https://www.biquge.com.cn${$(list[i]).find('a').attr('href')}`;
            const fileTitle = unescape($(list[i]).find('a').text().replace(/&#x/g, '%u').replace(/;/g, ''));
            console.log('file title:', fileTitle);
            const exitFile = await stat(path.resolve(__dirname, `./article/${title}/${fileTitle}`)).catch(() => '');
            if (!exitFile) {
                try {
                    await timeAsync(8000);
                    const file = await axios.get(link, config);
                    const $ = cheerio.load(file.data);
                    const content = $('html').find('#content').text();
                    await writeFileAsync(path.resolve(__dirname, `./article/${title}/${fileTitle}`), content, 'utf-8');
                    console.log('write success!');
                } catch (e) {}
            }
        }
    } catch (e) {
        console.log(e);
    }
})();
