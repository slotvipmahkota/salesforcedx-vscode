/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { execSync } from 'child_process';
import * as semver from 'semver';

export enum CliStatusEnum {
  SFv2 = 1,
  outdatedSFDXVersion = 2,
  onlySFv1 = 3,
  cliNotInstalled = 4,
  bothSFDXAndSFInstalled = 5,
  SFDXv7Valid = 6
}

const issueNumber = '5340';
export class CliVersionStatus {
  public getCliVersion(isSfdx: boolean): string {
    try {
      const result = execSync('where sfdx');
      console.log(
        '*** result of where sfdx = [' + result.toString() + '] ',
        issueNumber
      );
    } catch {}

    try {
      const result = execSync('which sfdx');
      console.log(
        '*** result of which sfdx = [' + result.toString() + '] ',
        issueNumber
      );
    } catch {}

    try {
      const result = execSync('where sf');
      console.log(
        '*** result of where sf = [' + result.toString() + '] ',
        issueNumber
      );
    } catch {}

    try {
      const result = execSync('which sf');
      console.log(
        '*** result of which sf = [' + result.toString() + '] ',
        issueNumber
      );
    } catch {}

    try {
      const result = execSync(`${isSfdx ? 'sfdx' : 'sf'} --version`);
      console.log('*** result = [' + result.toString() + '] ', issueNumber);
      return result.toString();
    } catch {
      console.log('no cli! ', issueNumber);
      return 'No CLI';
    }
  }

  public parseCliVersion(cliVersion: string): string {
    const pattern = /(?:sfdx-cli\/|@salesforce\/cli\/)(\d+\.\d+\.\d+)/;
    const match = pattern.exec(cliVersion);
    if (match === undefined) {
      console.log('match is undefined', issueNumber);
    } else {
      console.log('*** match = [' + match?.toString() + '] ', issueNumber);
    }
    return match ? match[1] : '0.0.0';
  }

  public validateCliInstallationAndVersion(
    sfdxCliVersionString: string,
    sfCliVersionString: string
  ): CliStatusEnum {
    console.log(
      '(((( sfdxCliVersionString = [' + sfdxCliVersionString + '] ',
      issueNumber
    );
    console.log(
      '(((( sfCliVersionString = [' + sfCliVersionString + '] ',
      issueNumber
    );

    // Case 1: Neither SFDX CLI nor SF CLI is installed
    if (
      semver.satisfies(sfdxCliVersionString, '0.0.0') &&
      semver.satisfies(sfCliVersionString, '0.0.0')
    ) {
      console.log('CLI not installed ', issueNumber);
      return CliStatusEnum.cliNotInstalled;
    }

    // Case 2: Only SF CLI (v1) is installed (SF v1 cannot be used because it does not map sf to sfdx)
    if (
      semver.satisfies(sfdxCliVersionString, '0.0.0') &&
      semver.satisfies(sfCliVersionString, '1.x')
    ) {
      console.log('only SF v1 is installed ', issueNumber);
      return CliStatusEnum.onlySFv1;
    }

    // Case 3: Both SFDX CLI (v7) and SF CLI (v2) are installed at the same time
    if (
      semver.satisfies(sfCliVersionString, '2.x') &&
      !semver.satisfies(sfdxCliVersionString, sfCliVersionString)
    ) {
      console.log('both sfdx v7 and sf v2 installed ', issueNumber);
      return CliStatusEnum.bothSFDXAndSFInstalled;
    }

    const minSFDXVersion = '7.193.2';
    if (semver.satisfies(sfCliVersionString, '<2.0.0')) {
      console.log('SF CLI is less than v2', issueNumber);
      if (semver.satisfies(sfdxCliVersionString, `<${minSFDXVersion}`)) {
        // Case 4: Outdated SFDX CLI version is installed
        console.log(
          'outdated SFDX CLI version [' + sfdxCliVersionString + '] ',
          issueNumber
        );
        return CliStatusEnum.outdatedSFDXVersion;
      } else {
        // Case 5: Valid SFDX v7 version is installed
        console.log('valid SFDX v7 ', issueNumber);
        return CliStatusEnum.SFDXv7Valid;
      }
    }

    // Case 6: SF v2 is installed
    console.log('SF v2 is installed ', issueNumber);
    return CliStatusEnum.SFv2;
  }
}
