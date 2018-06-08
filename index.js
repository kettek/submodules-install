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
  console.err("Error while reading " + package_file);
  console.err(e);
}

if (!package.submodules) {
  console.log("No submodules section defined in package.json, traversing all directories.");
  package.submodules = ["**"];
}

// Run glob match for our provided globs
let submodule_paths = []; // To-be-filled list of submodule paths
let processed_paths = 0;  // Amount of paths processed for cb resolution
for (let i = 0; i < package.submodules.length; i++) {
  glob(path.join(package.submodules[i], "package.json"), {}, function (err, files) {
    // Remove "package.json"
    files.forEach(function(v, i) {
      files[i] = path.dirname(v);
    });
    // Merge files with main list and deduplicate
    submodule_paths = submodule_paths.concat(files.filter(function(item) {
      return submodule_paths.indexOf(item) < 0;
    }));
    // If we've processed all the targets, run npm install on each
    if (++processed_paths == package.submodules.length) {
      const cmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';
      for (let i = 0; i < submodule_paths.length; i++) {
        console.log("installing submodule " + submodule_paths[i]);
        child_process.spawnSync(cmd, ['i'], {
          env: process.env, cwd: path.resolve(submodule_paths[i]), stdio: 'inherit'
        });
      }
    }
  });
}
