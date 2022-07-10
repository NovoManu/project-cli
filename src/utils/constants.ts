import * as path from 'path'

export const tempDirName = '.tmp'
export const archiveName = 'archive.tar.gz'
export const archiveDirPath = path.join(process.cwd(), tempDirName)
export const archiveFilePath = path.join(archiveDirPath, archiveName)
export const composeTemplateSettingsFile = 'settings.js'
