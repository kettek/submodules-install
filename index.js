#!/usr/bin/env node
const fs            = require('fs'),
      path          = require('path'),
      glob          = require('glob'),
      child_process = require('child_process'),
      os            = require('os');

const package_file  = path.resolve(process.cwd(), 'package.json');

let package;
try {
  package = require(package_file);
} catch (e) {
  console.error("Error while reading " + package_file);
  console.error(e);
}

if (!package.submodules) {
  console.log("No submodules section defined in package.json, please define an array of glob patterns or submodule objects as the \"submodules\" section.");
  return
}

// Convert any glob strings to submodule objects so as to support non-npm based submodules.
for (let i = 0; i < package.submodules.length; i++) {
  if (typeof package.submodules[i] === 'string') {
    package.submodules[i] = {
      path: package.submodules[i],
    }
  }
}

// Determine submodule types.
for (let i = 0; i < package.submodules.length; i++) {
  if (package.submodules[i].cmd) continue;
  if (fs.existsSync(path.join(package.submodules[i].path, 'yarn.lock'))) {
    package.submodules[i].cmd = 'yarn';
    package.submodules[i].args = package.submodules[i].args || ['install'];
    package.submodules[i].contains = 'package.json';
  } else {
    package.submodules[i].cmd = 'npm';
    package.submodules[i].args = package.submodules[i].args || ['i'];
    package.submodules[i].contains = 'package.json';
  }
}

// Fix commands for windows.
if (os.platform().startsWith('win')) {
  for (let i = 0; i < package.submodules.length; i++) {
    if (package.submodules[i].cmd === 'yarn') {
      package.submodules[i].cmd += '.cmd'
    } else if (package.submodules[i].cmd === 'npm') {
      package.submodules[i].cmd += '.cmd'
    }
  }
}

// Run glob match for our provided globs
let submodules_paths = []
let processed = 0;
for (let i = 0; i < package.submodules.length; i++) {
  let glob_path = package.submodules[i].path;
  if (package.submodules[i].contains) {
    glob_path = path.join(glob_path, package.submodules[i].contains);
  }
  glob(glob_path, {}, function (err, files) {
    // Remove contains.
    if (package.submodules[i].contains) {
      files.forEach(function(v, i) {
        files[i] = path.dirname(v);
      });
    }
    submodules_paths[i] = files;
    if (++processed === package.submodules.length) {
      // Install our submodules.
      for (let i = 0; i < submodules_paths.length; i++) {
        if (!submodules_paths[i] || submodules_paths[i].length === 0) continue;
        for (let j = 0; j < submodules_paths[i].length; j++) {
          console.log("installing submodule " + submodules_paths[i][j]);
          child_process.spawnSync(package.submodules[i].cmd, package.submodules[i].args, {
            env: process.env, cwd: path.resolve(submodules_paths[i][j]), stdio: 'inherit'
          });
        }
      }
    }
  });
}
