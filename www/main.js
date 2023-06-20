function search() {
    let input, filter, ul, li, span, a, i, txtValue, title;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    ul = document.getElementById("sites");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        span = li[i].getElementsByTagName("span")[0];
        txtValue = span.textContent || span.innerText;
        a = span.firstChild;
        title = a.title || "";
        if ((txtValue.toUpperCase().indexOf(filter) > -1) || (title.toUpperCase().indexOf(filter) > -1)) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

addEventListener('load', () => {
    const anti = document.querySelector('.antiwaifu');
    const waifu = document.getElementById('waifu');
    anti.addEventListener('change', () => {
        if (anti.checked)
            waifu.style.display = 'none';
        else
            waifu.style.display = 'initial';
    });
});

function setTheme(themeName) {
    const [attr, val] = themeName.split('-');
    localStorage.setItem(attr, themeName);
    document.body.setAttribute(attr, val);
}

function toggleTheme() {
    const v = localStorage.getItem('theme').includes('light');
    localStorage.setItem('theme', 'theme-' + (v ? 'dark' : 'light'));
    setTheme(localStorage.getItem('theme'));
}

addEventListener('load', async () => {
    setTheme(localStorage.getItem('theme') || 'theme-light');

    const boxes = document.querySelectorAll("input[type='checkbox']");

    for (const box of boxes)
        if (box.hasAttribute("store"))
            setupBox(box);

    function setupBox(box) {
        const storageId = box.getAttribute("store");
        const oldVal = localStorage.getItem(storageId);
        box.checked = oldVal === "true" ? true : false;
        box.dispatchEvent(new Event("change"));
        box.addEventListener("change", function () {
            localStorage.setItem(storageId, this.checked);
        });
    }

    const res = await fetch("/changes.json");
    const changes = await res.json();
    const slider = document.querySelector('#timeslider');
    const timeString = document.querySelector('#changeTime');
    slider.max = changes.length - 1;
    const types = {
        added: document.querySelector('#added'),
        removed: document.querySelector('#removed'),
    };
    const locale = Intl?.NumberFormat()?.resolvedOptions()?.locale || 'en-US';
    const dateformatter = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'medium', });
    const setDiffAt = (idx) => {
        slider.value = idx;
        const [timestamp, changesToShow] = changes[idx];
        timeString.textContent = dateformatter.format(new Date(timestamp));
        const addEntriesTo = (section, type) => {
            const container = types[type];
            container.innerHTML = '';
            let elems = [];
            for (let s of changesToShow) {
                // skip sections with nothing
                if (s[type].length == 0)
                    continue;
                const section = document.createElement('span');
                section.innerHTML = `<h3 class="cat">${s.name}</h3>`;
                elems.push(section);
                for (let c of s[type]) {
                    const site = document.createElement('span');
                    site.innerHTML = `<a title="${c.tags.join(' ')}" href="${c.href}" target="_blank">${c.name}</a> - ${c.description}</span>`;
                    elems.push(site);
                }
            }
            container.append(...elems);
        };

        addEntriesTo(document.querySelector('#added'), 'added');
        addEntriesTo(document.querySelector('#removed'), 'removed');
    };

    slider.oninput = () => setDiffAt(+slider.value);
    setDiffAt(changes.length - 1);
    document.querySelector('#changeWidget').classList.remove('hidden');
});

window.openStuff = () => {
    const links = [...document.querySelectorAll('.links a[target=_blank]')];
    window.open(links[~~(Math.random() * links.length)]);
};