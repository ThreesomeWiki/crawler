import requests, json, re, time
from pyquery import PyQuery as pq
from urllib import parse
from common import getKeys, insertJob, proxy


def zhilian(start=0):
    try:
        keys = getKeys()
        if not keys:
            return
        keys = keys.split(',')
        for key in keys:
            try:
                url = 'https://fe-api.zhaopin.com/c/i/sou?start=' + str(
                    start
                ) + '&pageSize=60&cityId=538&kt=3&_v=0.04450892&kw=' + parse.quote(
                    key)
                # rep = requests.get(url)
                rep = proxy(url)
                if rep and rep.status_code == 200:
                    ret = json.loads(rep.text)
                    if ret and ret['code'] == 200 and ret['data'] and ret['data']['results'] and len(
                            ret['data']['results']):
                        job_list = ret['data']['results']
                        for v in job_list:
                            item = {
                                'title': v['jobName'],
                                'sid': v['number'],
                                'company_name': v['company']['name'],
                                'company_size': v['company']['size']['name'],
                                'company_type': v['company']['type']['name'],
                                'workding_time': v['workingExp']['name'],
                                'eduLevel': v['eduLevel']['name'],
                                'salary': v['salary'],
                                'emplType': v['emplType'],
                                'jobName': v['jobName'],
                                'job_create_time':
                                v['createDate'].split(' ')[0],
                                'job_update_time':
                                v['updateDate'].split(' ')[0],
                                'job_end_time': v['endDate'].split(' ')[0],
                                'welfare': ','.join(v['welfare']),
                                'min_time': 0,
                                'city': v['city']['display'],
                                'address': '',
                                'source': 'zhilian'
                            }
                            # 获取公司地址

                            address_html = proxy(v['positionURL'])

                            if address_html and address_html.status_code == 200:
                                html = pq(address_html.text)('html')
                                address = html.find('.add').text()
                                if address:
                                    item['address'] = address
                            tag = key
                            insertJob(item, tag)
                            time.sleep(2)
                        if start + 60 < ret['data']['numFound']:
                            zhilian(start + 60)
            except Exception as e:
                print(e)
    except Exception as e:
        print(e)


if __name__ == '__main__':
    zhilian()
