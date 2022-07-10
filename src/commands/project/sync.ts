import { fetchTemplates, removeTemplates } from '../../utils/github'
import { readSettingsFile } from './settings'
import { getTemplatesDir, removePrefixFromFileName } from '../../utils/fs'
import * as path from 'path'
import * as fs from 'fs'
import { Dirent } from 'fs'
import filePrefixes from '../../utils/prefixes'
import processFilesInTemplate from '../../utils/files-processor'
import { tempDirName } from '../../utils/constants'
const chalk = require('chalk')

const { GITHUB_TEMPLATES_PATH } = process.env

const processBootstrapFile = (tempPath: string, fileName: string): void => {
  fs.unlinkSync(path.join(tempPath, fileName))
}

const processSyncFile = (
  tempPath: string,
  templateName: string,
  fileName: string
) => {
  const replacementString = `${tempDirName}/${GITHUB_TEMPLATES_PATH}/${templateName}`
  // Get file path in the current project (just remove two parts from temp file)
  const projectDestination = tempPath.replace(replacementString, '')
  // Check if file exists in the current project
  const isFileExists = fs.existsSync(
    path.join(projectDestination, removePrefixFromFileName(fileName))
  )
  if (isFileExists) {
    // Remove file from temp directory and prevent its copy later
    fs.unlinkSync(path.join(tempPath, fileName))
  }
}

const processDeleteFile = (
  tempPath: string,
  templateName: string,
  fileName: string
) => {
  const replacementString = `${tempDirName}/${GITHUB_TEMPLATES_PATH}/${templateName}`
  // Get file path in the current project (just remove two parts from temp file)
  const projectDestination = tempPath.replace(replacementString, '')

  //Get file path in the project
  const projectFilePath = path.join(
    projectDestination,
    removePrefixFromFileName(fileName)
  )

  // Check if file exists in the current project
  const isFileExists = fs.existsSync(projectFilePath)
  if (isFileExists) {
    // Remove file from temp directory and prevent its copy later
    fs.unlinkSync(path.join(tempPath, fileName))
    // Remove file from the project itself
    fs.unlinkSync(projectFilePath)
  }
}

const processPrefixedFiles = (tempPath: string, templateName) => {
  const bootstrapPrefix = filePrefixes.find(({ id }) => id === 'bootstrap')
  const syncPrefix = filePrefixes.find(({ id }) => id === 'sync')
  const mergePrefix = filePrefixes.find(({ id }) => id === 'merge')
  const deletePrefix = filePrefixes.find(({ id }) => id === 'delete')
  fs.readdirSync(tempPath, { withFileTypes: true }).forEach((file: Dirent) => {
    if (file.isDirectory()) {
      processPrefixedFiles(path.join(tempPath, file.name), templateName)
    } else {
      if (file.name.includes(bootstrapPrefix.prefix)) {
        processBootstrapFile(tempPath, file.name)
      }
      if (file.name.includes(syncPrefix.prefix)) {
        processSyncFile(tempPath, templateName, file.name)
      }
      if (file.name.includes(deletePrefix.prefix)) {
        processDeleteFile(tempPath, templateName, file.name)
      }
    }
  })
}

/*
  Project sync
*/
export default async () => {
  // Remove existing templates if they are exists
  await removeTemplates()

  // Fetching templates from gitlab
  await fetchTemplates()

  // Get project settings
  const settings = readSettingsFile()

  // Clean up the temporary folder from not used files
  const tempDir = `${getTemplatesDir()}/${GITHUB_TEMPLATES_PATH}/${
    settings.template.id
  }`
  processPrefixedFiles(tempDir, settings.template.id)

  // Check if template is composable (it must include modules property)
  if (settings.modules) {
    // Todo: Compose composable template
  }

  // Process and copy files in template
  const destDir = process.cwd()
  await processFilesInTemplate(tempDir, destDir, settings)

  // Clean-up and remove temp directory
  await removeTemplates()

  // Congrats message
  console.log(chalk.white(`The project is synchronized successfully`))
}
