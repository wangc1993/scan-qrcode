const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QRCodeSchema = new Schema({
  _allreadyUsed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  url: String,
  // 是否已经被扫码
  scanned: {
    type: Boolean,
    default: false
  },
  status: {
    type: Number,
    // 0 - 未确认；1 - 确认授权；-1 - 取消授权
    default: 0
  },
  userInfo: {
    type: Object,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date
  }
});

module.exports = mongoose.model('QRCode', QRCodeSchema);