const { jar } = require('request');
var rp = require('request-promise');
var tough = require('tough-cookie');
const fs = require('fs-extra');
const gunzip = require('gunzip-file')

var Cookie = tough.Cookie;
var cookiejar = rp.jar();
let baseUrl = 'https://url.publishedprices.co.il/';
var loginOptions = {
    method: 'POST',
    uri: 'https://url.publishedprices.co.il/login/user',
    body: 'username=osherad&password=&Submit=Sign+in',
    jar: cookiejar,
    simple: false,
    resolveWithFullResponse: true,
    json: false // Automatically stringifies the body to JSON
};

var dataOption = {
    method: 'POST',
    headers: {
        'Referer': 'https://url.publishedprices.co.il/file',
    },
    simple: false,
    jar: cookiejar,
    uri: 'https://url.publishedprices.co.il/file/ajax_dir',
    body: 'sEcho=1&iColumns=5&sColumns=%2C%2C%2C%2C&iDisplayStart=0&iDisplayLength=100000&mDataProp_0=fname&sSearch_0=&bRegex_0=false&bSearchable_0=true&bSortable_0=true&mDataProp_1=type&sSearch_1=&bRegex_1=false&bSearchable_1=true&bSortable_1=false&mDataProp_2=size&sSearch_2=&bRegex_2=false&bSearchable_2=true&bSortable_2=true&mDataProp_3=ftime&sSearch_3=&bRegex_3=false&bSearchable_3=true&bSortable_3=true&mDataProp_4=&sSearch_4=&bRegex_4=false&bSearchable_4=true&bSortable_4=false&sSearch=&bRegex=false&iSortingCols=0&cd=%2F',
    json: false,
    // resolveWithFullResponse: true,
}

rp(loginOptions)
    .then(function (parsedBody) {
        // POST succeeded...

        rp(dataOption).then(function (data) {
            const tmpFolder = new Date().getTime();
            fs.mkdir(`${__dirname}/${tmpFolder}`, { recursive: true });
            fs.mkdir(`${__dirname}/${tmpFolder}Unzip`, { recursive: true });
            JSON.parse(data).aaData.map(file => {
                // console.log(`${baseUrl}file/d/${file.name}`)
                rp(`${baseUrl}file/d/${file.name}`, { jar: cookiejar, resolveWithFullResponse: true, encoding: "binary", method: 'GET' }).then(res => {
                    const tmpPath = `${__dirname}/${tmpFolder}/${file.name}`;

                    // console.log(res.body)
                    fs.writeFile(tmpPath, res.body, 'binary', function (err) {
                        if (file.name.endsWith('.gz')) {
                            gunzip(tmpPath, `${__dirname}/${tmpFolder}Unzip/${file.name.replace('.gz', '.xml')}`, () => {

                            })
                        }
                    });

                })
            })
        }).catch(function (e) {
            // POST failed...

            // console.log(e)
        })

        // cookiejar.setCookie(parsedBody.headers['set-cookie'])
    })
    .catch(function (err) {
        // POST failed...

        // console.log(err)
    });


function callback(str) {
    console.log(str)
}