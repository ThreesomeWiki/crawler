# coding=utf-8
import requests
from pyquery import PyQuery as pq
import json
import time
import random
import urllib
# 常量
CONST = {
    'UA': {
        'PC':
        '',
        'MOBILE':
        "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Mobile Safari/537.36"
    },
    'COOKIE': {
        'PC':
        '',
        'MOBILE':
        '_tuicool_session=BAh7CUkiD3Nlc3Npb25faWQGOgZFVEkiJTA5MjBlMWE4OGJkMTg4YWEzZTk0NTU3YTMxOWI1ZTM1BjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMUV2SzRSYjNTZ0VlYmRzTDNIMGRhTE5ic1VuWDZOUUlnRVd4SnRpMEdsVmM9BjsARkkiDHVzZXJfaWQGOwBGaQPb0gNJIg5yZXR1cm5fdG8GOwBGSSItaHR0cHM6Ly93d3cudHVpY29vbC5jb20vYXJ0aWNsZXMvck03QlpmUQY7AFQ%3D--19e3a5aa32840bf0ea2e676e5549c64a7939e259; domain=.tuicool.com; path=/; expires=Sun, 03 May 2020 05:33:40 -0000; HttpOnly'
    }
}

# task 列表
tasks = {
    '阮一峰': 46,
    'Swoole': 14,
    'ci': 15,
    'lua': 16,
    'go': 17,
    'TensorFlow': 21,
    'caffe': 22,
    '大数据': 23,
    'python': 19,
    'Django': 20,
    'Linux': 26,
    'Mac': 28,
    '算法': 31,
    'IOS': 35,
    'Git': 29,
    'Flutter': 38,
    'dart': 39,
    'Express': 40,
    'koa': 41,
    'Electron': 42,
    'nest': 44,
    '分布式': 45,
    'web': 2,
    'angular': 3,
    'react': 4,
    'vue': 5,
    'reactnative': 6,
    'ionic': 7,
    'android': 8,
    'node': 9,
    'java': 10,
    'php': 11,
    'laravel': 12,
    'Symfony': 13,
    'c++': 18,
}


# 获取列表
def getList(tag, tagid):
    try:
        # rep = requests.get(
        #     'https://www.tuicool.com/search?kw=' + tag,
        #     headers={
        #         'user-agent': CONST['UA']['MOBILE'],
        #         'cookie': CONST['COOKIE']['MOBILE']
        #     })
        rep = proxy('https://www.tuicool.com/search?kw=' + urllib.quote(tag))
        if (rep and rep.status_code == 200):
            html = pq(rep.text)('html')
            article_list = html.find('#list_article > .article')
            for i in article_list:
                article = html(i)
                item = {
                    'title': article.find('.has-image > a').text(),
                    'tag_id': tagid,
                    'date': article.find('time').text(),
                    'user_id': 0,
                    'user': '',
                    'view': 0,
                    'is_other': 1
                }
                user = {
                    'name': article.find('.source').text(),
                    'avatar': article.find('img').attr('src')
                }
                detail_url = 'https://www.tuicool.com' + \
                    article.find('.has-image > a').attr('href')
                detail = getDetail(detail_url)
                if (detail):
                    item['md'] = detail
                    print(item)
                    print(user)
                time.sleep(5)
        else:
            print('get list not 200', rep)
    except Exception, e:
        print('----getlist error----', e)


# 获取详情
def getDetail(url):
    try:
        # rep = requests.get(
        #     url,
        #     headers={
        #         'user-agent': CONST['UA']['MOBILE'],
        #         'cookie': CONST['COOKIE']['MOBILE']
        #     })
        time.sleep(3)
        rep = proxy(url)
        if (rep and rep.status_code == 200):
            html = pq(rep.text)('html')
            detail = html.find('.article_body').html()
            return detail
        else:
            print('get list not 200', rep)
            return ''
    except Exception, e:
        print('----getdetail error----', e)
        return ''


# run
def run():
    for i in tasks:
        getList(i, tasks[i])
        time.sleep(10)


# 代理
def proxy(url, count=0):
    try:
        if (count > 5):
            return ''
        seq = random.randint(1, 99)
        headers = {'Content-Type': 'application/json'}
        ret = requests.post(
            'http://xxxxxxxxxx',
            headers=headers,
            data=json.dumps({
                'token': 'test',
                'url': url,
                'headers': {
                    # 'method': 'GET',
                    'User-Agent': CONST['UA']['MOBILE'],
                    'cookie': CONST['COOKIE']['MOBILE']
                },
                'seq': seq
            }))
        if (ret.status_code == 200):
            return ret
        else:
            return ''
    except Exception, e:
        print('-------proxy err-------', e)
        proxy(url, int(count) + 1)


# init
run()
