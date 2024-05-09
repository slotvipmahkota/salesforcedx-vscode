/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const { build } = require('esbuild');
const esbuildPluginPino = require('esbuild-plugin-pino');
const fs = require('fs').promises;

const sharedConfig = {
  bundle: true,
  format: 'cjs',
  platform: 'node',
  external: [
    'vscode',
    'applicationinsights',
    'shelljs',
    'node-gyp/bin/node-gyp.js'
    // '@salesforce/core-bundle',
    // '@salesforce/source-tracking-bundle',
    // '@salesforce/templates-bundle'
    // '@salesforce/source-deploy-retrieve-bundle'
  ],
  minify: true,
  keepNames: true,
  plugins: [
    esbuildPluginPino({ transports: ['pino-pretty'] })
  ]
};

// copy core-bundle/lib/transformStream.js to dist if core-bundle is included
const copyFiles = async (src, dest) => {
  try {
    // Extract the directory path from the destination path
    const dir = require('path').dirname(dest);

    // Ensure the destination directory exists
    await fs.mkdir(dir, { recursive: true });

    // Copy the file
    await fs.copyFile(src, dest);
    console.log(`File was copied from ${src} to ${dest}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const srcPath = '../../node_modules/@salesforce/core-bundle/lib/transformStream.js';
const destPath = './dist/transformStream.js';

const nodeGypSrc = '../../node_modules/yeoman-environment/node_modules/node-gyp/bin/node-gyp.js';
const nodeGypDest = './dist/node-gyp.js';

const resolveNodeGypRef = async () => {
  const entryPath = 'dist/index.js';
  let bundledEntryPoint = await fs.readFile(entryPath, 'utf8');
  const searchString = /node-gyp\/bin\/node-gyp\.js/g;
  const replacementString = './node-gyp.js';
  bundledEntryPoint = bundledEntryPoint.replace(searchString, replacementString);
  await fs.writeFile(entryPath, bundledEntryPoint, 'utf8');
  console.log('Redirect reference of node-gyp to dist successfully');
};

(async () => {
  await build({
    ...sharedConfig,
    entryPoints: ['./src/index.ts'],
    outdir: 'dist'
  });
})()
  .then(async () => {
    await copyFiles(srcPath, destPath);
    await copyFiles(nodeGypSrc, nodeGypDest);
    await resolveNodeGypRef();
  })
  .catch(() => process.exit(1));