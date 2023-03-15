import fs from 'fs'
import path from 'path'

const srcDir = 'src'

function findFilesRecursive(dir: string): string[] {
  const files: string[] = []
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file) || ''
      if (fs.statSync(filePath).isDirectory()) {
          files.push(...findFilesRecursive(filePath))
      } else {
          files.push(filePath)
      }
  })
  return files
}

function relativeToRoot(file): string {
    let offset = 0
    for(let i = file.indexOf(srcDir); i < file.length; i++) {
        offset += file[i] === path.sep ? 1 : 0
    }
    if (offset === 1) {
        return './'
    } else if (offset > 1) {
        return Array(offset - 1).fill('../').join('')
    }
    throw new Error('could not determine offset')
}

function identifyEntities() {
    const files = findFilesRecursive(srcDir)
    console.log(files)
    let output = ''
    const outputFile = files.find(file => file.endsWith(`${path.sep}entities.ts`))
    console.log(outputFile)
    const relativeRoot = relativeToRoot(outputFile)
    for (let file of files.filter(file => file.endsWith('.entity.ts'))) {
        const className = (fs.readFileSync(file, 'utf-8').match(/class (\S+)\s?{/))![1]
        const pathSep = (path.sep === '/')  ? path.sep : '\\\\'
        const relativePath = file.slice(file.indexOf(srcDir) + srcDir.length + 1, -3).replace(new RegExp(pathSep, 'g'), '/')
        output += `export { ${className } } from '${relativeRoot + relativePath}'\n`
    }
    fs.writeFileSync(outputFile!, output, 'utf-8')
}

identifyEntities()
