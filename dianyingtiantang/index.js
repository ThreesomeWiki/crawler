const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const escaper = require('true-html-escape');
const { promisify } = require('util');
const writeFileAsync = promisify(require('fs').writeFile);
const tiemAsync = promisify(setTimeout);

// iconv.decode('��Ӱ / ���µ�Ӱ_��һ��Ӱ����', 'gb2312');
// console.log(escaper.unescape('��Ӱ / ���µ�Ӱ_��һ��Ӱ����', 'gb2312'));
// console.log(iconv.decode('<META content="Ѹ�׵�Ӱ����,��Ӱ����" name=keywords>','gb2312'));
(async () => {
    try {
        await tiemAsync(5000);
        const html = (
            await axios.get('https://www.dytt8.net/html/gndy/dyzz/index.html', {
                headers: {
                    'accept-encoding': null,
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
                },
            })
        ).data;
        await writeFileAsync('./index.html', html, 'utf-8');
        const $ = cheerio.load(iconv.decode(html, 'gb2312'), { decodeEntities: false });
        const list = $('html').find('.co_content8 > ul > table');
        console.log(list.length);
        for (let i = 0; i < list.length; i++) {
            const title = $(list[i]).find('a').text();
            const link = $(list[i]).find('a').attr('href');
            console.log(title, link);
        }
    } catch (e) {
        console.log(e);
    }
})();
