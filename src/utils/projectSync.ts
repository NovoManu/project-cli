import * as fs from 'fs'
import * as path from 'path'
import filePrefixes from './prefixes'
import { Dirent } from 'fs'
import { Buffer } from 'buffer'
import { IProjectSettings } from '../types'
import {
  cleanTempDirectory,
  copyTempFilesToDestination,
  removePrefixFromFileName
} from './fs'
import { tempDirName, archiveDirPath } from './constants'
import saveArchive from './tar'
import composeTemplate from './composeTemplate'

const { GITHUB_TEMPLATES_PATH } = process.env

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

const syncProject = async (
  buffer: Buffer,
  settings: IProjectSettings
) => {
  await saveArchive(buffer)
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

export default syncProject
