const axios = require('axios');
const cheerio = require('cheerio');
const { promisify } = require('util');
const path = require('path');
const timeAsync = promisify(setTimeout);
const execAsync = promisify(require('child_process').exec);
const writeAsync = promisify(require('fs').writeFile);
const statAsync = promisify(require('fs').stat);

(async () => {
    try {
        const url = 'https://www.ximalaya.com/renwen/278932/';
        const page = (await axios.get(url)).data;
        const $ = cheerio.load(page);
        const list = $('html').find('.sound-list > ul > li');
        for (let i = 0; i < list.length; i++) {
            console.log(i);
            const exit = await statAsync(path.resolve(__dirname, `./audio/${i}.mp3`)).catch(() => {});
            if (exit) {
                console.log('跳过');
            } else {
                const id = $(list[i]).find('a').attr('href').split('/').reverse()[0];
                await timeAsync(2000);
                const audio = (await axios.get(`https://www.ximalaya.com/revision/play/v1/audio?id=${id}&ptype=1`)).data
                    .data.src;
                // mkdri audio
                await execAsync(`mkdir ${path.resolve(__dirname, './audio')}`).catch(() => {});
                // download audio
                await timeAsync(2000);
                console.log(audio);
                await axios.get(audio, { responseType: 'arraybuffer' }).then(async data => {
                    if (data.data) {
                        await writeAsync(path.resolve(__dirname, `./audio/${i}.mp3`), data.data, 'buffer');
                        console.log('下载成功');
                    }
                });
            }
        }
    } catch (e) {
        console.log(e);
    }
})();
