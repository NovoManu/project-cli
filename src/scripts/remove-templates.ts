import { removeTemplates } from '../utils/github'

removeTemplates().then(() => {
  console.log('Templates temp folder is deleted')
})
