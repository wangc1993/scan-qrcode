const path = require('path');
const log4js = require('log4js');
const { logUrl } = require('./config/config.json')

// 配置log4js
log4js.configure({
    // 日志输出到哪里
    appenders: {
        // 控制台输出
        console: { type: 'console' },
        // 日志文件
        default: {
            type: 'dateFile',
            filename: path.join(__dirname, `${logUrl}/info.log`)
        },
        error: {
            type: 'dateFile',
            filename: path.join(__dirname, `${logUrl}/error.log`)
        }
    },
    // 日志类别
    categories: {
        // 默认日志
        default: {
            appenders: ['default', 'console'],
            level: 'debug'
        },
        error: {
            appenders: ['error', 'console'],
            level: 'all'
        }
    }
});

// 获取默认日志
const defaultLogger = log4js.getLogger('default');
const errorLogger = log4js.getLogger('error');

module.exports = {
    defaultLogger,
    errorLogger
};