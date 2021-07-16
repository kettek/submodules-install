# submodules-install - NPM Submodules Installer
This module provides a system for calling `npm i`, `yarn install`, or a custom command on a list of locations, ultimately providing automatic submodule installation.

## Usage
Install via npm:

    npm i submodules-install --save

Or Yarn:

    yarn add submodules-install

Add an array of strings using glob syntax or specially formatted objects to your `package.json`:

    "submodules": [
      "my_subdir/*",
      "my_subdir2/**",
      {
        "path": "my_subdir3",
        "cmd": "go",
        "args": ["build"]
      }
    ]

Then run:

    npx submodules-install

Alternatively, you may also use `preinstall`, `postinstall`, or otherwise:

    "scripts": {
      "preinstall": "submodules-install"
    }

## Submodules Object
If an object is provided to the submodules array, it should match the following structure:

```
{
  path: String,     // Target glob to search.
  cmd: String,      // Optional. Command to use to run the install. Defaults to npm or yarn if a `yarn.lock` file is found.
  args: [String],   // Optional. Arguments to pass to the command. Defaults to `i` under npm or `install` under yarn.
  contains: String, // Optional. File to find in the glob result directory. Defaults to `package.json` if using npm or yarn.
}
```
