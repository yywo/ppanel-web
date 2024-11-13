import { spawn } from 'child_process';
import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current script
const scriptDir = dirname(fileURLToPath(import.meta.url));
// Set the target directory to `../packages/shadcn` relative to the script directory
const targetDir = resolve(scriptDir, '../packages/shadcn');

// Define replacements based on the directory type
const replacementsByDirectory = {
  components: [
    { from: '@/lib/utils', to: '../../lib/utils' },
    { from: '@/components/ui', to: '.' },
    { from: '@/hooks', to: '../../hooks' },
  ],
  hooks: [{ from: '@/components', to: '../components' }],
};

// Recursively fetch all files in a directory
async function getAllFiles(dir) {
  let files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // If directory, recursively get files inside it
      files = [...files, ...(await getAllFiles(fullPath))];
    } else {
      // If file, add to the files array
      files.push(fullPath);
    }
  }
  return files;
}

// Perform replacements in a single file
async function replaceInFile(filePath) {
  let content = await readFile(filePath, 'utf8');
  let modified = false;

  // Determine the appropriate replacement set based on the directory
  let replacements;
  if (filePath.includes(`${join('src', 'components')}`)) {
    replacements = replacementsByDirectory.components;
  } else if (filePath.includes(`${join('src', 'hooks')}`)) {
    replacements = replacementsByDirectory.hooks;
  } else {
    replacements = replacementsByDirectory.default;
  }

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      // Replace all occurrences of `from` with `to`
      content = content.replace(new RegExp(from, 'g'), to);
      modified = true;
    }
  });

  if (modified) {
    await writeFile(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Run replacements in all files within a directory
async function replaceInFiles(dir) {
  try {
    const files = await getAllFiles(dir);
    for (const file of files) {
      await replaceInFile(file);
    }
    console.log('All files updated successfully.');
  } catch (error) {
    console.error('Error updating files:', error.message);
  }
}

// Fetch and format MagicUI component URLs
// Components Docs: https://magicui.design/docs
async function fetchMagicUIUrls() {
  try {
    const response = await fetch('https://magicui.design/r/index.json');
    if (!response.ok) {
      throw new Error(`Error fetching MagicUI component list: ${response.statusText}`);
    }
    const components = await response.json();

    if (!Array.isArray(components)) {
      throw new Error('Invalid format for MagicUI component list.');
    }
    return components.map((item) => `https://magicui.design/r/${item.name}`);
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);

    process.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(`stdout: ${message}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`Process completed successfully with code: ${code}`);
        resolve();
      } else {
        reject(new Error(`Process exited with code: ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });

    process.stdin.end();
  });
}

async function installComponents() {
  try {
    console.log('Installing all default Shadcn components in directory:', targetDir);

    // Step 1: Install all default Shadcn components
    await runCommand('npx', ['shadcn@latest', 'add', '-y', '-a', '-o'], {
      cwd: targetDir,
      shell: true,
    });

    console.log('Fetching MagicUI component URLs...');
    const magicComponentUrls = await fetchMagicUIUrls();

    console.log('Installing MagicUI components in directory:', targetDir);
    console.log('Fetched component URLs:', magicComponentUrls);
    // Step 2: Install MagicUI components
    await runCommand('npx', ['shadcn@latest', 'add', '-y', '-a', '-o', ...magicComponentUrls], {
      cwd: targetDir,
      shell: true,
    });

    console.log('All components successfully installed');

    // Step 3: Replace paths in installed files
    const targetSrcDir = join(targetDir, 'src');
    console.log('Replacing paths in target directory:', targetSrcDir);
    await replaceInFiles(targetSrcDir);
  } catch (error) {
    console.error('An error occurred during the installation process:', error.message);
    console.error(error.stack);
  }
}

// Run the installation function
installComponents();
