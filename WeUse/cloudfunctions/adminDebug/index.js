// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let date = Date.now();
  await cloud.database().collection("debug").add({
    data: {
      userId: wxContext.OPENID,
      timestamp: date
    }
  });
}