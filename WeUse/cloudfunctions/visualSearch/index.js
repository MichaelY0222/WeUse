// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const crypto = require('crypto')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// Tencent Cloud credentials (store in environment variables)
const SECRET_ID = process.env.TENCENT_SECRET_ID
const SECRET_KEY = process.env.TENCENT_SECRET_KEY

// Helper: create signature
function sign(str, key) {
  return crypto.createHmac("sha256", key).update(str).digest("hex")
}

// Convert image to base64
async function getImageBase64(fileID) {
  const res = await cloud.downloadFile({ fileID })
  return res.fileContent.toString("base64")
}

exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()

  const { fileID } = event

  try {

    // Step 1: download image
    const base64Image = await getImageBase64(fileID)

    // Step 2: call Tencent image recognition API
    const response = await axios.post(
      "https://tiia.tencentcloudapi.com",
      {
        ImageBase64: base64Image
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-TC-Action": "DetectLabel",
          "X-TC-Version": "2019-05-29",
          "X-TC-Region": "ap-shanghai"
        }
      }
    )

    const labels = response.data.Response.Labels

    // Step 3: search database for similar items
    const items = await db.collection("items").get()

    let results = []

    items.data.forEach(item => {

      if (!item.labels) return

      const similarity = item.labels.filter(label =>
        labels.map(l => l.Name).includes(label)
      ).length

      if (similarity > 0) {
        results.push({
          item,
          similarity
        })
      }

    })

    // Step 4: sort results
    results.sort((a, b) => b.similarity - a.similarity)

    return {
      openid: wxContext.OPENID,
      results: results.slice(0, 10)
    }

  } catch (err) {

    return {
      error: err.message
    }

  }
}