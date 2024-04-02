const qiniu = require("qiniu");

const accessKey = "34rl9wqSaLv8ndX1goIi9QAh98ERn6I7mq5GqkEU";
const secretKey = "pNttMaSOLo2nJKT9yRXXGaUV9abk30XjJrCcGDMh";
const bucket = "biyesheji12";

// 配置认证信息
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z1; // 设置Zone，根据你的空间位置选择

// 构建上传策略函数
function getUploadToken(bucket, key) {
  const options = {
    scope: bucket + ":" + key,
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
}

// 上传文件
function uploadFile(key, localFile) {
  const formUploader = new qiniu.form_up.FormUploader(config);
  const putExtra = new qiniu.form_up.PutExtra();
  const uploadToken = getUploadToken(bucket, key);

  return new Promise((resolve, reject) => {
    formUploader.putFile(
      uploadToken,
      key,
      localFile,
      putExtra,
      function (err, respBody, respInfo) {
        if (err) {
          reject(err);
        }
        if (respInfo.statusCode == 200) {
          resolve(respBody);
        } else {
          reject(
            new Error("Upload failed with status code: " + respInfo.statusCode)
          );
        }
      }
    );
  });
}

// 删除文件
function deleteFile(key) {
  const bucketManager = new qiniu.rs.BucketManager(mac, config);
  return new Promise((resolve, reject) => {
    bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
      if (err) {
        console.error("Error:", err);
        reject(err);
      } else if (respInfo.statusCode === 200) {
        resolve(respBody);
      } else {
        console.error("Response Info:", respInfo);
        reject(
          new Error("Delete failed with status code: " + respInfo.statusCode)
        );
      }
    });
  });
}

module.exports = {
  uploadFile,
  deleteFile,
};
