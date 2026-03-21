# jintellv3
jintellv3 is a JavaScript library that simplifies UI development in your projects. It provides the foundation for modern web development.

## Build
To build all output files, follow the steps below:
- Install [Node.js®](https://nodejs.org/en) v20.20.1+
- Run the script below:
  ```cmd  
  "install dependencies.cmd" 
  "build builder.cmd" 
  "build production.cmd" 
  ```

## Batch script(s) 
A batch script(s) to automate building and deploying to GitHub Pages. All build scripts are located in the `build` folder. To run the build commands, please install [Node.js®](https://nodejs.org/en) v20.20.1+

- `install dependencies.cmd`: Installs the dependencies required for building and deploying (`typescript`, `uglify-js`)

- `build builder.cmd`: Builds the build tool required for the following build and deployment scripts.

- `build docs.cmd`: Builds all TypeScript files for the documentation website.

- `build production.cmd`: Builds the library into `intell.min.js`, `intell.min.js.map` and `intell.min.d.ts`

- `build development.cmd`: Builds and copies the library to the documentation site for local development.

## Documentation
You can find more documentation and examples at [https://jintell.xhighintell.com](https://jintell.xhighintell.com)