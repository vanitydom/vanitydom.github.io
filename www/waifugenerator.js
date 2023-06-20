// TODO: template this file
addEventListener('load', () => {
    const waifu = document.getElementById('waifu');

    const changeWaifu = () => {
        const images = [...new Array(35)].map((_, i) => `waifus/${i+1}.png`);
        waifu.src = images[~~(Math.random() * images.length)];
    };
    changeWaifu();
    waifu.onclick = changeWaifu;
});
