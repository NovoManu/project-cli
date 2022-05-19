export interface IInstallationSettings {
  jest: boolean
  devPort: number
}

export interface IProjectSettings extends IInstallationSettings{
  templateId: string
}
