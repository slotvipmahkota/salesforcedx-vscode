/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  ContinueResponse,
  LocalComponent
} from '@salesforce/salesforcedx-utils-vscode';
import {
  ComponentSet,
  RetrieveResult
} from '@salesforce/source-deploy-retrieve';
import { ComponentLike } from '@salesforce/source-deploy-retrieve/lib/src/resolve/types';
import * as path from 'path';
import * as vscode from 'vscode';
import { nls } from '../../messages';
import { SfdxPackageDirectories } from '../../sfdxProject';
import { workspaceUtils } from '../../util';
import { RetrieveExecutor } from '../baseDeployRetrieve';
import { logger } from '../../util/logger';

export class LibraryRetrieveSourcePathExecutor extends RetrieveExecutor<
  LocalComponent[]
> {
  private openAfterRetrieve: boolean;

  constructor(openAfterRetrieve = false) {
    super(
      nls.localize('force_source_retrieve_text'),
      'force_source_retrieve_beta'
    );
    logger.debug('LibraryRetrieveSourcePathExecutor');
    this.openAfterRetrieve = openAfterRetrieve;
  }

  protected async getComponents(
    response: ContinueResponse<LocalComponent[]>
  ): Promise<ComponentSet> {
    logger.debug('getComponents');
    const toRetrieve = new ComponentSet(
      response.data.map(lc => ({ fullName: lc.fileName, type: lc.type }))
    );
    logger.debug('getComponents 1', { toRetrieve });
    const packageDirs = await SfdxPackageDirectories.getPackageDirectoryFullPaths();
    logger.debug('getComponents 2', { packageDirs });
    const localSourceComponents = ComponentSet.fromSource({
      fsPaths: packageDirs,
      include: toRetrieve
    });
    logger.debug('getComponents 3');
    for (const component of localSourceComponents) {
      toRetrieve.add(component);
    }
    return toRetrieve;
  }

  protected async postOperation(result: RetrieveResult | undefined) {
    await super.postOperation(result);
    logger.debug('LibraryRetrieveSourcePathExecutor.postOperation 1');

    // assumes opening only one component
    if (result && this.openAfterRetrieve) {
      logger.debug('LibraryRetrieveSourcePathExecutor.postOperation 2');
      const componentToOpen = result.components.getSourceComponents().first();
      logger.debug('LibraryRetrieveSourcePathExecutor.postOperation 3');
      if (componentToOpen) {
        const dirPath =
          (await SfdxPackageDirectories.getDefaultPackageDir()) || '';
        logger.debug('LibraryRetrieveSourcePathExecutor.postOperation 3');
        const defaultOutput = path.join(
          workspaceUtils.getRootWorkspacePath(),
          dirPath
        );
        logger.debug('LibraryRetrieveSourcePathExecutor.postOperation 4');
        const compSet = ComponentSet.fromSource(defaultOutput);
        logger.debug('LibraryRetrieveSourcePathExecutor.postOperation 5');
        await this.openResources(this.findResources(componentToOpen, compSet));
        logger.debug('LibraryRetrieveSourcePathExecutor.postOperation 7');
      }
    }
  }

  private findResources(
    filter: ComponentLike,
    compSet?: ComponentSet
  ): string[] {
    logger.debug('LibraryRetrieveSourcePathExecutor.findResources 1');
    if (compSet && compSet.size > 0) {
      logger.debug('LibraryRetrieveSourcePathExecutor.findResources 2');
      const oneComp = compSet.getSourceComponents(filter).first();
      logger.debug('LibraryRetrieveSourcePathExecutor.findResources 3');
      const filesToOpen = [];
      if (oneComp) {
        if (oneComp.xml) {
          filesToOpen.push(oneComp.xml);
        }

        for (const filePath of oneComp.walkContent()) {
          filesToOpen.push(filePath);
        }
      }
      logger.debug('LibraryRetrieveSourcePathExecutor.findResources 4');
      return filesToOpen;
    }
    logger.debug('LibraryRetrieveSourcePathExecutor.findResources 5');
    return [];
  }

  private async openResources(filesToOpen: string[]): Promise<void> {
    logger.debug('LibraryRetrieveSourcePathExecutor.openResources 1');
    for (const file of filesToOpen) {
      const showOptions: vscode.TextDocumentShowOptions = {
        preview: false
      };
      const document = await vscode.workspace.openTextDocument(file);
      vscode.window.showTextDocument(document, showOptions);
    }
    logger.debug('LibraryRetrieveSourcePathExecutor.openResources 2');
  }
}
