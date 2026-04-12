/**
 * Vite fails when the project path contains "#" (e.g. DoAnC#).
 * Map a free drive letter to this folder so the dev server sees a safe path.
 *
 * With SUBST, Vite can restart forever ("vite.config.js changed") because the
 * same files are visible under two paths. We load the config once and pass
 * configFile: false so the dev server does not watch vite.config.js for restarts.
 */
import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const viteCli = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');

function trySubst(drive) {
  execSync(`subst ${drive}: "${projectRoot}"`, { stdio: 'pipe', windowsHide: true });
}

function substOff(drive) {
  try {
    execSync(`subst ${drive}: /d`, { stdio: 'pipe', windowsHide: true });
  } catch {
    /* ignore */
  }
}

function pickDrive() {
  const fromEnv = process.env.VNGO_ADMIN_SUBST;
  if (fromEnv && /^[A-Za-z]$/.test(fromEnv)) return fromEnv.toUpperCase();

  for (const d of ['V', 'W', 'U', 'T', 'S', 'R', 'Q', 'P', 'Z', 'Y', 'X']) {
    try {
      trySubst(d);
      return d;
    } catch {
      /* letter in use or subst failed */
    }
  }
  return null;
}

function cleanup(drive) {
  if (drive) substOff(drive);
}

const needsSubst =
  process.platform === 'win32' && (projectRoot.includes('#') || projectRoot.includes('%23'));

let substDrive = null;

if (needsSubst) {
  substDrive = pickDrive();
  if (!substDrive) {
    console.error(
      '[admin-web] Path contains "#" but SUBST could not map a drive. Free a letter or set VNGO_ADMIN_SUBST=V'
    );
    process.exit(1);
  }
  console.error(`[admin-web] Using SUBST ${substDrive}: → ${projectRoot} (workaround for # in path)`);
}

const cwd = substDrive ? `${substDrive}:\\` : projectRoot;

function runSpawn() {
  const child = spawn(process.execPath, [viteCli], {
    cwd,
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });
  const onStop = () => {
    child.kill('SIGINT');
  };
  process.on('SIGINT', onStop);
  process.on('SIGTERM', onStop);
  child.on('close', (code, signal) => {
    cleanup(substDrive);
    process.exit(code ?? (signal ? 1 : 0));
  });
}

async function runProgrammatic() {
  process.chdir(cwd);
  const { createServer, loadConfigFromFile, mergeConfig } = await import('vite');

  const configEnv = {
    mode: 'development',
    command: 'serve',
    isSsrBuild: false,
    isPreview: false,
  };

  const loaded = await loadConfigFromFile(
    configEnv,
    path.join(cwd, 'vite.config.js'),
    cwd
  );

   if (!loaded) {
    console.error('[admin-web] Could not load vite.config.js');
    cleanup(substDrive);
    process.exit(1);
  }

  // vite.config sets root to __dirname (real path). Paths with "#" break file URLs
  // (everything after # is treated as a fragment). Force project root to SUBST drive.
  const safeRoot = path.resolve(cwd);
  const merged = mergeConfig(loaded.config, {
    configFile: false,
    root: safeRoot,
  });
  merged.server ??= {};
  merged.server.fs ??= {};
  // mergeConfig concatenates fs.allow arrays; drop any path containing "#"
  merged.server.fs.allow = [safeRoot];

  const server = await createServer(merged);

  const shutdown = async () => {
    try {
      await server.close();
    } finally {
      cleanup(substDrive);
      process.exit(0);
    }
  };

  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());

  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({ print: true });
}

if (needsSubst) {
  runProgrammatic().catch((err) => {
    console.error(err);
    cleanup(substDrive);
    process.exit(1);
  });
} else {
  runSpawn();
}
