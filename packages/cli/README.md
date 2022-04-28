# CLI Package

A CLI application for initializing external scripts such as data migration.
Developed using [nest-commander](https://github.com/jmcdo29/nest-commander)

## Installation
Build the project
```
yarn install
yarn build
```

Allow file execution (for local development)
```
chmod +x ./bin/cli
```

Execute cli
```
./bin/cli [--commands]
```
To disable logging and improve execution time, please run in `production` node env
```
NODE_ENV=production ./bin/cli [--commands]
```

For command entry points, please look in `*.command.ts` file
