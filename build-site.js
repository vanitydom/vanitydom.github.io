const mustache = require('mustache');
const fs = require('fs');
const utils = require('./utils');
const cp = require('child_process');

const data = fs.readdirSync('.').filter(e => e.match(/..\..*\.json/)).sort();
const original = data.map(e => JSON.parse(fs.readFileSync(e, 'utf8').toString()));
const links = original.flatMap(e => e.sites.map(e => e.href));
const date = utils.lastUpdate();

const index = fs.readFileSync('templates/index.html.mustache').toString();
fs.writeFileSync('www/index.html', mustache.render(index, { original, date, count: links.length }));

console.log("Finished");

const allHashes = () => {
    const ret = cp.spawnSync('git', ['log', '--pretty=format:%H']);
    console.log(ret);
    return ret.stdout.toString().split('\n');
};

const modifiedFiles = (hash) => {
    const ret = cp.spawnSync('git', ['diff-tree', '--no-commit-id', '--name-only', hash]);
    return ret.stdout.toString().split('\n');
};

const commitDate = (hash) => {
    const ret = cp.spawnSync('git', ['show', '-s', '--format=%ct', hash]);
    return 1000 * +ret.stdout.toString();
};

const fileAtCommit = (hash, file) => {
    const ret = cp.spawnSync('git', ['show', `${hash}:${file}`]);
    return ret.stdout.toString();
};

const hashes = allHashes(); // reverse to get older first
let skip = true;
const orig = 'c5432f732c'; // commit at which point the formatting got "stable", don't use anything older
// category name -> current content (name, sites)
const tracked = new Map();

const contentDifference = (a, b) => {
    // assume hrefs are unique
    const acontent = new Set(a.sites.map(s => s.href));
    const bcontent = new Set(b.sites.map(s => s.href));

    // "added" is what is in a but not in b
    const added = new Set([...acontent].filter(s => !bcontent.has(s)));
    // "removed" is the opposite
    const removed = new Set([...bcontent].filter(s => !acontent.has(s)));

    // rebuild the entire structures, could be accelerated 
    // by mapping the entries into a map<href->object> first but meh

    return {
        added: a.sites.filter(s => added.has(s.href)),
        removed: b.sites.filter(s => removed.has(s.href)),
    };
};

// skip regenerating the changes if all of the following:
// - the changes file exist
// - the date of the last change matches the date of the last commit that touched a site file
if (fs.existsSync("./changes.json")) {
    const changes = JSON.parse(fs.readFileSync("./changes.json").toString());
    const lastChangeDate = changes.at(-1)[0];
    for (const hash of hashes) {
        const modified = modifiedFiles(hash).filter(e => e.endsWith('.json') && e.match(/^\d\d\./));
        if (modified.length != 0) {
            const date = commitDate(hash);
            if (date == lastChangeDate) {
                fs.writeFileSync('www/changes.json', JSON.stringify(changes));
                process.exit(0); // we're good
            }
            break; // need to update;
        }
    }
}

hashes.reverse();

// change:Map name -> {added: ..., removed: ...}
// date -> changes
const changes = new Map();
for (const hash of hashes) {

    // skip until we find a good commit to track changes
    console.log(hash);
    skip = skip && !hash.startsWith(orig);
    if (skip) {
        continue;
    }

    const date = commitDate(hash);
    // only care about json files that start with two numbers and a period
    const modified = modifiedFiles(hash).filter(e => e.endsWith('.json') && e.match(/^\d\d\./));
    const timeChanges = []; // list of changes as {name: string, added: ..., removed: ...}[]
    for (const mod of modified) {
        try {

            const contentAtTime = JSON.parse(fileAtCommit(hash, mod));
            const contentBefore = tracked.get(mod) || { name: '', sites: [] };
            const diff = contentDifference(contentAtTime, contentBefore);
            timeChanges.push({
                name: contentAtTime.name,
                ...diff
            });
            tracked.set(mod, contentAtTime);
        } catch {
            console.log('error when handling commit ', hash, 'and file', mod);
            // most likely human error when dealing with json
        }
    }
    if (timeChanges.length)
        changes.set(date, timeChanges);
}

const changeFile = [...changes.entries()].sort((a, b) => a[0] - b[0]);
fs.writeFileSync('changes.json', JSON.stringify(changeFile));
fs.writeFileSync('www/changes.json', JSON.stringify(changeFile));

