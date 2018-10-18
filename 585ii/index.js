const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const { execSync } = require('child_process');
const { promisify } = require('util');

const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
const sleep = promisify(setTimeout);

const base_url = 'https://xxxxxxx';
/*防止IP失效*/
const task = {
    img: {
        '清纯唯美': '清纯唯美',
        '乱伦熟女': '乱伦熟女',
        '卡通动漫': '卡通动漫',
        '自拍偷拍': '自拍偷拍',
        '亚洲色图': '亚洲色图',
        '欧美色图': '欧美色图',
        '美腿丝袜': '欧美色图',
    },
    xiaoshuo: {
        '都市激情': '都市激情',
        '人妻交换': '人妻交换',
        '校园春色': '校园春色',
        '家庭乱伦': '家庭乱伦',
        '情色笑话': '情色笑话',
        '性爱技巧': '性爱技巧',
        '武侠古典': '武侠古典',
        '另类小说': '另类小说'
    },
    shipin: {
        '短视频': '短视频',
        '中文字幕': '中文字幕',
        '亚洲无码': '亚洲无码',
        '欧美精品': '欧美精品',
        '成人动漫': '成人动漫'
    }
};
(async () => {
    if (false) {
        for (let i in task) {
            for (let j in task[i]) {
                try {
                    for (let page = 1; page < 2; page++) {
                        await getList(task[i][j], i, page);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
    } else {
        /*测试*/
        await getList('短视频', 'shipin', 1);
    }
})();

async function getList(key, type, page) {
    try {
        let url = '';
        if (type == 'img') {
            url = `${base_url}/tupian/list-${encodeURI(key)}-${page}.html`;
        } else if (type == 'xiaoshuo') {
            url = `${base_url}/xiaoshuo/list-${encodeURI(key)}-${page}.html`;
        } else if (type == 'shipin') {
            url = `${base_url}/shipin/list-${encodeURI(key)}-${page}.html`;
        }
        let ret = await request.get({
            url: url,
            headers: {
                'User-Agent': ua
            }
        });
        if (!ret) return;
        let $ = cheerio.load(ret, { decodeEntities: false });
        /*图片*/
        if (type == 'img') {
            let list = $('#tpl-img-content li');
            if (!list || !list.length) return;
            for (let i = 0; i < list.length; i++) {
                let v = $(list[i]);
                let detail_url = v.find('a').attr('href');
                let detail_html = await request.get({
                    url: `${base_url}${detail_url}`,
                    headers: {
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
                await downloadimg(item.cover, type, key);
                await downloadimg(item.detail_img, type, key);
                console.log(item)
            }
        } else if (type == 'xiaoshuo') {
            /*小说*/
            let list = $('.box.list.channel.list-text-my ul li');
            for (let i = 0; i < list.length; i++) {
                let v = $(list[i]);
                let is_list = v.find('a').attr('href') && v.find('a').attr('href').indexOf('xiaoshuo') > -1;
                if (is_list) {
                    let content_url = base_url + v.find('a').attr('href');
                    let content_html = await request.get({
                        url: `${content_url}`,
                        headers: {
                            'User-Agent': ua
                        }
                    });
                    if (content_html) {
                        let content_$ = cheerio.load(content_html, { decodeEntities: false });
                        let content_txt = content_$('.content').html();
                        let ret = {
                            title: v.find('a').attr('title'),
                            create_time: v.find('a span').text(),
                            content: content_txt,
                            tag: [type, key],
                            is_xiaoshuo: 1
                        };
                    }
                }
            }
        } else if (type == 'shipin') {
            /*视频*/
            let list = $('#grid li');
            for (let i = 0; i < list.length; i++) {
                let v = $(list[i]);
                let video_url = base_url + v.find('a').attr('href');
                let video_detail = await request.get({
                    url: video_url,
                    headers: {
                        'User-Agent': ua
                    }
                });
                if (video_detail) {
                    let video_detail_$ = cheerio.load(video_detail, { decodeEntities: false });
                    let video_url = video_detail_$('#lin1k0').attr('data-clipboard-text');
                    let ret = {
                        title: v.find('a').attr('title'),
                        cover: v.find('a img').attr('src'),
                        video: video_url
                    };
                    console.log(ret);
                }
            }
        }
    } catch (e) {
        console.log('get list error', e)
    }
}


async function downloadimg(urls, type, dirname) {
    let url_arr = urls.split(',');
    for (let i = 0; i < url_arr.length; i++) {
        /*检测img文件夹是否存在*/
        let exit_img = fs.existsSync(path.join(__dirname, `./${type}`));
        !exit_img && (execSync('mkdir img'));
        /*检测dirname是否存在*/
        let exit_dirname = fs.existsSync(path.join(__dirname, `./${type}/${dirname}`));
        !exit_dirname && (execSync(`cd img && mkdir ${dirname}`));
        /*文件名*/
        let file_name = md5(url_arr[i]);
        /*查看文件是否存在*/
        let exit_png = fs.existsSync(path.join(__dirname, `./${type}/${dirname}/${file_name}.jpg`));
        if (exit_png) return;
        /*创建文件*/
        await request.get(url_arr[i]).pipe(fs.createWriteStream(path.join(__dirname, `./${type}/${dirname}/${file_name}.jpg`)));
        /*暂停2s*/
        sleep(2000);
    }
}
