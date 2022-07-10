import octokit from './Octokit'
import { removeFileOrDirectoryWithContent } from './fs'
import { tempDirName } from './constants'
import extractArchive from './tar'

const { GITHUB_OWNER, GITHUB_TEMPLATES_REPOSITORY } = process.env

export const fetchTemplates = async (): Promise<void> => {
  const res = await getRepositoryTarArchive()
  // @ts-ignore
  await extractArchive(res.data)
}

export async function removeTemplates(): Promise<void> {
  removeFileOrDirectoryWithContent(tempDirName)
}

export const getRepositoryTarArchive = async (branch = 'main') => {
  return await octokit.request('GET /repos/{owner}/{repo}/tarball/{ref}', {
    owner: GITHUB_OWNER,
    repo: GITHUB_TEMPLATES_REPOSITORY,
    ref: branch
  })
}
