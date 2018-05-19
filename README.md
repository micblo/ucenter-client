# ucenter-client - Easy to connect UC

[![dependencies Status](https://david-dm.org/micblo/ucenter-client/status.svg)](https://david-dm.org/micblo/ucenter-client)
[![Known Vulnerabilities](https://snyk.io/test/github/micblo/ucenter-client:package.json/badge.svg?targetFile=package.json)](https://snyk.io/test/github/micblo/ucenter-client:package.json?targetFile=package.json)

## Install

```shell
npm install ucenter-client --save
```

## Get started

ucenter-client is designed to be the easiest way to connect UC.

Firstly, write a config JSON file (like `config.json`):

```js
{
    "UC_KEY": "abc123",
    "UC_API": "http://test.com/uc_server",
    "UC_CHARSET": "gbk",
    "UC_APPID": 1,
    "UC_IP": "10.0.0.1"
}
```

Secondly, init ucenter-client:

```js
const UC_CONFIG = require('./config.json');
const uc = require('ucenter-client')(UC_CONFIG);
```

Bingo! Use ucenter-client to call functions:

```js
try {
    const res = async uc.user.checkName('test123');
    console.log(res === 1 ? 'Available!' : 'Invalid Username');
} catch (e) {
    console.error(e);
}
```

## Document

### Bind Client Server

Your website is an application of UC.
When "应用的主 URL" is "<http://sample.com>",
you node server should set `clientCtx` in controller of route "/api/uc.php".

For example:

```js
async index() {
    const {
        ctx
    } = this;
    try {
        const {
            resCode,
            action,
            data
        } = await uc.clientCtx(ctx.request.query, ctx.request.body);
        if (resCode !== uc.API_RETURN_SUCCEED) {
            ctx.response.body = resCode;
        } else {
            switch (action) {
            // 同步登录
            case 'synlogin':
                // TODO: 设置登录凭证Cookie
                response.set('P3P', 'CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR"');
                ctx.response.body = 'Sync Login now...';
                break;
            // 同步注销
            case 'synlogout':
                // TODO: 清除登录凭证Cookie
                ctx.response.body = 'Logout';
                break;
            default:
                ctx.response.body = resCode;
            }
        }
    } catch(e) {
        ctx.response.body = e.toString();
    }
}
```

More document of API, you can see "UCenter 接口开发手册 - API 接口".

### User

You can use `uc.user` to call User functions.

Document: "UCenter 接口开发手册 - 接口函数 - 用户接口".

### PM

You can use `uc.pm` to call PrivateMessage functions.

Document: "UCenter 接口开发手册 - 接口函数 - 私信接口".
