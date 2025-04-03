const fs = require('fs')
const glob = require('glob')
const files = glob.sync('app/**/*.{ts,tsx}')
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8')
  const newContent = content.replace(
    /console\.log\([^;]*\);?/g,
    '// Removed console.log'
  )
  if (content !== newContent) {
    fs.writeFileSync(file, newContent)
    console.log(`Updated ${file}`)
  }
})
