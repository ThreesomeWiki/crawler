#!/usr/bin/env python
# coding: utf-8

import sys
reload(sys)
sys.setdefaultencoding('utf8')
import urllib
import re
import json
import random
import urlparse
import binascii
import base64
import os

# crc32
def right_shift(val, n):
    return val >> n if val >= 0 else (val + 0x100000000) >> n

#get html content
def getHtml(url):
    page = urllib.urlopen(url)
    html = page.read()
    return html

def getVideoid(html):
    reg = r"videoId: '(\w+)"
    videore = re.compile(reg)
    videolist = videore.findall(html)
    for videourl in videolist:
        return videourl

#parse video json data
def parseVideoJson(url):
    html = urllib.urlopen(url)
    htmlstr = html.read()
    dictstr = json.loads(htmlstr)
    datastr = dictstr['data']
    dict_videolist = datastr['video_list']
    dict_video1 = dict_videolist['video_1']
    main_url = dict_video1['main_url']
    return main_url

#download video
def downLoadVideoFromURL(url):
    try:
        path = os.getcwd()
        file_name = str(random.random())+'.mp4'
        dest_dir=os.path.join(path,file_name)
        urllib.urlretrieve(url , dest_dir)
    except:
        print('\tError retrieving the URL:', dest_dir)    

#Step 1: get html
def getVideo(url):
    html = getHtml(url)
    file_object = open('video.html', 'w')
    file_object.write(html)
    file_object.close( )
    videoid = getVideoid(html)
    r = str(random.random())[2:]
    url = 'http://i.snssdk.com/video/urls/v/1/toutiao/mp4/%s' % videoid
    n = urlparse.urlparse(url).path + '?r=' + r
    c = binascii.crc32(n)
    s = right_shift(c, 0)
    mainvideourl = parseVideoJson(url + '?r=%s&s=%s' % (r, s))
    videourl = base64.b64decode(mainvideourl)
    return str(videourl);

