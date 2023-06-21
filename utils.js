const cp = require('child_process');

function lastUpdate(glob='[0-9]*.json') {
  //const command = `git log -1 "--date=format: %B %d, %Y" --format=%cd ${glob}`
  const command = `git log -1 "--date=format: %A %B %d, %Y" --format=%ad ${glob}`
  return cp.execSync(command).toString().trim()
}

module.exports = {
  lastUpdate
}
