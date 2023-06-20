/*

  Usage:

  - Go to https://sites.baka.best/ .
  - Open up your dev tools.
  - Switch to the JavaScript console.
  - Paste this code into the JavasScript console.

  You should have a lot of JSON in your copy buffer.

  This also works on the archived version of the site,
  and it's how the data was initially salvaged.
  https://web.archive.org/web/20211219234838/https://www.goodsites.tech/

*/

// If the given li contains a section header, return its name.
function getSectionHeader(li) {
  const h3 = li.querySelector('h3.cat')
  if (h3) {
    return h3.innerText.replace(/:\s*$/, '')
  } else {
    return ''
  }
}

// Get site data as an object from an li
function getSite(li) {
  const site = {}
  const span = li.querySelector('span')
  const a = li.querySelector('a')
  site.name = a.innerText
  site.href = a.href
  site.tags = a.title ? a.title.split(/\s+/) : []
  const r = span.innerText.match(/\s+-\s+(.*)$/)
  site.description = r ? r[1] : ''
  return site
}

const ul = document.getElementById('sites')
const lis = ul.querySelectorAll('li')
const sections = []
let current = undefined
lis.forEach((li) => {
  let name = getSectionHeader(li)
  if (name) {
    current = { name, sites: [] }
    sections.push(current)
  } else {
    if (!current) current = { name: 'Unknown', sites: [] }
    current.sites.push(getSite(li))
  }
})

// The data for the site will be in your copy buffer in JSON format.
copy(JSON.stringify(sections, null, '  '))
