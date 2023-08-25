/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { PlatformName } from '../commands/forceLightningLwcPreview';
import { WorkspaceUtils } from '../util/workspaceUtils';

export class PreviewService {
  private rememberDeviceKey = 'preview.rememberDevice';
  private logLevelKey = 'preview.logLevel';
  private defaultLogLevel = 'warn';

  private static _instance: PreviewService;

  public static get instance() {
    console.log('previewService.ts - enter instance()');
    if (PreviewService._instance === undefined) {
      PreviewService._instance = new PreviewService();
    }
    return PreviewService._instance;
  }

  public getRememberedDevice(platform: keyof typeof PlatformName): string {
    console.log('previewService.ts - enter getRememberedDevice()');
    const store = WorkspaceUtils.instance.getGlobalStore();
    if (store === undefined) {
      return '';
    }

    return store.get(`last${platform}Device`) || '';
  }

  public updateRememberedDevice(
    platform: keyof typeof PlatformName,
    deviceName: string
  ): void {
    console.log('previewService.ts - enter updateRememberedDevice()');
    const store = WorkspaceUtils.instance.getGlobalStore();
    if (store !== undefined) {
      store.update(`last${platform}Device`, deviceName);
    }
  }

  public isRememberedDeviceEnabled(): boolean {
    console.log('previewService.ts - enter isRememberedDeviceEnabled()');
    return WorkspaceUtils.instance
      .getWorkspaceSettings()
      .get(this.rememberDeviceKey, false);
  }

  public getLogLevel(): string {
    console.log('previewService.ts - enter getLogLevel()');
    return (
      WorkspaceUtils.instance.getWorkspaceSettings().get(this.logLevelKey) ||
      this.defaultLogLevel
    );
  }
}
