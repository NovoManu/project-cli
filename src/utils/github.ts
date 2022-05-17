import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'
import octokit from './Octokit'

const { GITHUB_OWNER, GITHUB_TEMPLATES_REPOSITORY, GITHUB_TEMPLATES_PATH } =
  process.env

export const getTemplates = async (): Promise<any> => {
  const res: GetResponseDataTypeFromEndpointMethod<any> = await octokit.request(
    'GET /repos/{owner}/{repo}/contents/{path}',
    {
      owner: GITHUB_OWNER,
      repo: GITHUB_TEMPLATES_REPOSITORY,
      path: GITHUB_TEMPLATES_PATH
    }
  )
  return res.data
}

export const getRepositoryTarArchive = async (branch = 'main') => {
  return await octokit.request('GET /repos/{owner}/{repo}/tarball/{ref}', {
    owner: GITHUB_OWNER,
    repo: GITHUB_TEMPLATES_REPOSITORY,
    ref: branch
  })
}
