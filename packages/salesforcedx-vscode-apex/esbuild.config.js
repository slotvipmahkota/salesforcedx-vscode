/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
const fs = require('fs').promises;

// Define your build settings
esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    format: 'cjs',
    platform: 'node',
    minify: true,
    external: [
        'vscode',
        // '@salesforce/core',
        'applicationinsights',
        'shelljs',
        '@salesforce/source-deploy-retrieve-bundle',
        '@salesforce/source-tracking-bundle'
    ]
}).then(() => {
    console.log('Build completed successfully');
}).catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
});

// copy core-bundle/lib/transformStream.js to dist if core-bundle is included
// copy core-bundle/lib/transformStream.js to dist if core-bundle is included
const copyFiles = async (src, dest) => {
  try {
    // Copy the file
    await fs.copyFile(src, dest);
    console.log(`File was copied from ${src} to ${dest}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const srcPath = '../../node_modules/@salesforce/core-bundle/lib/transformStream.js';
const destPath = './dist/transformStream.js';

(async () => {
  await copyFiles(srcPath, destPath);
})()
.catch(() => process.exit(1));