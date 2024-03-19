/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AuthFields, AuthInfo, OrgAuthorization } from '@salesforce/core';
import {
  CancelResponse,
  ConfigUtil,
  ContinueResponse,
  OrgUserInfo
} from '@salesforce/salesforcedx-utils-vscode';
import * as vscode from 'vscode';
import { WorkspaceContext } from '../context';
import { nls } from '../messages';
import { OrgAuthInfo } from '../util';

export class OrgList implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      49
    );
    this.statusBarItem.command = 'sfdx.set.default.org';
    this.statusBarItem.tooltip = nls.localize('status_bar_org_picker_tooltip');
    this.statusBarItem.show();

    WorkspaceContext.getInstance().onOrgChange((orgInfo: OrgUserInfo) =>
      this.displayDefaultUsername(orgInfo.alias || orgInfo.username)
    );
    const { username, alias } = WorkspaceContext.getInstance();
    this.displayDefaultUsername(alias || username);
  }

  private displayDefaultUsername(defaultUsernameOrAlias?: string) {
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - enter displayDefaultUsername()');
    if (defaultUsernameOrAlias) {
      this.statusBarItem.text = `$(plug) ${defaultUsernameOrAlias}`;
    } else {
      this.statusBarItem.text = nls.localize('missing_default_org');
    }
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - this.statusBarItem.text = [' + this.statusBarItem.text + ']');
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit displayDefaultUsername()');
  }

  public async getOrgAuthorizations(): Promise<OrgAuthorization[]> {
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - enter getOrgAuthorizations()');
    const orgAuthorizations = await AuthInfo.listAllAuthorizations();
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - orgAuthorizations = [' + JSON.stringify(orgAuthorizations) + ']');
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit getOrgAuthorizations()');
    return orgAuthorizations;
  }

  public async getAuthFieldsFor(username: string): Promise<AuthFields> {
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - enter getAuthFieldsFor()');
    const authInfo: AuthInfo = await AuthInfo.create({
      username
    });
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - authInfo.getFields() = [' + JSON.stringify(authInfo.getFields()) + ']');
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit getAuthFieldsFor()');
    return authInfo.getFields();
  }

  public async filterAuthInfo(
    orgAuthorizations: OrgAuthorization[]
  ): Promise<string[]> {
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - enter filterAuthInfo()');
    const defaultDevHubUsername = await OrgAuthInfo.getDevHubUsername();
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - defaultDevHubUsername = [' + defaultDevHubUsername + ']');

    const authList = [];
    const today = new Date();
    for (const orgAuth of orgAuthorizations) {
      // When this is called right after logging out of an org, there can
      // still be a cached Org Auth in the list with a "No auth information found"
      // error. This warning prevents that error from stopping the process, and
      // should help in debugging if there are any other Org Auths with errors.
      if (orgAuth.error) {
        console.warn(
          `Org Auth for username: ${orgAuth.username} has an error: ${orgAuth.error}`
        );
        continue;
      }
      const authFields: AuthFields = await this.getAuthFieldsFor(
        orgAuth.username
      );
      if (authFields && 'scratchAdminUsername' in authFields) {
        // non-Admin scratch org users
        continue;
      }
      if (
        authFields &&
        'devHubUsername' in authFields &&
        authFields.devHubUsername !== defaultDevHubUsername
      ) {
        // scratch orgs parented by other (non-default) devHub orgs
        continue;
      }
      const isExpired =
        authFields && authFields.expirationDate
          ? today >= new Date(authFields.expirationDate)
          : false;

      const aliases = await ConfigUtil.getAllAliasesFor(orgAuth.username);
      let authListItem =
        aliases && aliases.length > 0
          ? `${aliases.join(',')} - ${orgAuth.username}`
          : orgAuth.username;

      if (isExpired) {
        authListItem += ` - ${nls.localize(
          'org_expired'
        )} ${String.fromCodePoint(0x274c)}`; // cross-mark
      }

      authList.push(authListItem);
    }
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - authList = [' + JSON.stringify(authList) + ']');
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit filterAuthInfo()');
    return authList;
  }

  public async updateOrgList(): Promise<string[]> {
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - enter updateOrgList()');
    const orgAuthorizations = await this.getOrgAuthorizations();
    if (orgAuthorizations && orgAuthorizations.length === 0) {
      console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - length = 0, exit updateOrgList()');
      return [];
    }
    const authUsernameList = await this.filterAuthInfo(orgAuthorizations);
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - authUsernameList = [' + JSON.stringify(authUsernameList) + ']');
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - regular case, exit updateOrgList()');
    return authUsernameList;
  }

  public async setDefaultOrg(): Promise<CancelResponse | ContinueResponse<{}>> {
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - enter setDefaultOrg()');
    let quickPickList = [
      '$(plus) ' + nls.localize('org_login_web_authorize_org_text'),
      '$(plus) ' + nls.localize('org_login_web_authorize_dev_hub_text'),
      '$(plus) ' + nls.localize('org_create_default_scratch_org_text'),
      '$(plus) ' + nls.localize('org_login_access_token_text'),
      '$(plus) ' + nls.localize('org_list_clean_text')
    ];

    const authInfoList = await this.updateOrgList();
    quickPickList = quickPickList.concat(authInfoList);

    const selection = await vscode.window.showQuickPick(quickPickList, {
      placeHolder: nls.localize('org_select_text')
    });

    if (!selection) {
      console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit setDefaultOrg() - case CANCEL');
      return { type: 'CANCEL' };
    }
    switch (selection) {
      case '$(plus) ' + nls.localize('org_login_web_authorize_org_text'): {
        vscode.commands.executeCommand('sfdx.org.login.web');
        console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit setDefaultOrg() - case sfdx.org.login.web');
        return { type: 'CONTINUE', data: {} };
      }
      case '$(plus) ' + nls.localize('org_login_web_authorize_dev_hub_text'): {
        vscode.commands.executeCommand('sfdx.org.login.web.dev.hub');
        console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit setDefaultOrg() - case sfdx.org.login.web.dev.hub');
        return { type: 'CONTINUE', data: {} };
      }
      case '$(plus) ' + nls.localize('org_create_default_scratch_org_text'): {
        vscode.commands.executeCommand('sfdx.org.create');
        console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit setDefaultOrg() - case sfdx.org.create');
        return { type: 'CONTINUE', data: {} };
      }
      case '$(plus) ' + nls.localize('org_login_access_token_text'): {
        vscode.commands.executeCommand('sfdx.org.login.access.token');
        console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit setDefaultOrg() - case sfdx.org.login.access.token');
        return { type: 'CONTINUE', data: {} };
      }
      case '$(plus) ' + nls.localize('org_list_clean_text'): {
        vscode.commands.executeCommand('sfdx.org.list.clean');
        console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit setDefaultOrg() - case sfdx.org.list.clean');
        return { type: 'CONTINUE', data: {} };
      }
      default: {
        const usernameOrAlias = selection.split(' - ', 1);
        vscode.commands.executeCommand('sfdx.config.set', usernameOrAlias);
        console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit setDefaultOrg() - case DEFAULT');
        return { type: 'CONTINUE', data: {} };
      }
    }
  }

  public dispose() {
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - enter dispose()');
    this.statusBarItem.dispose();
    console.log('salesforcedx-vscode-core/src/orgPicker/orgList.ts - exit dispose()');
  }
}
