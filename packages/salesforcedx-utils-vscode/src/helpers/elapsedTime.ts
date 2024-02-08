/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable prefer-arrow/prefer-arrow-functions */

import * as vscode from 'vscode';
import { telemetryService } from '../telemetry';

const isTraceEnabled = vscode.workspace.getConfiguration().get('salesforcedx-vscode-core.enableElapsedTimeTelemetry');

/**
 * This decorator can be use to annotate functions in a class, so that the elapsed time
 * spent in the class can be sent to telemetry.
 *
 * @param target
 * @param propertyKey
 * @param descriptor
 * @returns
 */
export function elapsedTime(
  target: object,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const className = target.constructor.name;
    const start = process.hrtime();
    let result;
    let error;

    try {
      result = await originalMethod.apply(this, args);
    } catch (err) {
      error = err;
    }

    const diff = process.hrtime(start);
    const elapsed = diff[0] * 1e3 + diff[1] / 1e6; // convert to milliseconds

    if (isTraceEnabled) {
      telemetryService.sendEventData(
        'sf-vscode-elapsed-time',
        {
          className,
          methodName: propertyKey,
          error: error ? error.message : undefined
        },
        {
          elapsedTime: elapsed
        }
      );
    }

    if (error) {
      throw error;
    }

    return result;
  };

  return descriptor;
}