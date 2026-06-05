/**
 * Pre-build cleanup — removes .next using the native OS command.
 *
 * Why not fs.rmSync?  On Windows, OneDrive converts stale .next files to
 * cloud-only reparse points.  Node's fs module calls readlink() on every
 * entry before removing it; that syscall returns EINVAL on OneDrive stubs
 * and the whole delete fails.  Windows' own `rmdir /s /q` skips readlink
 * entirely and deletes reparse points cleanly.
 *
 * On macOS / Linux (including Vercel CI) we fall back to `rm -rf`.
 */
const { execSync } = require("child_process");
const { existsSync } = require("fs");

const dir = ".next";

if (!existsSync(dir)) {
  process.exit(0); // nothing to clean
}

try {
  if (process.platform === "win32") {
    execSync(`cmd /c rmdir /s /q "${dir}"`, { stdio: "inherit" });
  } else {
    execSync(`rm -rf "${dir}"`, { stdio: "inherit" });
  }
  console.log(`✓ Cleaned ${dir}`);
} catch (err) {
  // Non-fatal — Next.js will try its own cleanup
  console.warn(`⚠ Could not clean ${dir}:`, err.message);
}
