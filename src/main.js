const { app, BrowserWindow, session, dialog } = require('electron')
const {start} = require('./helper')
const path = require("path")
const linkedInLoginPage = 'https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin'

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    })

    mainWindow.loadURL(linkedInLoginPage)
        .then(() => start(mainWindow, session.defaultSession))
        .catch(error => {
            dialog.showErrorBox('Fatal error', error.toString())
            app.quit()
        })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})