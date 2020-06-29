require('dotenv').config()

const NodeFetch = require("node-fetch");
const fs = require('fs');
const writeFile = fs.writeFile;
const request = require('request');
const { JSDOM } = require("jsdom");

const basefolder = "./downloads";

let sections, notebooks;

const fetch = (url, options) => {
    return new Promise(resolve => {
        setTimeout(() => {
            NodeFetch(url, options).then(res => {
                resolve(res)
            })
        }, 200)
    })
}

const fixWindowsStuff = s => {
    return s
    .replace("/","")
    .replace("\\","")
    .replace(":","")
    .replace("*","")
    .replace("?","")
    .replace("\"","")
    .replace("<","")
    .replace(">","")
    .replace("|","")
}

const config = {
    method: 'GET',
    headers: { 
        Authorization : `Bearer ${process.env.ACCESS_TOKEN}`
    },
}

const getImage = (filename, url) => {
    return new Promise(resolve => {
        request(url, {
            encoding: 'binary',
            headers : {
                Authorization : `Bearer ${process.env.ACCESS_TOKEN}`
            }
        }, (error, response, body) => {
            if(response.statusCode != 200){
                resolve(false)
            }else{
                writeFile(filename, body, 'binary', (err) => {
                    console.log("           downloaded image:", filename)
                    resolve(true);
                });
            }
        });
    })
}

const analyseModifyAndDownloadImages = async (folder, html, pageName) => {
    const dom = new JSDOM(html, { runScripts: "outside-only" });
    dom.window.eval(`
        document.body.innerHTML = 
           "<h1>${pageName}</h1>" +
           document.body.innerHTML
        ;
    `);
    const images = dom.window.document.querySelectorAll("img");
    let count = 0;
    for(const image of images){
        count++;
        const src = image.getAttribute("src");
        const type = image.getAttribute("data-src-type")
        const filetype = type.substring(type.indexOf("/") + 1, type.length);
        const name = `${folder}/image${count}.${filetype}`;
        console.log("           found image of type:", type, "and with name:", name)
        image.setAttribute("src", `./image${count}.${filetype}`)
        let success = false;
        while(!success){
            success = await getImage(name, src);
        }
    }
    return dom.serialize();
}

const getPage = (url, folder, pageName) => {
    return new Promise(resolve => {
        fs.mkdir(folder, () => {
            fetch(
                url,
                config
            ).then(res => {
                if(!res.ok){
                    resolve(false)
                }else{
                    return res.text()
                }
            }).then(res => {
                analyseModifyAndDownloadImages(folder, res, pageName).then(html => {
                    writeFile(`${folder}/index.html`, html, "utf8", () => {
                        console.log("           successfully downloaded and saved page:", pageName)
                        resolve(true)
                    })
                })
            })
        });
    })
}

const getJSON = url => {
    return fetch(
        url,
        config
    ).then(res => {
        return res.json();
    })
}

const getSection = (url, folder) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(folder, () => {
            getJSON(url).then(async json => {
                const pages = json.value;
                if(!pages) resolve(false)
                else{
                    for(const page of pages){
                        const name = page.title;
                        console.log("       processing page:", name);
                        const url = page.contentUrl;
                        const newFolder = `${folder}/${fixWindowsStuff(name)}`;
                        let success = false;
                        while(!success){
                            success = await getPage(url, newFolder, name);
                        }
                    }
                    resolve(true)
                }
            })
        })
    })
}

const getNoteBook = (id, folder) => {
    return new Promise(resolve => {
        fs.mkdir(folder, async () => {
            for(const section of sections){
                if(section.parentNotebook.id == id){
                    const name = section.displayName;
                    console.log("   processing section:", name)
                    const url = section.pagesUrl;
                    const newFolder = `${folder}/${fixWindowsStuff(name)}`;
                    let success = false;
                    while(!success){
                        success = await getSection(url, newFolder);
                    }
                }
            }
            resolve()
        })
    })
}

const processAllNotebooks = async folder => {
    for(const notebook of notebooks){
        const name = notebook.displayName;
        console.log("processing notebook:", name)
        const id = notebook.id;
        const newFolder = `${folder}/${fixWindowsStuff(name)}`;
        await getNoteBook(id, newFolder);
    }
}

const getAllNoteBooks = folder => {
    return getJSON("https://graph.microsoft.com/v1.0/me/onenote/notebooks").then(json => {
        return json.value;
    })
}

const getAllSections = () => {
    return getJSON("https://graph.microsoft.com/v1.0/me/onenote/sections").then(json => {
        return json.value;
    })
}

const start = () => {
    if(!fs.existsSync(basefolder)){
        fs.mkdirSync(basefolder);
    }else{
        throw "Please empty output directory and delete the folder"
    }
    const p1 = getAllSections();
    const p2 = getAllNoteBooks();
    Promise.all([p1, p2]).then(([secs, notes]) => {
        console.log("fetched notebooks and sections")
        sections = secs;
        notebooks = notes;
        processAllNotebooks(basefolder);
    })
}

start();