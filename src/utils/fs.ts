import { IInstallationSettings } from '../types'
import sortDependencies from './sortDependencies'
import deepMerge from './deepMerge'
import filePrefixes from './prefixes'

import * as path from 'path'
import * as fs from 'fs'
import { Dirent } from 'fs'
import * as nunjucks from 'nunjucks'
import { archiveDirPath } from './constants'

nunjucks.configure({ autoescape: false })

export const checkOrCreateDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export const removePrefixFromFileName = (fileName: string) => {
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

export const copyTempFilesToDestination = (
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

export const removeFileOrDirectoryWithContent = (path: string) => {
  fs.rmSync(path, { recursive: true, force: true })
}

export const cleanTempDirectory = () => {
  removeFileOrDirectoryWithContent(archiveDirPath)
}
