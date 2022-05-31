import { IInstallationSettings, IProjectSettings } from '../types'

const tar = require('tar')
const rimraf = require('rimraf')
import * as path from 'path'
import * as fs from 'fs'
import { Dirent } from 'fs'
import { Buffer } from 'buffer'
import * as chalk from 'chalk'
import * as nunjucks from 'nunjucks'

const { GITHUB_TEMPLATES_PATH } = process.env

nunjucks.configure({ autoescape: false })

const tempDirName = '.tmp'
const archiveName = 'archive.tar.gz'
const archiveDirPath = path.join(process.cwd(), tempDirName)
const archiveFilePath = path.join(archiveDirPath, archiveName)
const settingsFileName = 'mucli.json'

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

const getDefaultPackageName = (templateName: string): string => {
  return `my-project-${templateName}`
}

const checkOrCreateDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const extractTarArchive = () => {
  return new Promise<void>((resolve) => {
    const stream = fs.createReadStream(archiveFilePath).pipe(
      tar.x({
        strip: 1,
        C: tempDirName
      })
    )
    stream.on('finish', resolve)
  })
}

const saveTempArchive = (arr: Buffer) => {
  fs.appendFileSync(archiveFilePath, Buffer.from(arr))
}

const removePrefixFromFileName = (fileName: string) => {
  const prefixes = filePrefixes.map(({ prefix }) => prefix)
  prefixes.forEach((prefix) => {
    fileName = fileName.replace(prefix, '')
  })
  return fileName
}

const setDynamicDataInFile = (fileName: string, settings) => {
  return nunjucks.render(fileName, settings)
}

const copyFile = (
  tempDirectory: string,
  destDirectory: string,
  file: Dirent,
  templateName,
  settings
) => {
  const source = `${tempDirectory}/${file.name}`
  const notSupportedFiles = ['.jpg', '.png', 'jpeg', 'webp', '.gif', '.woff']
  let fileContent
  if (notSupportedFiles.some((v) => file.name.includes(v))) {
    fileContent = fs.readFileSync(source)
  } else {
    fileContent = setDynamicDataInFile(source, settings)
  }
  const replacementString = `${tempDirName}/${GITHUB_TEMPLATES_PATH}/${templateName}`
  const destination = removePrefixFromFileName(
    source.replace(replacementString, destDirectory)
  )
  checkOrCreateDirectory(destination.split('/').slice(0, -1).join('/'))
  try {
    fs.writeFileSync(destination, fileContent)
  } catch (e) {
    throw e
  }
}

const copyTempFilesToDestination = (
  tempDirectory: string,
  destDirectory: string,
  templateName: string,
  settings: IInstallationSettings
) => {
  fs.readdirSync(tempDirectory, { withFileTypes: true }).forEach(
    async (file: Dirent) => {
      if (file.isDirectory()) {
        copyTempFilesToDestination(
          path.join(tempDirectory, file.name),
          destDirectory,
          templateName,
          settings
        )
      } else {
        copyFile(tempDirectory, destDirectory, file, templateName, settings)
      }
    }
  )
}

const createSettingsFile = (
  templateName: string,
  installationSettings: IInstallationSettings,
  destinationDirectory
) => {
  const destination = path.join(destinationDirectory, `/${settingsFileName}`)
  const settings: IProjectSettings = {
    templateId: templateName,
    ...installationSettings
  }
  fs.writeFile(destination, JSON.stringify(settings), 'utf8', () => {
    console.log(chalk.blue('Settings file is created'))
  })
}

export const readSettingFile = (): IProjectSettings => {
  let settings
  try {
    settings = fs.readFileSync(settingsFileName, 'utf-8')
  } catch (e) {
    throw new Error('Could not find or open settings file')
  }
  return JSON.parse(settings)
}

const cleanTempDirectory = () => {
  rimraf(archiveDirPath, () => {
    console.log(chalk.blue('Temp files are deleted'))
  })
}

export const copyTemplateFiles = async (
  buffer: Buffer,
  templateName: string,
  projectName: string = null,
  settings: IInstallationSettings
) => {
  checkOrCreateDirectory(archiveDirPath)
  saveTempArchive(buffer)
  await extractTarArchive()
  const destinationDirectory =
    projectName || getDefaultPackageName(templateName)
  checkOrCreateDirectory(destinationDirectory)
  let tempDirectory = path.join(
    archiveDirPath,
    process.env.GITHUB_TEMPLATES_PATH,
    templateName
  )
  copyTempFilesToDestination(
    tempDirectory,
    destinationDirectory,
    templateName,
    settings
  )
  createSettingsFile(templateName, settings, destinationDirectory)
  cleanTempDirectory()
}

const removeBootstrapOnlyFiles = (tempPath: string, relativePath = '') => {
  const bootstrapPrefix = filePrefixes.find(({ id }) => id === 'bootstrap')
  fs.readdirSync(tempPath, { withFileTypes: true }).forEach((file: Dirent) => {
    if (file.isDirectory()) {
      relativePath += `/${file.name}`
      removeBootstrapOnlyFiles(path.join(tempPath, file.name), relativePath)
    } else {
      if (file.name.includes(bootstrapPrefix.prefix)) {
        fs.unlinkSync(path.join(tempPath, file.name))
      }
    }
  })
}

const removeSyncFilesIfExists = (tempPath: string, relativePath = '') => {
  const syncPrefix = filePrefixes.find(({ id }) => id === 'sync')
  fs.readdirSync(tempPath, { withFileTypes: true }).forEach((file: Dirent) => {
    if (file.isDirectory()) {
      relativePath += `/${file.name}`
      removeSyncFilesIfExists(path.join(tempPath, file.name), relativePath)
    } else {
      if (file.name.includes(syncPrefix.prefix)) {
        const isFileExists = fs.existsSync(
          path.join(
            process.cwd(),
            relativePath,
            removePrefixFromFileName(file.name)
          )
        )
        if (isFileExists) {
          fs.unlinkSync(path.join(tempPath, file.name))
        }
      }
    }
  })
}

export const syncProject = async (
  buffer: Buffer,
  settings: IProjectSettings
) => {
  checkOrCreateDirectory(archiveDirPath)
  saveTempArchive(buffer)
  await extractTarArchive()
  let tempDirectory = path.join(
    archiveDirPath,
    process.env.GITHUB_TEMPLATES_PATH,
    settings.templateId
  )
  removeBootstrapOnlyFiles(tempDirectory)
  removeSyncFilesIfExists(tempDirectory)
  copyTempFilesToDestination(tempDirectory, '', settings.templateId, settings)
  cleanTempDirectory()
}
