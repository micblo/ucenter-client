# ucenter-client - Easy to connect UC

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

Coming soon..