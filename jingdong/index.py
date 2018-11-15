#coding:utf-8

from task import jindong

tasks = {
    'jingdong': jindong.jindong,
}


def run():
    try:
        for task in tasks:
            tasks[task]()
    except Exception as e:
        print(e)


if __name__ == '__main__':
    run()