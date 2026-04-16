const fs = require('node:fs')
const path = require('node:path')

const dir = 'C:/Users/11762/Pictures/日本2024/吹响吧上低音号'
const targetDir = path.join(dir, 'heic')

const list = fs.readdirSync(dir)

for (const item of list) {
  if (item.includes('.HEIC')) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir)
    }
    fs.renameSync(path.join(dir, item), path.join(targetDir, item))
  }
}