/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const chokidar = require('chokidar');
const anymatch = require('anymatch');
const path = require('path');
const fs = require('fs');
const clearModule = require('clear-module');
const logger = require('debug-symbols')('watch-modules')



class FamilyWatcher {
    constructor(opts = {}) {
        this.opts = Object.assign(
            {
                ignore: ['**/node_modules/**'],
            },
            opts
        );

        this.patternFiles = {};
        this.watchers = {};
    }


    async watch(pattern, opts = {}) {
        try {
            
            //
            this.patternFiles[pattern] = [];


            let watcher = chokidar
                .watch(pattern, opts)
                .on('error', (error) => {
                    throw error;
                })
                .on('ready', () => {
                    this.watch_required(watcher);
                })
                .on('change', (filePath) => {
                    logger.debug(filePath + ' changed...')
                    // console.log({allWatchedFiles});
                    this.watch_required(watcher);
                });

            
            // return watcher
            return watcher;
        } catch (error) {
            throw error;
        }
    }

    get_all_watched(watcher) {
        let allWatched = watcher.getWatched(),
            allWatchedFiles = [],
            files;

        for (let p in allWatched) {
            files = allWatched[p]
                .map((f) => path.join(p, f))
                .filter((f) => fs.statSync(f).isFile());
            allWatchedFiles = allWatchedFiles.concat(files);
        }

        return allWatchedFiles;
    }

    watch_required(watcher) {
        let allWatchedFiles = this.get_all_watched(watcher);

        let allRequiredFiles = [];

        for (let file of allWatchedFiles) {
            let requiredFiles = this.get_required(file);

            for (let childFile of requiredFiles) {
                // Ignore files
                if (
                    allRequiredFiles.indexOf(childFile) == -1 &&
                    anymatch(this.opts.ignore, childFile) === false
                ) {
                    allRequiredFiles.push(childFile);
                }
            }
        }

        // console.log({ allWatchedFiles, allRequiredFiles });

        for (let childFile of allRequiredFiles) {
            // check that child file is not already being watched....
            if (allWatchedFiles.indexOf(childFile) == -1) {
                logger.info('++ Watching '+ childFile);
                // add to watcher
                watcher.add(childFile);
            }
        }

        // unwatch files no longer required
        for (let file of allWatchedFiles.slice(1)) {
            if (allRequiredFiles.indexOf(file) == -1) {
                logger.info('-- Unwatching ' + file);
                watcher.unwatch(file)
            }
        }
    }

    get_required(filePath, childMods = []) {
        try {
            // let childMods = [];

            // clear module to allow fresh requires
            clearModule(filePath);

            // attempt to require
            require(filePath);

            let thisMod = module.children.filter(
                (m) => m.filename == filePath
            )[0];

            let files = thisMod.children
                .map((m) => m.filename)
                .filter((f) => anymatch(this.opts.ignore, f) === false);

            for (let f of files) {
                if (childMods.indexOf(f) == -1) {
                    childMods.push(f);
                }

                childMods = this.get_required(f, childMods);
            }

            return childMods;
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

module.exports = FamilyWatcher;
