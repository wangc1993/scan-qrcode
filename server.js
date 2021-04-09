const express = require('express')
const mongoose = require('mongoose')
const { port, mongodbUrl } = require('./config/config.json')
const bodyParser = require("body-parser")
const { AuthorRoute, QrcodeRoute } = require("./routes")
const { defaultLogger, errorLogger } = require('./logger.js');

const app = express()

// 创建静态文件
app.use('/', express.static('public'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/author', AuthorRoute);
app.use('/qrcode', QrcodeRoute);
app.use('/', function () {
    res.send({
        code: 404,
        message: '未匹配路由'
    })
});

function listen() {
    app.listen(port);
    defaultLogger.info(`Express app started on port  ${port}`);
}

/*连接数据库*/
mongoose.connect(`mongodb://${mongodbUrl}/scan-qrcode`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err) {
    if (err) {
        errorLogger.error("数据库连接失败！");
    } else {
        defaultLogger.info("数据库连接成功！");
        listen()
    }
});