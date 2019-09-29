#!/usr/bin/env node

import chalk from 'chalk';
import clear from 'clear';
import program from 'commander';
import { config as envconfig } from 'dotenv-flow';
import { DropboxSyncFolder } from 'dropbox-sync-folders';
import figlet from 'figlet';
import fs from 'fs';

import path from 'path';

// load environment varaibles
envconfig();

const version = process.env.npm_package_version || '0.1.0';

program
  .version(version)
  .description('A CLI for syncing dropbox folders from multiple accounts')
  .option('-c, --config <config_path>', 'config file (.json)');

program
  .command('download [account]')
  .alias('dn')
  .description('download files from the specified account')
  .option('--save', 'Store cursor before exit')
  .action((account: string, cmdObj: any) => {
    const configPath = path.resolve(program.config);
    if (!fs.existsSync(configPath)) {
      console.error(`'${path.resolve(program.config)}' doesn't exist!`);
      process.exit(1);
    }
    import(configPath)
      .then(async config => {
        const dropboxSync = new DropboxSyncFolder(config);
        account = account || '*';
        await dropboxSync.downloadFiles(account);
        if (cmdObj.save) {
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        process.exit(0);
      })
      .catch(async () => {
        console.error(`'${configPath}' has an invalid configuration!`);
        process.exit(1);
      });
  });

program
  .command('wait [account]')
  .alias('dn')
  .description('download files from the specified account')
  .option('--save', 'Store cursor before exit')
  .action((account: string, cmdObj: any) => {
    const configPath = path.resolve(program.config);
    if (!fs.existsSync(configPath)) {
      console.error(`'${configPath}' doesn't exist!`);
      process.exit(1);
    }
    import(configPath)
      .then(async config => {
        const dropboxSync = new DropboxSyncFolder(config);
        account = account || '*';
        await dropboxSync.waitChanges(account);
        if (cmdObj.save) {
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        process.exit(0);
      })
      .catch(async () => {
        console.error(`'${configPath}' has an invalid configuration!`);
        process.exit(1);
      });
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  clear();
  console.log(chalk.red(figlet.textSync('dropbox-sync', { horizontalLayout: 'full' })));

  program.outputHelp();
  process.exit(1);
}
