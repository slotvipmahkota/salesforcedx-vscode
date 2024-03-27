/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Logger } from '@salesforce/core';
import { ILogger } from '@salesforce/vscode-service-provider';

export const getLoggerInstance = (instanceName: string): ILogger => {
  const logger = Logger.childFromRoot(instanceName);
  return logger;
};
