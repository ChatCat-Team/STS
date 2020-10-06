const fs = require('fs');

const express = require('express');
const cors = require('cors');
const app = express();

const OSS = require('ali-oss');
const STS = OSS.STS;

require('dotenv').config();

const policy = fs.readFileSync('./policy.conf.json').toString();

const sts = new STS({
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
});

express.json();
app.use(cors({ credentials: true }));

app.get('/', async (req, res) => {
  try {
    if (req.query.id) {
      const token = await sts.assumeRole(
        process.env.ROLE_ARN,
        policy,
        process.env.EXPIRATION,
        process.env.SESSION_NAME
      );

      res.json({
        code: 0,
        msg: '成功获得 STS Token',
        data: {
          region: 'oss-cn-beijing',
          accessKeyId: token.credentials.AccessKeyId,
          accessKeySecret: token.credentials.AccessKeySecret,
          stsToken: token.credentials.SecurityToken,
          bucket: 'lifeni-test',
          secure: true,
        },
      });
    } else {
      res.statusCode = 400;
      res.json({
        code: 1,
        msg: '没有认证',
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(7070);
