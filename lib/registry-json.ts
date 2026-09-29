/**
 * The shape of a built registry item (`public/r/<name>.json`), as far as the
 * docs read it: its files and what it depends on.
 */
export interface RegistryFileJson {
  path: string;
  type: string;
  content: string;
  /** Where the file installs, when it isn't beside the main file. */
  target?: string;
}

export interface RegistryItemJson {
  name?: string;
  type?: string;
  files?: RegistryFileJson[];
  dependencies?: string[];
  registryDependencies?: string[];
}
