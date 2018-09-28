const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const { execSync } = require('child_process');
const { promisify } = require('util');

const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
const sleep = promisify(setTimeout);

const base_url = 'https://www.585ii.com';
/*防止IP失效*/
const base_ip = '104.27.160.152';
const task = {
    '自拍偷拍': '自拍偷拍',
    '亚洲色图': '亚洲色图',
    '欧美色图': '欧美色图',
    '美腿丝袜': '欧美色图',
    '清纯唯美': '清纯唯美',
    '乱伦熟女': '乱伦熟女',
    '卡通动漫': '卡通动漫'
};
(async () => {
    for (let i in task) {
        try {
            for (let page = 1; page < 2; page++) {
                await getList(task[i], page);
            }
        } catch (e) {
            console.log(e);
        }
    }
})();
async function getList(key, page) {
    try {
        let url = `${base_url}/tupian/list-${encodeURI(key)}-${page}.html`;
        console.log(url)
        let ret = await request.get({
            url: url,
            header: {
                'User-Agent': ua
            }
        });
        if (!ret) return;
        let $ = cheerio.load(ret, { decodeEntities: false });
        let list = $('#tpl-img-content li');
        if (!list || !list.length) return;
        for (let i = 0; i < list.length; i++) {
            let v = $(list[i]);
            let detail_url = v.find('a').attr('href');
            let detail_html = await request.get({
                url: `${base_url}${detail_url}`,
                header: {
                    'User-Agent': ua
                }
            });
            let detail_img = [];
            if (detail_html) {
                let $_detail = cheerio.load(detail_html, { decodeEntities: false });
                let imgs = $_detail('.content').find('img');
                for (let j = 0; j < imgs.length; j++) {
                    if ($_detail(imgs[j]).attr('data-original')) {
                        detail_img.push($_detail(imgs[j]).attr('data-original'));
                    }
                }
            }
            let item = {
                title: v.find('h3').text(),
                cover: v.find('img').attr('data-original'),
                create_time: v.find('.down_date.c_red').text().trim(),
                detail_img: detail_img.join(',')
            };
            await downloadimg(item.cover, key);
            await downloadimg(item.detail_img, key);
            console.log(item)
        }
    } catch (e) {
        console.log('get list error')
    }
}


async function downloadimg(urls, dirname) {
    let url_arr = urls.split(',');
    for (let i = 0; i < url_arr.length; i++) {
        /*检测img文件夹是否存在*/
        let exit_img = fs.existsSync(path.join(__dirname, './img'));
        !exit_img && (execSync('mkdir img'));
        /*检测dirname是否存在*/
        let exit_dirname = fs.existsSync(path.join(__dirname, `./img/${dirname}`));
        !exit_dirname && (execSync(`cd img && mkdir ${dirname}`));
        /*文件名*/
        let file_name = md5(url_arr[i]);
        /*查看文件是否存在*/
        let exit_png = fs.existsSync(path.join(__dirname, `./img/${dirname}/${file_name}.jpg`));
        if (exit_png) return;
        /*创建文件*/
        await request.get(url_arr[i]).pipe(fs.createWriteStream(path.join(__dirname, `./img/${dirname}/${file_name}.jpg`)));
        /*暂停2s*/
        sleep(2000);
    }
}