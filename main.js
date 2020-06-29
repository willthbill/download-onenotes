require('dotenv').config()

const fetch = require("node-fetch");
const { writeFile } = require('fs');
const request = require('request');

const getContent = async () => {
    console.log(`Bearer ${process.env.ACCESS_TOKEN}`)
    fetch(
        "https://graph.microsoft.com/v1.0/users/115170e9-95f0-4986-9952-a244e9167b35/onenote/pages/1-ba682f9205dc475fb82d09322338def2!1-f6ef017f-6f8b-4060-bd1f-4263b00469f7/content?includeIDs=true",
        {
            method: 'GET',
            headers: { 
                Authorization : `Bearer ${process.env.ACCESS_TOKEN}`
            },
        }
    ).then(res => {
        return res.text()
    }).then(res => {
        writeFile("./test.html", res, "utf8", () => {

        })
    })
}

const getImage = (filename, url) => {
    request(url, {
        encoding: 'binary',
        headers : {
            Authorization : `Bearer ${process.env.ACCESS_TOKEN}`
        }
    }, (error, response, body) => {
        writeFile(filename, body, 'binary', (err) => {});
    });
}

getContent();
getImage(
    "./test.png", 
    "https://graph.microsoft.com/v1.0/users('115170e9-95f0-4986-9952-a244e9167b35')/onenote/resources/1-50ac1182a0dd484e9ff55100e6ed0165!1-f6ef017f-6f8b-4060-bd1f-4263b00469f7/$value"
);