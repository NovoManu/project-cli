const tar = require('tar')
const rimraf = require('rimraf')
import * as path from 'path'
import * as fs from 'fs'
import { Buffer } from 'buffer'
import * as chalk from 'chalk'

const tempDirName = '.tmp'
const archiveName = 'archive.tar.gz'
const cwd = path.join(process.cwd(), tempDirName)
const archivePath = path.join(cwd, archiveName)

const checkOrCreateTempDirectory = () => {
  if (!fs.existsSync(cwd)) {
    fs.mkdirSync(cwd)
  }
}

const extractTarArchive = () => {
  fs.createReadStream(archivePath).pipe(
    tar.x({
      strip: 1,
      C: tempDirName
    })
  )
}

const saveTempArchive = (arr: Buffer) => {
  fs.appendFileSync(archivePath, Buffer.from(arr))
}

const cleanTempDirectory = () => {
  rimraf(cwd, () => {
    console.log(chalk.blue('Temp files are deleted'))
  })
}

export const copyTemplateFiles = (arr: Buffer) => {
  checkOrCreateTempDirectory()
  saveTempArchive(arr)
  extractTarArchive()
  cleanTempDirectory()
}
