# submodules-install - NPM Submodules Installer
This module provides a system for calling `npm i` on a list of locations, ultimately providing automatic submodule installation.

From the provided submodule globs, it will only match directories that contain "package.json".

## Usage
Install via npm:

    npm i submodules-install --save

Add an array of strings using glob syntax to your `package.json`:

    "submodules": [
      "my_subdir/*",
      "my_subdir2/**"
    ]

Then run:

    npx submodules-install

Alternatively, you may also use `preinstall`, `postinstall`, or otherwise:

    "scripts": {
      "preinstall": "submodules-install"
    }

