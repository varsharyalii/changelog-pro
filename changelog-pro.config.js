module.exports = {
  // Input/Output files
  changelogFile: "CHANGELOG.md",
  htmlFile: "changelog.html",

  // Template to use ('default' or 'professional')
  template: "default",

  // Install command for tooltips (use {version} placeholder)

  // MULTIPLE NPM COMMANDS - shows "install", "global", "dev" (same package manager, different options)
  installCommand: [
    "npm install changelog-pro@{version}",
    "npm install --global changelog-pro@{version}",
    "npm install --save-dev changelog-pro@{version}",
  ],

  // DIFFERENT PACKAGE MANAGERS - would show "npm", "yarn", "pip" (different package managers)
  // installCommand: [
  //   'npm install changelog-pro@{version}',
  //   'yarn add changelog-pro@{version}',
  //   'pip install changelog-pro=={version}'
  // ],

  // NAMED COMMANDS - shows custom labels like "Node.js", "Python"
  // installCommand: {
  //   'Node.js': 'npm install changelog-pro@{version}',
  //   'Python': 'pip install changelog-pro=={version}',
  //   'Rust': 'cargo install changelog-pro --version {version}'
  // },

  // SINGLE COMMAND - no tabs, just shows the command
  // installCommand: 'npm install changelog-pro@{version}',

  // DISABLED - no tooltip at all
  // installCommand: null
};
