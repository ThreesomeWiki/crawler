import requests, json
import env
import random
BASE_URL = env.BASE_URL
CONST = {
    'UA': {
        'PC':
        '',
        'MOBILE':
        "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Mobile Safari/537.36"
    }
}


def getKeys():
    try:
        url = BASE_URL + 'getSearchKey'
        ret = requests.get(url)
        if ret and ret.status_code == 200:
            ret = json.loads(ret.text)
            if ret and ret['code'] == 200:
                return ret['msg']
            return ''
    except Exception as e:
        print(e)
        return ''


def insertJob(item, tag):
    try:
        url = BASE_URL + 'insertList'
        ret = requests.post(url, json={'item': item, 'tag': tag})
        if ret and ret.status_code == 200:
            ret = json.loads(ret.text)
            if ret and ret['code'] == 200:
                print('success')
            else:
                print('插入失败')
        else:
            print('服务器错误')
    except Exception as e:
        print(e)
        return ''


# 代理
def proxy(url, count=0):
    try:
        if (count > 5):
            return ''
        seq = random.randint(1, 99)
        print(seq)
        headers = {'Content-Type': 'application/json'}
        ret = requests.post(
            'http://proxy.99jun.cn:8090',
            headers=headers,
            data=json.dumps({
                'token': 'test',
                'url': url,
                'headers': {
                    'method': 'GET',
                    'User-Agent': CONST['UA']['MOBILE'],
                },
                'seq': seq
            }))
        if (ret.status_code == 200):
            return ret
        else:
            return ''
    except Exception as e:
        print('-------proxy err-------', e)
        proxy(url, int(count) + 1)