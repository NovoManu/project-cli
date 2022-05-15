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

interface IFilePrefix {
  id: string
  prefix: string
  description: string
}

const filePrefixes: IFilePrefix[] = [
  {
    prefix: '[[b]]',
    id: 'bootstrap',
    description: 'Bootstrap only. It will be added only during the installation'
  },
  {
    prefix: '[[s]]',
    id: 'sync',
    description: 'Sync only. It will be added only if file is not exists'
  }
]

const getDestinationDirPath = (templateName: string): string => {
  return `my-project-${templateName}`
}

const checkOrCreateDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

const extractTarArchive = () => {
  return new Promise<void>((resolve) => {
    const stream = fs.createReadStream(archivePath).pipe(
      tar.x({
        strip: 1,
        C: tempDirName
      })
    )
    stream.on('finish', resolve)
  })
}

const saveTempArchive = (arr: Buffer) => {
  fs.appendFileSync(archivePath, Buffer.from(arr))
}

const removePrefixFromFileName = (fileName: string) => {
  const prefixes = filePrefixes.map(({ prefix }) => prefix)
  prefixes.forEach((prefix) => {
    fileName = fileName.replace(prefix, '')
  })
  return fileName
}

const copyTempFilesToDestination = (
  tempDirectory: string,
  destinationDir: string,
  templateName: string,
  relativePath: string = ''
) => {
  fs.readdirSync(tempDirectory, { withFileTypes: true }).forEach((file) => {
    if (file.isDirectory()) {
      // Note: extend the path with additional directory
      relativePath += `/${file.name}`
      copyTempFilesToDestination(
        path.join(tempDirectory, file.name),
        destinationDir,
        templateName,
        relativePath
      )
    } else {
      const source = `${tempDirectory}/${file.name}`
      // Note: create destination for files in directories
      const destinationDirectory = `${path.join(
        process.cwd(),
        destinationDir
      )}${relativePath}`
      checkOrCreateDirectory(destinationDirectory)
      const name = removePrefixFromFileName(file.name)
      const destination = `${destinationDirectory}/${name}`
      fs.copyFile(source, destination, (err) => {
        if (err) throw err
      })
    }
  })
}

const cleanTempDirectory = () => {
  rimraf(cwd, () => {
    console.log(chalk.blue('Temp files are deleted'))
  })
}

export const copyTemplateFiles = async (
  arr: Buffer,
  templateName,
  projectName: string = null
) => {
  checkOrCreateDirectory(cwd)
  saveTempArchive(arr)
  await extractTarArchive()
  const destinationDirectory =
    projectName || getDestinationDirPath(templateName)
  checkOrCreateDirectory(destinationDirectory)
  let tempDirectory = path.join(
    cwd,
    process.env.GITHUB_TEMPLATES_PATH,
    templateName
  )
  copyTempFilesToDestination(tempDirectory, destinationDirectory, templateName)
  // cleanTempDirectory()
}
