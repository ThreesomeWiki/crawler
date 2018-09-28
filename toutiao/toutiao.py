# coding=utf-8
import requests
import demjson
import tt
import time
import re
# UA
DEBUG = 0
BASE_URL = 'http://localhost/' if DEBUG == 1 else 'http://localhost:8080/'
UA = {
    'mobile': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
    'pc': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
}
# 数据源列表 废弃
source = {
    'toutiao':{
        '指法芬芳张大仙':{
            'url':'http://i.snssdk.com/dongtai/list/v9/?user_id=55453255774&max_cursor=',
            'fs':6150000,
            'sources':'https://www.toutiao.com/c/user/55453255774/#mid=1558847448511490'
        }
    }
}

# 获取列表
def toutiao_step1(params,max_cursor):
    try:
        # 获取博主视频列表
        rep = requests.get(params['url'] + max_cursor)
        if(rep.status_code == 200):
            toutiao_step2(rep.text,params)
    except Exception , e:
        print('------toutiao step1 error -------',e)

# 处理列表数据
def toutiao_step2(rep,params):
    try:
        videolist = demjson.decode(rep)
        max_cursor = videolist['data']['max_cursor']
        min_cursor = videolist['data']['min_cursor']
        videolist = videolist['data']['data']
        for video in videolist:
            if(video['item_id']):
                videolink = tt.getVideo('http://www.365yg.com/i'+str(video['item_id']))
                if(videolink):
                    items = {
                        'title':video['content'],
                        'summary':video['group']['source']+video['group']['title'],
                        'imglink':video['group']['image_url'],
                        'videolink':videolink,
                        'zan_num':video['digg_count'],
                        'authorid':video['user']['user_id'],
                        'author':video['user']['screen_name'],
                        'avatar_url':video['user']['avatar_url'],
                        'tags':demjson.encode([""]),
                        'source':params['url'],
                        'relev_id':video['id'],
                        'comments_count':video['comment_count'],
                    }
                    print(items)
                    time.sleep(30)
        if(max_cursor > min_cursor):
            toutiao_step1(params,str(max_cursor))
    except Exception , e:
        print('------头条 step2 error------',e)

# run 废弃
def run():
    for i in source:
        for j in source[i]:
            if(i == 'toutiao'):
                toutiao_step1(source[i][j],'')
run()

