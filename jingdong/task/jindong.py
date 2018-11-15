#coding:utf-8
import requests
from pyquery import PyQuery as pq
from urllib import parse
from common import UA
import re

# 京东分类
cats = {
    '家用电器': {
        '电视': {
            '曲面电视': '曲面电视',
            '超薄电视': '超薄电视',
            'OLED电视': 'OLED电视',
            '4k超清电视': '4k超清电视',
            '电视配件': '电视配件'
        },
        '空调': {
            '挂壁式空调': '挂壁式空调'
        }
    }
}


def getList(url, tags):
    try:
        ret = requests.get(url, headers={'User-Agent': UA['PC']})
        if ret and ret.status_code == 200:
            ret.content.decode(ret.encoding).encode('utf-8')
            jq = pq(ret.content)
            lists = jq('.gl-warp.clearfix > li')
            for li in lists:
                try:
                    v = jq(li)
                    id = v.attr('data-sku')
                    price_txt = v.find('.p-price').text()
                    price = re.search('\d+(\.\d+)?', price_txt).group()
                    title_txt = v.find('.p-name > a >em').text()
                    title = title_txt.replace("\n", " ")
                    items = {
                        'id': id,
                        'price': price,
                        'title': title,
                        'tags': tags
                    }
                    print(items)
                except Exception as e:
                    print(e)
    except Exception as e:
        print(e)


def jindong():
    try:
        for i in cats:
            for j in cats[i]:
                for k in cats[i][j]:
                    cat_arr = [i, j, k]
                    key = cats[i][j][k]
                    url = 'https://search.jd.com/Search?enc=utf-8&pvid=65b87ed4c5bc48efa6edf2d1f4308fd4&wq&keyword=' + parse.quote(
                        key)
                    try:
                        getList(url, ','.join(cat_arr))
                    except Exception as e:
                        print(e)
    except Exception as e:
        print(e)
