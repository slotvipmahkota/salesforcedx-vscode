/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  ExtensionContext,
  Memento,
  workspace,
  WorkspaceConfiguration
} from 'vscode';

export class WorkspaceUtils {
  private extensionContext: ExtensionContext | undefined;
  private static _instance: WorkspaceUtils;

  public static get instance() {
    console.log('workspaceUtils.ts - enter instance()');
    if (WorkspaceUtils._instance === undefined) {
      WorkspaceUtils._instance = new WorkspaceUtils();
    }
    return WorkspaceUtils._instance;
  }

  public init(extensionContext: ExtensionContext) {
    console.log('workspaceUtils.ts - enter init()');
    this.extensionContext = extensionContext;
  }

  public getGlobalStore(): Memento | undefined {
    console.log('workspaceUtils.ts - enter getGlobalStore()');
    return this.extensionContext && this.extensionContext.globalState;
  }

  public getWorkspaceSettings(): WorkspaceConfiguration {
    console.log('workspaceUtils.ts - enter getWorkspaceSettings()');
    return workspace.getConfiguration('salesforcedx-vscode-lwc');
  }
}
