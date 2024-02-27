// copied from 2sxc-ui app/installer
export interface InstallSpecs {
  installedApps?: InstalledApp[] | string[];
  rules?: InstallRule[];
}

// copied from 2sxc-ui app/installer
export interface InstallSettings extends InstallSpecs {
  remoteUrl: string;
}

// copied from 2sxc-ui app/installer
export interface InstalledApp {
  name: string;
  version: string;
  guid: string;
}

// copied from 2sxc-ui app/installer
export interface InstallRule {
  target: string;
  mode: string;
  appGuid: string;
  url: string;
}

// copied from 2sxc-ui app/installer
export interface InstallPackage {
  displayName: string;
  url: string;
}

// copied from 2sxc-ui app/installer
export interface SpecsForInstaller {
  action: 'specs';
  data: InstallSpecs;
}

// copied from 2sxc-ui app/installer
export interface CrossWindowMessage {
  action: string;
  moduleId: string | number; // probably string, must safely convert to Number()
  packages: InstallPackage[];
}