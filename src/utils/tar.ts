const tar = require('tar')
import { Buffer } from 'buffer'
import * as fs from 'fs'
import { archiveFilePath, tempDirName, archiveDirPath } from './constants'
import { checkOrCreateDirectory } from './fs'

const saveTempArchive = (buffer: Buffer) => {
  fs.appendFileSync(archiveFilePath, Buffer.from(buffer))
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

const saveArchive = async (buffer: Buffer) => {
  checkOrCreateDirectory(archiveDirPath)
  saveTempArchive(buffer)
  await extractTarArchive()
}

export default saveArchive
