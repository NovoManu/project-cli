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
    description: 'Sync only. It will be added only if file does not exist'
  },
  {
    prefix: '[[m]]',
    id: 'merge',
    description:
      'Merge files. It should merge two files and no overwrite common properties'
  },
  {
    prefix: '[[d]]',
    id: 'delete',
    description:
      'Delete files. File will be deleted if it exists in the project'
  }
]

export default filePrefixes
