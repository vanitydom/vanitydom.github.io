const cp = require('child_process');

function lastUpdate(glob='[0-9]*.json') {
  const command = `git log -1 "--date=format: %A %B %d, %Y" --format=%cd ${glob}`
  return cp.execSync(command).toString().trim()
}

module.exports = {
  lastUpdate
}
