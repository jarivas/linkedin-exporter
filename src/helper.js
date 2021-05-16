const fs = require('fs')
const helper = {}

async function onLoggedIn(){
    const cookie = await getLinkedInCookie()

    if (!cookie) {
        throw 'Please log in'
    }

    fs.readFile(__dirname + '/linkedIn.js', 'utf8' , (err, data) => {
        if (err) {
            throw err
        }

        helper.mainWindow.webContents.executeJavaScript(data.replace('ReplaceMe', cookie))
    })
}

async function getLinkedInCookie() {
    return helper.session.cookies.get({url: "https://www.linkedin.com", name: "JSESSIONID"})
        .then((cookies) => {
            return (cookies.length > 0) ? cookies[0].value.replaceAll('"','') : false
        })
        .catch(console.error)
}

exports.start = (mainWindow, session) => {
    helper.mainWindow = mainWindow
    helper.session = session

    mainWindow.webContents.once('did-navigate', onLoggedIn)
    mainWindow.webContents.openDevTools()
}

