const fg = require('fast-glob')
const fs = require('fs-extra')
const path = require('path')

module.exports = async () => {
  const baseDir = path.dirname(require.resolve('evil-icons'))
  const sourceFiles = await fg(path.join(baseDir, 'assets/icons/*.svg'))

  return sourceFiles.map(filename => {
    const match = filename.match(/ei-([^}]+)\.svg$/)
    return {
      originalName: match[1],
      source: fs.readFileSync(filename).toString(),
      pack: 'evil',
      width: '24',
      height: '24',
    }
  })
}
