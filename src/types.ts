export interface IInstallationSettings {
  [key: string]: any
  devPort: number
}

export interface IProjectSettings extends IInstallationSettings{
  templateId: string
}
