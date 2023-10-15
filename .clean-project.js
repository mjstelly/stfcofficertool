const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure the script is being run from the correct directory
const projectRoot = path.resolve(__dirname);
process.chdir(projectRoot);

const commands = [
  'watchman watch-del-all',
  // Check for the existence of yarn.lock before running yarn commands
  fs.existsSync('yarn.lock') ? 'yarn cache clean' : null,
  'rm -rf ios/build',
  'rm -rf android/build',
  'npx pod-install',
].filter(Boolean); // Remove null values

// If node_modules exist, delete them and reinstall
if (fs.existsSync('node_modules')) {
  commands.unshift('rm -rf node_modules', 'yarn install');
} else {
  commands.unshift('yarn install');
}

commands.forEach(command => {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, {stdio: 'inherit'});
  } catch (error) {
    console.error(`An error occurred while executing ${command}:`, error);
    process.exit(1);
  }
});
