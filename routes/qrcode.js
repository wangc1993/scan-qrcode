const express = require('express')
const moment = require("moment")
const jwt = require("jsonwebtoken")
const QRCodeNode = require("qrcode")
const { QRCodeModel } = require("../models")

const router = express.Router()

// 解析token
function decryptToken(token, secret) {
  try {
    token = token.replace('Bearer ', '')
    let res = jwt.verify(token, secret);
    return res;
  } catch (err) {
    return false;
  }
}

// 登录检测
const authenticated = async (req, res, next) => {
  const authorationToken = req.headers['authorization']
  const decoded = decryptToken(authorationToken, 's3cret')
  if (!decoded) {
    res.send({
      code: 403,
      message: '请先登录'
    })
    return
  }
  req.logged = true
  req.user = {
    userId: decoded.data.userId,
    username: decoded.data.username,
    avatar: decoded.data.avatar,
    token: authorationToken
  }
  await next()
}

// 二维码生成接口
router.get('/generate', async (req, res) => {

  // 将二维码存入数据库
  const qrcode = new QRCodeModel({
    createdAt: Date.now(),
    // 设置过期时间
    expireAt: moment(Date.now()).add(1200, 's').toDate(),
  })
  await qrcode.save()

  let qrcodeData = {
    qrcodeId: qrcode._id,
    createdAt: qrcode.createdAt,
    expireAt: qrcode.expireAt,
  }
  const qrcodeUrl = await QRCodeNode.toDataURL(JSON.stringify(qrcodeData));
  res.send({
    code: 200,
    message: '生成二维码成功',
    data: {
      qrcodeId: qrcode._id,
      qrcodeUrl
    }
  })
})

// 二维码状态查询接口
router.get('/check', async (req, res) => {
  const { qrcodeId } = req.query;
  const qrcode = await QRCodeModel.findOne({ _id: qrcodeId })

  if (!qrcode) {
    res.send({
      code: 2241,
      message: '二维码不存在',
      data: null
    })
    return
  }

  res.send({
    code: 200,
    message: '查询二维码状态成功',
    data: {
      qrcodeId,
      scanned: qrcode.scanned,
      expired: moment() >= moment(qrcode.expireAt),
      success: qrcode.status === 1,
      canceled: qrcode.status === -1,
      status: qrcode.status,
      userInfo: qrcode.userInfo,
      ticket: qrcode.ticket,
    }
  })
})

// 标记二维码已扫描接口
router.post('/scanned', authenticated, async (req, res) => {
  const { qrcodeId } = req.body
  const qrcode = await QRCodeModel.findOne({ _id: qrcodeId })

  if (!qrcode) {
    res.send({
      code: 2241,
      message: '二维码不存在',
      data: null
    })
    return
  }
  await QRCodeModel.findOneAndUpdate({ _id: qrcodeId }, {
    scanned: true, userInfo: {
      username: req.user.username,
      avatar: req.user.avatar
    }
  })
  res.send({
    code: 200,
    message: '扫码成功'
  })
})

// 同意授权接口
router.post('/confirm', authenticated, async (req, res) => {
  const { qrcodeId } = req.body
  const qrcode = await QRCodeModel.findOne({ _id: qrcodeId })

  if (!qrcode) {
    res.send({
      code: 2241,
      message: '二维码不存在',
      data: null
    })
    return
  }
  await QRCodeModel.findOneAndUpdate({ _id: qrcodeId }, {
    status: 1, userInfo: req.user
  })
  res.send({
    code: 200,
    message: '扫码成功'
  })
})

// 取消授权接口
router.post('/cancel', authenticated, async (req, res) => {
  const { qrcodeId } = req.body
  const qrcode = await QRCodeModel.findOne({ _id: qrcodeId })

  if (!qrcode) {
    res.send({
      code: 2241,
      message: '二维码不存在',
      data: null
    })
    return
  }
  await QRCodeModel.findOneAndUpdate({ _id: qrcodeId }, {
    status: -1,
  })
  res.send({
    code: 200,
    message: '用户取消扫码'
  })
})

module.exports = router