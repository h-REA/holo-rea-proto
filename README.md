# HoloREA

A modular REA implementation for Holochain

<!-- MarkdownTOC -->

- [Setup](#setup)
	- [Prerequisites](#prerequisites)
	- [Initialising for development](#initialising-for-development)
- [Dev mode](#dev-mode)
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
