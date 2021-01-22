const {
  app, BrowserWindow, Menu, getCurrentWindow
} = require('electron');

const isMac = process.platform === 'darwin';

function menuTemplate(parentWindow, isDevMode) {
  // Much of this template comes straight from the docs
  // https://www.electronjs.org/docs/api/menu
  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      label: 'About',
      click: () => openAboutWindow(parentWindow, isDevMode),
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Report a problem',
          click: () => openReportWindow(parentWindow, isDevMode),
        },
      ],
    },
  ];
  return template;
}

function openAboutWindow(parentWindow, isDevMode) {
  const child = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    width: 700,
    height: 800,
    frame: true,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      minimumFontSize: 18,
    },
  });
  child.setMenu(null);
  child.loadURL(`file://${__dirname}/static/about.html`);
  if (isDevMode) {
    child.webContents.openDevTools();
  }
}

function openReportWindow(parentWindow, isDevMode) {
  const child = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    width: 700,
    height: 800,
    frame: true,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      minimumFontSize: 18,
    },
  });
  child.setMenu(null);
  child.loadURL(`file://${__dirname}/static/report_a_problem.html`);
  if (isDevMode) {
    child.webContents.openDevTools();
  }
}

module.exports.menuTemplate = menuTemplate;
