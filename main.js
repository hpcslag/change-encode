const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const remote = BrowserWindow.remote;
const ipc = require('electron').ipcMain;
const Buffer = require('buffer').Buffer;
let chardet = require('chardet');
let iconvlite = require('iconv-lite');
const fs = require('fs');
const dialog = require('electron').dialog

let win;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 500, height: 500});

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', () => {
    win = null;
    app.quit();
  });

  ipc.on('inside-file', function (event, filepath) {
	chardet.detectFile(filepath, function(err, encoding) {
		console.log(encoding);
		event.sender.send('inside-data-reply', encoding);
	});
  });

  ipc.on('convert-file', function (event, data) {
  	console.log(JSON.stringify(data,null,4));
		let streamData = fs.readFileSync(data.path,{encoding: "binary"});

    	let buffer = iconvlite.decode(new Buffer(streamData), data.toType);

    	console.log(chardet.detect(buffer));
		console.log(buffer);

		const options = {
		    title: 'Save an File'
		};
		dialog.showSaveDialog(options, function (filename) {
		    fs.writeFileSync(filename, buffer);
		});
  });

  //win.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
