# coding=utf-8
import requests
from pyquery import PyQuery as pq
from urllib import unquote
import json
import demjson
import sys

const = {
    'pc':
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36",
    'mobile':
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    'cookie':
    'SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9W5FycSRE0dsqna-s4MW9I8K; SINAGLOBAL=2089896944840.9478.1531718871320; UM_distinctid=164f8784f486e9-0a7fc1fbd28675-163b6952-1aeaa0-164f8784f493c0; SUB=_2AkMs2y2lf8NxqwJRmP4RxGnkZIt1wgvEieKah9x-JRMxHRl-yj83qhcktRB6B1sDSqj5ArZMf8aiexeau7YZZWuXK0QA; UOR=www.guofenchaxun.com,widget.weibo.com,coolshell.cn; YF-Page-G0=074bd03ae4e08433ef66c71c2777fd84; _s_tentry=-; Apache=1771134395037.1106.1536384306117; ULV=1536384306170:9:2:3:1771134395037.1106.1536384306117:1535963493335; YF-V5-G0=35ff6d315d1a536c0891f71721feb16e; WBStorage=e8781eb7dee3fd7f|undefined',
}


# 获取网页内容
def run(url):
    try:
        items = {}
        author = {}
        detail = getDetail(url)
        if (detail):
            items = {
                'title': detail['page_info']['content2'],
                'summary': detail['text'],
                'imglink': detail['page_info']['page_pic']['url'],
                'videolink': '',
                'zan_num': 0,
                'comment_num': 0,
                'view_num': 0,
                'tags': demjson.encode([""]),
                'classid': 2,
                'status': 1,
                'source': url,
                'channel': 2,
                'tag_str': '',
                'relev_id': detail['id'],
                'attitudes_count': 0,
                'comments_count': detail['comments_count'],
                'reposts_count': 0,
            }
            author = {
                'authorid': detail['user']['id'],
                'author': detail['user']['screen_name'],
                'avatar_url': detail['user']['profile_image_url'],
                'homepage': url
            }
            video = getVideo(url)
            if (video):
                items['videolink'] = video
                print(items)
                print(author)
    except Exception, e:
        pass


# 获取详情
def getDetail(url):
    try:
        url = url.replace('weibo.com/tv/v', 'm.weibo.cn/status')
        token = url.split('?')[0].split('status/')[1]
        req_url = 'https://m.weibo.cn/statuses/show?id=' + token
        ret = requests.get(req_url, headers={'user-agent': const['mobile']})
        if (ret.status_code == 200):
            return demjson.decode(ret.text)['data']
        else:
            return ''
    except Exception, e:
        return ''


# 获取视频连接
def getVideo(url):
    try:
        res = requests.get(
            url,
            headers={
                'user-agent': const['pc'],
                'cookie': const['cookie']
            })
        if (res and res.status_code == 200):
            html = pq(res.text)('html')
            video = html.find('div[node-type="common_video_player"]').attr(
                'video-sources').split('fluency=')[1]
            video = unquote(video)
            return video
        else:
            return ''
    except Exception, e:
        return ''


run('https://weibo.com/tv/v/GyonPqTS2?fid=1034:4281968821784154')