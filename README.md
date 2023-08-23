<!--
 Copyright (c) 2023 Anthony Mugendi

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Watch-Modules

[Chokidar](https://www.npmjs.com/package/chokidar) is an awesome module for watching all your files in NodeJs.

However, what happens when you want to watch a file and all other files it `requires` plus their child modules?

This is the gap this module seeks to fill! 😊

## Features

**Watch-Modules** will:

1. Watch a file or files given any chokidar pattern/file/directory.
2. Automatically watch all modules `required` downstream
3. Automatically start watching a file that is `required` as a result of a change in any of the files already being watched.
4. Automatically stop watching a file that is no longer `required` as a result of a change in any of the files already being watched.

This module was developed as part of [liveroute](https://www.npmjs.com/package/liveroute) but of course it's use is much broader.

## How to?

```javascript
// require and initialize
const WatchModules = require('watch-modules');
const watchModules = new WatchModules();

// From here on, watch-modules is used just as you would use chokidar

// start watching
let watcher = watchModules.watch(routerPath);

// listen for events
watcher.on('change', (filePath) => {
    logger.info(filePath, ' has changed');
});
```

## API

### Init Options

When initializing, you can pass the `ignoreRequires` option. This option determines how `required` files are filtered out.

By default `ignoreRequires = '**/node_modules/**'` which ignores all files required from the node_modules folder.

Unless you really want to have these files monitored (which you shouldn't 🤦), leave the value as is.

Below is an example of how to ignore the _vendors_ directory too.

```javascript
const watchModules = new WatchModules({
    ignoreRequires = ['**/node_modules/**','**/vendors/**']
});
```
## `watch()`
Exactly as you would use it in chokidar.

`watchModules.watch(paths, [options])`


Enjoy!
