# HoloREA

A modular REA implementation for Holochain

<!-- MarkdownTOC -->

- [Setup](#setup)
	- [Prerequisites](#prerequisites)
	- [Initialising for development](#initialising-for-development)
- [Dev mode](#dev-mode)
	- [Service entrypoints](#service-entrypoints)
- [Useful development tools](#useful-development-tools)
- [Project structure](#project-structure)

<!-- /MarkdownTOC -->



## Setup

### Prerequisites

The simplest setup is with Yarn, Docker and Docker Compose.

- Install latest versions of [Docker](https://docs.docker.com/install/) & [Docker Compose](https://docs.docker.com/compose/install/) from their respective websites.
- If you don't have Yarn- `npm i -g yarn` using the version of node you plan on developing this project against *(for recommended, see `.nvmrc`)*. You can setup your modules manually using `npm link` if you prefer, but Yarn's workspaces feature will save you a lot of time.

If you wish to proceed with setting up a local Go toolchain and running `hcdev` locally, feel free to add instructions on this method here.

### Initialising for development

- Run `yarn install` from the root of this repo. This will setup all necessary `node_modules` folders and symlinks between repositories kept in this package which depend on each other.



## Dev mode

- `npm start` gets you both a webserver pointing to `src/ui` and a Holochain 0.0.1 Prototype DHT running for your backend. If you wish to run these commands separately (useful when troubleshooting the DHT code), see the scripts in `package.json` prefixed with `dev:`.

**PLEASE NOTE:** you will see the error **"TypeScript emitted no output for [...]"** when running the frontend. This issue appears to be intermittent. If you simply open the source file experiencing the issue in your editor and re-save it, compilation appears to succeed in subsequent rounds.


### Service entrypoints

When running in development mode, these are the components which will be booted up & where to find them:

- Our demo UI at `http://localhost:3000`
- A GraphQL query browser at `http://localhost:3000/graphql`
- A test REPL for the Holochain app at `http://localhost:3141`
- The Holochain app Zome APIs at subpaths of `http://localhost:3141/fn/*`


## Useful development tools


**1. [Apollo Client Developer Tools](https://github.com/apollographql/apollo-client-devtools)**

For assisting with writing and debugging GraphQL queries.


**2. [Redux Devtools Extension](https://github.com/zalmoxisus/redux-devtools-extension)**

For assisting with debugging application state- both the Apollo cache and other UI state.

- **Chrome:**
	- Click on the Redux devtools icon in your toolbar
	- Click the *'remote'* button in the bottom right, which should pop up a screen
	- Navigate to "settings", enable *"Use custom (local) server"*, set to `localhost`, port `7999`
- **Firefox:**
	- If you see an empty screen with an error when opening the devtools panel, you will need to navigate to a Redux app ([like this one](http://zalmoxisus.github.io/examples/counter/)) to get it to load, after which you can...
	- Click the *'remote'* button in the bottom right, which should pop up a screen (Firefox seems to currently be broken here, you'll probably have to use Chrome)
	- Navigate to "settings", enable *"Use custom (local) server"*, set to `localhost`, port `7999`
- **VSCode**: check out [vscode-redux-devtools](https://github.com/jkzing/vscode-redux-devtools).

Note there are some platform-specific quirks, and you may be forced to use the Chrome version as the Firefox extension has some bugs.



## Project structure

- `/bin`: output files from the TypeScript compilation of the source DHT code kept in `src/HoloREA/dna`
- `/build`: shell commands used to build the DHT code and setup the repo
- `/docs`: more in-depth documentation files to understand particular areas of the app
- `/src/graphql-adapter`: a REA-flavoured, client-side GraphQL adapter for the `0.0.1` Holochain zome REST APIs, used by the frontend app
- `/src/HoloREA`: the Holochain app DHT code
- `/src/lib`: helper files used in DHT code
- `/src/tests`: Holochain app unit tests & demonstration scenarios
- `/src/ui`: Example frontend app which talks to the DHT
- `/src/ui/config`: Webpack configuration files for frontend app
- `/src/ui/scripts`: shell commands for running development tasks
- `/src/ui/public`: directory to serve alongside bundled JS files, incl. webpage template
- `/src/ui/src`: bulk of the frontend app code
