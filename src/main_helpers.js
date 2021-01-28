const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { app } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const { getLogger } = require('./logger');

const logger = getLogger(__filename.split('/').slice(-1)[0]);
/**
 * Find paths to local invest executeable under dev or production environments.
 *
 * @param {boolean} isDevMode - a boolean designating dev mode or not.
 * @returns {Promise} Resolves array w/ invest binary path & version strings.
 */
export function findInvestBinaries(isDevMode) {
  return new Promise(resolve => {
    // Binding to the invest server binary:
    let investExe;
    const ext = (process.platform === 'win32') ? '.exe' : '';

    // A) look for a local registry of available invest installations
    const investRegistryPath = path.join(
      app.getPath('userData'), 'invest_registry.json'
    );
    if (fs.existsSync(investRegistryPath)) {
      const investRegistry = JSON.parse(fs.readFileSync(investRegistryPath));
      const activeVersion = investRegistry.active;
      investExe = investRegistry.registry[activeVersion].invest;

    // B) check for dev mode and an environment variable from dotenv
    } else if (isDevMode) {
      // If no dotenv vars are set, default to where this project's
      // build process places the binaries.
      investExe = `${process.env.INVEST || 'build/invest/invest'}${ext}`;

    // C) point to binaries included in this app's installation.
    } else {
      const binaryPath = path.join(process.resourcesPath, 'invest');
      investExe = path.join(binaryPath, `invest${ext}`);
    }
    let investVersion;
    try {
      investVersion = execFileSync(investExe, ['--version']);
    } catch (error) {
      logger.error(error);
      throw error;
    }
    logger.info(`Found invest binaries ${investExe} for version ${investVersion}`);
    resolve([investExe, `${investVersion}`.trim(os.EOL)]);
  });
}

/**
 * Spawn a child process running the Python Flask app.
 *
 * @param  {string} investExe - path to executeable that launches flask app.
 * @returns {undefined}
 */
export function createPythonFlaskProcess(investExe) {
  if (investExe) {
    const pythonServerProcess = spawn(
      path.basename(investExe),
      ['serve', '--port', process.env.PORT],
      {
        env: {
          PATH: path.dirname(investExe),
        },
      }
    );

    logger.debug(`Started python process as PID ${pythonServerProcess.pid}`);
    pythonServerProcess.stdout.on('data', (data) => {
      logger.debug(`${data}`);
    });
    pythonServerProcess.stderr.on('data', (data) => {
      logger.debug(`${data}`);
    });
    pythonServerProcess.on('error', (err) => {
      logger.error(err.stack);
      logger.error(
        `The flask app ${investExe} crashed or failed to start
         so this application must be restarted`
      );
      throw err;
    });
    pythonServerProcess.on('close', (code, signal) => {
      logger.debug(`Flask process terminated with code ${code} and signal ${signal}`);
    });
  } else {
    logger.error('no existing invest installations found');
  }
}
