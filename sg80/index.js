const request = require('request-promise');
const cheerio = require('cheerio');
const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36";
const baseurl = 'http://www.sg80.com';
async function getList(page) {
    try {
        let url = `http://www.sg80.com/type/1/${page}.html`;
        let rep = await request.get({
            url: url,
            header: {
                'User-Agent': ua
            }
        });
        if (rep) {
            await getDetail(rep);
        }
    } catch (e) {
        console.log('-------list error --------', e);
    }
}
/**
 * id
 * titel 标题
 * cover 图片
 * grade 分数
 * update_time 跟新日期
 * direct 导演
 * act 主演
 * type 类型
 * country 国家
 * intorduce 介绍
*/
async function getDetail(rep) {
    try {
        let $ = cheerio.load(rep, { decodeEntities: false });
        let list = $('html').find('.movie-item') || [];
        if (!list.length) return;
        for (let i = 0; i < list.length; i++) {
            let ret = {};
            let v = $(list[i]);
            ret.id = v.find('a').attr('href') && v.find('a').attr('href').match(/\d+/)[0] - 0;
            ret.title = v.find('img').attr('title');
            ret.cover = v.find('img').attr('src');
            ret.grade = v.find('.meta a').next().text() && v.find('.meta a').next().text().match(/\d+(\.\d+)?/)[0];
            ret.update_time = v.find('.meta div[class="otherinfo"]').text().replace(/更新时间：/, '').trim();
            if (!ret.id) continue;
            let href = baseurl + v.find('a').attr('href');
            try {
                let detail = await request.get({
                    url: href,
                    header: {
                        'User-Agent': ua
                    }
                });
                if (detail) {
                    let $_1 = cheerio.load(detail, { decodeEntities: false });
                    let about = $_1('html').find('.table.table-striped.table-condensed.table-bordered');
                    let userinfo = about.find('tbody tr');
                    for (let i = 0; i < userinfo.length; i++) {
                        try {
                            i == 0 && (ret.direct = $_1(userinfo[i]).text().replace(/\n/g, '').trim().split('    ')[1]);
                            i == 1 && (ret.act = $_1(userinfo[i]).text().replace(/\n/g, '').trim().split('    ')[1]);
                            i == 2 && (ret.type = $_1(userinfo[i]).text().replace(/\n/g, '').trim().split('    ')[1]);
                            i == 3 && (ret.country = $_1(userinfo[i]).text().replace(/\n/g, '').trim().split('    ')[1]);
                        } catch (e) {
                            console.log('-------detail userinfo  error s------')
                        }
                    }
                    ret.summary = $_1('html').find('.summary').text().trim();
                    let play_url = baseurl + $_1('html').find('.online-button a').attr('href');
                    if (!play_url) continue;
                    try {
                        let video_detail = await request.get({
                            url: play_url,
                            header: {
                                'User-Agent': ua
                            }
                        });
                        if (video_detail) {
                            let $_2 = cheerio.load(video_detail, { decodeEntities: false });
                            ret.video = $_2('html').find('iframe').attr('src');
                        }
                    } catch (e) {
                        continue;
                    }
                }
            } catch (e) {
                console.log('---------detail ---- detail-------error', e);
                continue;
            }
            /*提交ret*/
            console.log(ret);
        }
    } catch (e) {
        console.log('--------detail error-------', e);
    }
}
(async () => {
    for (let i = 1; i < 2; i++) {
        await getList(i);
    }
})();
