import { ISettings } from '../commands/project/settings'
import * as path from 'path'
import * as fs from 'fs'
import { Dirent } from 'fs'
import {
  checkOrCreateDirectory,
  removePrefixFromFileName,
  setDynamicDataInFile
} from './fs'
import flatten from './flatten-object'

const processFile = (
  tempDir: string,
  destDir: string,
  fileName: string,
  settings: ISettings
): void => {
  const tempFile = `${tempDir}/${fileName}`
  const notSupportedFormats = [
    '.jpg',
    '.png',
    '.jpeg',
    '.webp',
    '.gif',
    '.woff',
    'pre-commit'
  ]
  let fileContent = null
  if (notSupportedFormats.some((format: string) => fileName.includes(format))) {
    // Skip files which do not need to parse (e.i. images, fonts, etc)
    fileContent = fs.readFileSync(tempFile)
  } else {
    // Replace dynamic values in files by nunjack
    // It makes the setting object flat to get properties for nunjack
    fileContent = setDynamicDataInFile(tempFile, flatten(settings))
  }

  // Set proper name for final destination for files
  let destFile = `${destDir.replace(
    // Remove template name from the path
    `${settings.templateId}/`,
    ''
  )}/${fileName}`
  destFile = removePrefixFromFileName(destFile)

  checkOrCreateDirectory(destDir)

  try {
    // Add file into destination folder
    fs.writeFileSync(destFile, fileContent)
  } catch (e) {
    console.error(e)
  }
}

/*
  File processing is working with deep-first search algorithm
  It recursively walks through all files in the template and:
    1. replace dynamic value in files based on settings
    2. strip dynamic prefixes from files' names
*/
export default function processFilesInTemplate(
  tempDir: string,
  destDir: string,
  settings: ISettings
): void {
  fs.readdirSync(tempDir, { withFileTypes: true }).forEach((file: Dirent) => {
    if (file.isDirectory()) {
      const excludingDirectories = ['.git']
      if (excludingDirectories.some((dir: string) => file.name.includes(dir))) {
        return
      }
      processFilesInTemplate(
        path.join(tempDir, file.name),
        path.join(destDir, file.name),
        settings
      )
    } else {
      processFile(tempDir, destDir, file.name, settings)
    }
  })
}
