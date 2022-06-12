import { IInstallationSettings, IProjectSettings } from '../types'
import sortDependencies from './sortDependencies'
import deepMerge from './deepMerge'

const tar = require('tar')
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

const checkMergeableFile = (fileName: string) => {
  const filesForMerge = ['package.json']
  return filesForMerge.some((file: string) => file.includes(fileName))
}

const copyFile = (sourceDir: string, destinationDir: string, file: Dirent) => {
  const source = `${sourceDir}/${file.name}`
  const destination = `${destinationDir}/${file.name}`
  let fileContent = fs.readFileSync(source, 'utf-8')
  checkOrCreateDirectory(destinationDir)
  if (checkMergeableFile(file.name) && fs.existsSync(destination)) {
    const existing = fs.readFileSync(destination, 'utf-8')
    const merge = sortDependencies(
      deepMerge(JSON.parse(existing), JSON.parse(fileContent))
    )
    fileContent = JSON.stringify(merge, null, 4)
  }
  try {
    fs.writeFileSync(destination, fileContent)
  } catch (e) {
    throw e
  }
}

const copyFileWithReplacement = (
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
  const destination = removePrefixFromFileName(`${destDirectory}/${file.name}`)
  checkOrCreateDirectory(destDirectory)
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
  settings: IInstallationSettings | {},
  isRawCopy: boolean = false
) => {
  fs.readdirSync(tempDirectory, { withFileTypes: true }).forEach(
    (file: Dirent) => {
      if (file.isDirectory()) {
        copyTempFilesToDestination(
          path.join(tempDirectory, file.name),
          path.join(destDirectory, file.name),
          templateName,
          settings,
          isRawCopy
        )
      } else {
        if (isRawCopy) {
          copyFile(tempDirectory, destDirectory, file)
        } else {
          copyFileWithReplacement(
            tempDirectory,
            destDirectory,
            file,
            templateName,
            settings
          )
        }
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
  fs.writeFile(destination, JSON.stringify(settings, null, 4), 'utf8', () => {
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

const removeFileOrDirectoryWithContent = (path: string) => {
  fs.rmSync(path, { recursive: true, force: true })
}

const cleanTempDirectory = () => {
  removeFileOrDirectoryWithContent(archiveDirPath)
}

const composeTemplate = async (templateSettings, templateName) => {
  console.log(chalk.blue('Composing the template...'))
  const components = Object.keys(templateSettings)
  const selectedComponents = components.filter((key: string) => {
    return templateSettings[key]
  })
  const notSelectedComponents = components.filter((key: string) => {
    return !templateSettings[key]
  })
  const destinationDirectory = `${tempDirName}/${GITHUB_TEMPLATES_PATH}/${templateName}`
  // Copy files from selected components
  for (const component of selectedComponents) {
    const componentDirectory = `${destinationDirectory}/${component}`
    copyTempFilesToDestination(
      componentDirectory,
      destinationDirectory,
      templateName,
      {},
      true
    )
    // Remove template component
    removeFileOrDirectoryWithContent(componentDirectory)
  }
  // Delete non selected components from template
  for (const component of notSelectedComponents) {
    const componentDirectory = `${destinationDirectory}/${component}`
    // Remove template component
    removeFileOrDirectoryWithContent(componentDirectory)
  }
  // Remove template settings file
  removeFileOrDirectoryWithContent(`${destinationDirectory}/settings.js`)
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
  // Check template settings file
  const templateInstallationSettingsFile = `${archiveDirPath}/${GITHUB_TEMPLATES_PATH}/${templateName}/settings.js`
  let templateInstallationSettings = {}
  if (fs.existsSync(templateInstallationSettingsFile)) {
    try {
      const getInstallationSettings = require(templateInstallationSettingsFile)
      templateInstallationSettings = await getInstallationSettings()
    } catch (e) {
      console.error(e)
      throw new Error('Cannot read template settings file')
    }
  }
  settings = {
    ...settings,
    ...templateInstallationSettings
  }
  const destinationDirectory =
    projectName || getDefaultPackageName(templateName)
  checkOrCreateDirectory(destinationDirectory)
  let tempDirectory = path.join(
    archiveDirPath,
    process.env.GITHUB_TEMPLATES_PATH,
    templateName
  )
  // Compose composable template
  if (settings.templates) {
    console.log(chalk.blue('Found composable template'))
    await composeTemplate(settings.templates, templateName)
  }
  copyTempFilesToDestination(
    tempDirectory,
    path.join(process.cwd(), destinationDirectory),
    templateName,
    settings
  )
  createSettingsFile(templateName, settings, destinationDirectory)
  cleanTempDirectory()
}

const removeBootstrapOnlyFiles = (tempPath: string) => {
  const bootstrapPrefix = filePrefixes.find(({ id }) => id === 'bootstrap')
  fs.readdirSync(tempPath, { withFileTypes: true }).forEach((file: Dirent) => {
    if (file.isDirectory()) {
      removeBootstrapOnlyFiles(path.join(tempPath, file.name))
    } else {
      if (file.name.includes(bootstrapPrefix.prefix)) {
        fs.unlinkSync(path.join(tempPath, file.name))
      }
    }
  })
}

const removeSyncFilesIfExists = (tempPath: string, templateName) => {
  const syncPrefix = filePrefixes.find(({ id }) => id === 'sync')
  fs.readdirSync(tempPath, { withFileTypes: true }).forEach((file: Dirent) => {
    if (file.isDirectory()) {
      removeSyncFilesIfExists(path.join(tempPath, file.name), templateName)
    } else {
      if (file.name.includes(syncPrefix.prefix)) {
        const replacementString = `${tempDirName}/${GITHUB_TEMPLATES_PATH}/${templateName}`
        const projectDestination = tempPath.replace(replacementString, '')
        const isFileExists = fs.existsSync(
          path.join(projectDestination, removePrefixFromFileName(file.name))
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
  removeSyncFilesIfExists(tempDirectory, settings.templateId)
  // Sync composable template
  if (settings.templates) {
    await composeTemplate(settings.templates, settings.templateId)
  }
  copyTempFilesToDestination(
    tempDirectory,
    process.cwd(),
    settings.templateId,
    settings
  )
  cleanTempDirectory()
}
