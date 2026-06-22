import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const pkgPath = join(__dirname, '..', 'node_modules', '@angular', 'build', 'package.json')

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.exports ||= {}
if (!pkg.exports['./src/*']) {
  pkg.exports['./src/*'] = './src/*'
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('✓ Patched @angular/build exports')
}
