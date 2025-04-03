import fs from 'fs'
import { globSync } from 'glob'
const files = globSync('app/**/*.{ts,tsx}')
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8')
  const newContent = content.replace(
    /console\.log\([^;]*\);?/g,
    '// Removed console.log'
  )
  if (content !== newContent) {
    fs.writeFileSync(file, newContent)
    console.log()
  }
})
