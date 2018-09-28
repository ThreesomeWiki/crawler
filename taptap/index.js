const request = require('request-promise');
const cheerio = require('cheerio');
const DEBUG = 0;
const BASE_URL = DEBUG ? 'http://localhost/' : 'http://localhost:8080/';
const UA = {
    mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
    pc: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
};
const CHANNELS = {
    'toptop': {
        '策略': '策略',
        '动作': '动作',
        '竞速': '竞速',
        '模拟': '模拟',
        '益智': '益智',
        '往期专题': '往期专题',
        '角色扮演': '角色扮演',
        '卡牌': '卡牌',
        '二次元': '二次元',
        '单机': '单机',
        '生存': '生存',
        'MOBA': 'MOBA',
        '新游预约': '新游预约',
    }
}
async function run() {
    try {
        for (let channel in CHANNELS) {
            for (let tag in CHANNELS[channel]) {
                for (let i = 1; i < 6; i++) {
                    await step1[channel](CHANNELS[channel][tag], i);
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
    /*每天自启动一次*/
    setTimeout(async () => {
        await run();
    }, 1000 * 60 * 60 * 24);
}
setTimeout(async () => {
    if (0) {
        step1.toptopdetail(58881);
        // step1.toptopcomments(58881);
    } else {
        await run();
    }
}, 100);
/*获取第三方数据*/
const step1 = {
    'toptop': async (tag, page, album_list) => {
        try {
            console.log('----------', tag, '---------' + page);
            let url = '';
            let album = ['往期专题'];
            let is_album = 0;
            /*主题处理*/
            if (album.indexOf(tag) > -1) {
                is_album = 1;
                url = 'https://api.taptapdada.com/gate/v1/rec2?from=' + (page - 1) * 20 + '&limit=20&X-UA=V%3D1%26PN%3DTapTap%26VN_CODE%3D332%26LOC%3DCN%26LANG%3Dzh_CN%26CH%3Ddefault%26UID%3Dfbf9c938-7461-42b8-b448-8ce290bb0c80';
            } else if (album_list) {
                /*主题对应的列表*/
                url = 'https://api.taptapdada.com/event/v1/detail?id=' + album_list + '&X-UA=V%3D1%26PN%3DTapTap%26VN_CODE%3D332%26LOC%3DCN%26LANG%3Dzh_CN%26CH%3Ddefault%26UID%3Dfbf9c938-7461-42b8-b448-8ce290bb0c80';
            } else {
                /*非主题处理*/
                url = 'https://api.taptapdada.com/app-tag/v1/by-tag?X-UA=V%3D1%26PN%3DTapTap%26VN_CODE%3D332%26LOC%3DCN%26LANG%3Dzh_CN%26CH%3Ddefault%26UID%3Dfbf9c938-7461-42b8-b448-8ce290bb0c80&tag=' + encodeURI(tag) + '&sort=hits&from=' + (page - 1) * 10 + '&limit=10';
            }
            let rep = await request.get({
                url: url,
                headers: {
                    'User-Agent': UA.mobile
                }
            });
            if (rep) {
                await step2.toptop(tag, page, rep, is_album, album_list);
            }
        } catch (e) {
            console.log(e);
        }
    },
    'toptopdetail': async tid => {
        try {
            let url = 'https://www.taptap.com/app/' + tid;
            let rep = await request.get({
                url: url,
                headers: {
                    'User-Agent': UA.pc
                }
            });
            if (rep) {
                await step2.toptopdetail(tid, rep);
            }
        } catch (e) {
            console.log('详情出错', e);
        }
    },
    'toptopcomments': async tid => {
        try {
            let url = 'https://api.taptapdada.com/review/v1/by-app?app_id=' + tid + '&from=0&limit=10&X-UA=V%3D1%26PN%3DTapTap%26VN_CODE%3D332%26LOC%3DCN%26LANG%3Dzh_CN%26CH%3Ddefault%26UID%3Dfbf9c938-7461-42b8-b448-8ce290bb0c80%26VID%3D23711176'
            let rep = await request.get({
                url: url,
                headers: {
                    'User-Agent': UA.mobile
                }
            });
            if (rep) {
                await step2.toptopcomments(tid, rep);
            }
        } catch (e) {
            console.log('评论出错');
        }
    }
};
/*处理第三方列表数据数据*/
const step2 = {
    'toptop': async (tag, page, rep, album, album_list) => {
        try {
            let data = JSON.parse(rep);
            if ((!album_list && data && data.data.list && data.data.list.length) ||
                (album_list && data && data.data.items && data.data.items.length)
            ) {
                let list = [];
                if (album_list) {
                    list = data.data.items;
                } else {
                    list = data.data.list;
                }
                for (let i = 0; i < list.length; i++) {
                    let v = list[i];
                    let items = {};
                    if (album) {
                        /*游戏专辑*/
                        items = {
                            title: v.title,
                            big_cover: v.banner.url,
                            album_content: v.contents.text,
                            album_id: v.id,
                            is_album: album,
                            tap_id: 0
                        };
                        console.log('专辑插入', v.title);
                        await common.sleep(1);
                        /*专辑列表插入*/
                        await API.append_list(items);
                        await common.sleep(1);
                        /*插入专辑对应的列表*/
                        await step1.toptop('', 1, v.id);
                        /*请求详情*/
                    } else {
                        /*游戏列表*/
                        if (album_list) v = v.app;
                        items = {
                            tap_id: v.id,
                            title: v.title,
                            subtitle: v.hints ? v.hints[0] : '',
                            cover: v.icon.url,
                            area: v.area,
                            android_id: v.identifier,
                            ios_id: '',
                            author: v.author,
                            android_download_url: v.uri.download_site,
                            ios_download_url: v.uri.apple,
                            android_version: '',
                            ios_version: '',
                            type: '1',
                            score: v.stat.rating.score,
                            last_score: v.stat.rating.latest_score,
                            last_version_score: v.stat.rating.latest_version_score,
                            ios_score: v.stat.rating.ios_score,
                            android_score: v.stat.rating.android_score,
                            hits_total: v.stat.hits_total,
                            play_total: v.stat.play_total,
                            reserve_count: v.stat.reserve_count,
                            reserve_total: v.stat.reserve_total,
                            bought_count: v.stat.bought_count,
                            fans_count: v.stat.fans_count,
                            review_count: v.stat.review_count,
                            topic_count: v.stat.topic_count,
                            update_date: v.update_date,
                            big_cover: v.banner ? v.banner.url : '',
                            is_album: 0,
                            album_id: album_list ? album_list : 0
                        }
                        if (album_list) {
                            console.log('专辑项', items.title);
                        }
                        console.log(v.id, items.big_cover);
                        let tags = [];
                        v.tags.forEach(v => {
                            tags.push(v.value);
                        });
                        await common.sleep(1);
                        /*数据库插入列表*/
                        await API.append_list(items, tags.join(','));
                        await common.sleep(1);
                        /*请求详情*/
                        await step1.toptopdetail(v.id);
                        await common.sleep(1);
                        /*请求评论*/
                        await step1.toptopcomments(v.id);
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    },
    'toptopdetail': async (tid, rep) => {
        try {
            let $ = cheerio.load(rep, { decodeEntities: false });
            let v = $('html');
            /**
             * 头部信息
             */
            let header = v.find('.show-main-header ');
            let cover = header.find('.header-icon-body > img').attr('src');
            let title = header.find('.main-header-text > h1').text().trim();
            let developer = header.find('.header-text-author > a[itemprop != publisher] > span[itemprop]').text().trim();
            let publisher = header.find('.header-text-author > a[itemprop = publisher] > span[itemprop]').text().trim();
            let grade = header.find('.app-rating-container > .app-rating-score').text();
            let attention = header.find('.app-rating-score[itemprop=ratingValue]').text();
            /**
             * 简介
            */
            let body = v.find('.show-main-body');
            /*对于开发者*/
            let developer_speak = body.find('#developer-speak > p').html() ? body.find('#developer-speak > p').html().trim() : '';
            /*简介*/
            let description = body.find('#description').html() ? body.find('#description').html().trim() : '';
            /*跟新内容*/
            let update_msg = body.find('#app-log').html() ? body.find('#app-log').html().trim() : '';
            /*跟新日期*/
            let update_date = body.find('.info-item-content[itemprop=datePublished]').text().trim() || '';
            update_date = update_date.match(/\d+/g);
            update_date = update_date ? update_date.join('-') : '';
            /*版本*/
            let version = body.find('.info-item-content[itemprop=softwareVersion]').text().trim() || '';
            /*size*/
            // let size = body.find('.info-item-content[itemprop=softwareVersion]').text().trim() || '';
            /**
             * 视频 && 图片
             */
            /*视频地址*/
            let video = body.find('video').attr('data-video-id');
            /*视频cover*/
            let poster = body.find('video').attr('poster');
            /*图像列表*/
            let imgs = body.find('#imageShots > li > a[data-lightbox=screenshots] > img');
            imgs = $(imgs);
            let imgs_arr = [];
            for (let i = 0; i < imgs.length; i++) {
                if ($(imgs[i]).attr('src')) {
                    imgs_arr.push($(imgs[i]).attr('src'));
                }
            }
            /*插入内容*/
            let item = {
                tid: tid,
                cover: cover,
                title: title,
                developer: developer,
                publisher: publisher,
                grade: grade,
                attention: attention,
                developer_speak: developer_speak,
                description: description,
                update_msg: update_msg,
                video: 'https://www.taptap.com/video/' + video + '/hls.m3u8',
                poster: poster,
                imgs: imgs_arr.join(','),
                update_date: update_date,
                version: version
            };
            // console.log(item);
            await API.append_detail(item);
        } catch (e) {
            console.log(e);
        }
    },
    'toptopcomments': async (tid, rep) => {
        try {
            let data = JSON.parse(rep);
            if (data && data.data && data.data.list && data.data.list.length) {
                let items = data.data.list;
                for (let i = 0; i < items.length; i++) {
                    let v = items[i];
                    let item = {
                        tap_comment_id: v.id,
                        rank: v.score,
                        zan_num: v.ups,
                        zan_down: v.downs,
                        tap_id: v.app_id,
                        content: v.contents.text,
                        update_at: v.updated_time,
                        comment_num: v.review_comments ? v.review_comments.length : 0,
                        comments: v.review_comments ? JSON.stringify(v.review_comments) : '',
                        tap_user_id: v.author.id,
                        tap_user_name: v.author.name,
                        tap_user_avatar: v.author.avatar
                    };
                    await API.append_comment(item);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}
/*api 接口*/
const API = {
    append_list: async (items, tags) => {
        try {
            /*插入游戏列表*/
            if (!items) return false;
            let url = BASE_URL + 'v1/game/insertGames';
            let rep = await request.post({
                url: url,
                form: { items: items, tags: tags }
            });
            if (rep == '1') {
                console.log('append list success', rep);
            } else {
                console.log('append list err');
            }
            console.log(rep);
        } catch (e) {
            console.log(e);
        }
    },
    append_detail: async items => {
        try {
            /*插入游戏详情*/
            if (!items) return false;
            let url = BASE_URL + 'v1/game/insertGamesdDetail';
            let rep = await request.post({
                url: url,
                form: { items: items }
            });
            if (rep == '1') {
                console.log('append detail success', rep);
            } else {
                console.log('append detail err');
            }
            console.log(rep);
        } catch (e) {
            console.log(e);
        }
    },
    append_comment: async items => {
        try {
            /*插入游戏评论*/
            if (!items) return false;
            let url = BASE_URL + 'v1/game/insertGamesdComment';
            let rep = await request.post({
                url: url,
                form: { items: items }
            });
            if (rep == '1') {
                console.log('append comment success', rep);
            } else {
                console.log('append comment err');
            }
            console.log(rep);
        } catch (e) {
            console.log(e);
        }
    },
    save_img: async url => {
        try {
            if (!url) return 0;
        } catch (e) {
            console.log(e);
        }
    }
}
/* 公共方法 */
const common = {
    /*睡眠函数*/
    sleep: async time => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve('');
            }, time * 1000);
        });
    }
}