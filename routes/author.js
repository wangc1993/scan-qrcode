const express = require('express');
const jwt = require("jsonwebtoken")
const { UserModel } = require("../models")
const { defaultLogger } = require('../logger.js');

const router = express.Router()


// 生成token
function generateToken(data, secret) {
  let iat = Math.floor(Date.now() / 1000);
  let exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15; // 有效期 15 天
  let token = jwt.sign(
    {
      data,
      iat,
      exp,
    },
    secret,
  );
  return token
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  defaultLogger.info(`username: ${username}`, `password: ${password}`)
  if ((await UserModel.findOne({ username, password }))) {
    res.send({
      code: 500,
      message: '用户名已被注册'
    })
    return
  }
  const user = new UserModel({
    username,
    password,
    avatar: "https://usercontents.authing.cn/authing-avatar.png"
  })
  await user.save()
  res.send({
    code: 200,
    message: '注册成功'
  })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  defaultLogger.info(`username: ${username}`, `password: ${password}`)
  const user = await UserModel.findOne({
    username,
    password
  })
  if (!user) {
    res.send({
      code: 403,
      message: '用户名密码不正确'
    })
    return
  }

  const token = generateToken({ userId: user._id, username, avatar: user.avatar }, "s3cret")
  res.send({
    code: 200,
    message: '登录成功',
    data: {
      _id: user._id,
      username,
      token
    }
  })
})

module.exports = router