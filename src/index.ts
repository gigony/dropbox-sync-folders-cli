#!/usr/bin/env node

import chalk from 'chalk';
import clear from 'clear';
import program from 'commander';
import { config as envconfig } from 'dotenv-flow';
import { DropboxSyncFolder } from 'dropbox-sync-folders';
import figlet from 'figlet';

// import path from 'path'

// load environment varaibles
envconfig();

clear();

console.log(chalk.red(figlet.textSync('dropbox-sync', { horizontalLayout: 'full' })));

const version = process.env.npm_package_version || '0.1.0';

program
  .version(version)
  .description('A CLI for syncing dropbox folders from multiple accounts')
  .option('-c, --config', 'config file (.json)')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

const config: any = {
  accounts: [
    {
      accessToken: process.env.DROPBOX_ACCESSTOKEN_PERSON,
      mappings: [
        {
          dst: 'src/dropbox',
          src: '',
        },
      ],
      name: 'PersonalDropbox',
    },
    {
      accessToken: process.env.DROPBOX_ACCESSTOKEN_NVIDIA,
      mappings: [
        {
          dst: 'src/dropbox/nvidia/plan',
          src: '/Work/Plan',
        },
      ],
      name: 'NvidiaDropbox',
    },
  ],
  verbose: true,
  waitInterval: 30,
};

const dropboxSync = new DropboxSyncFolder(config);

dropboxSync.downloadFiles().then(_result => {
  // watching at background
  const backgroundTask = new Promise(async () => {
    while (true) {
      try {
        const succeed = await dropboxSync.waitChanges('*');
        if (!succeed) {
          return;
        }
        await dropboxSync.downloadFiles('*');
      } catch (err) {
        console.error(err);
      }
    }
  });
  backgroundTask.then(); // do nothing to prevent 'unused expression' lint error
});
