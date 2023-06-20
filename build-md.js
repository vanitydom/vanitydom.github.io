const fs = require('fs')
const outdent = require('outdent')
const utils = require('./utils')

const data = fs.readdirSync('.').filter(e => e.match(/..\..*\.json/)).sort();
const original = data.map(e => JSON.parse(fs.readFileSync(e, 'utf8').toString()));

const markdown = {
  site: (data) => {
    return outdent`
      * [${data.name}](${data.href}) - ${data.description}
    `
  },
  toc: (sections) => {
    return sections.map((s) => {
      const id = s.name.replace(/\W+/g, '-').replace(/-$/, '').toLowerCase()
      return outdent`
        * [${s.name}](#${id})
      `
    }).join("\n")
  },
  toc2: () => {
    return '[TOC2]'
  }
}

const date = utils.lastUpdate()
let header = outdent`
  # /g/'s Good Sites
  Last Updated:  ${date}
`

let toc = markdown.toc2() // markdown.toc(original)

let body = ''
let sections = []
original.forEach((section, _) => {
  body += `\n## ${section.name}\n`
  section.sites.forEach((s) => {
    body += markdown.site(s) + "\n"
  })
})

console.log(outdent`
  ${header}

  ${toc}

  ${body}
`)
