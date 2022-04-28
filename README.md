# SEAC Central [![Build](https://github.com/oozou/seac-central/actions/workflows/ci.yml/badge.svg)](https://github.com/oozou/seac-central/actions/workflows/ci.yml)

This is the monorepo which contains all the packages and applications used for the SEAC Central Platform

# Getting Started

These instructions should get you a copy of the project up and running on your local machine for development and testing purposes.

# Prerequisites

Things you need to get started:

- A recent version of Node running on your machine (12.0 or higher), check this [link](https://nodejs.org/en/download/) to download it.
- A cool text editor, I recommend using either [VSCode](https://code.visualstudio.com/download) or [Atom(with the nuclide plugin)](https://nuclide.io/docs/editor/setup/)
- [Docker](https://www.docker.com/products/docker-desktop) and [Docker compose](https://docs.docker.com/compose/install/)

# Installing

To get the project running, follow these steps:

- Clone this repository:

```
git clone git@github.com:oozou/seac-central.git
```

- Setup the Postgres DB and PG Admin interface:
  - In the root of the project, run the `setup.sh` file
  ```
  ./setup.sh
  ```

### Note: To connect to the DB on docker PGAdmin, the host is `postgres` instead of `localhost`

- Install all the project's dependencies at the root of the project:

```
yarn
```

- Once that's done, run migration script to create db schema

```
yarn core db:migration:run
```

Then start the core package (this has to be started before other packages):

```
yarn start:core
```

- Then you can go ahead and run any other package:

```
yarn start:web
```

- If you do not want to run individual packages, run all packages at once:

```
yarn start:all
```

### Note: Please make sure you're allocating 4GB of RAM to docker for the local instances of elasticsearch. Since we have to spin up 3 nodes, it consumes a lot of resources.

# Database Seeding

Make sure you build the core and central packages once before running seed command.

```
yarn build:core
yarn build:central
```

Then start to run a command below.

```
yarn seed
```

If you are running in non-production environment, please also run

```
yarn seed:dev
```

# Login Credentials (non-production)

## Root User

Has all access to all apis

### Email

admin@seasiacenter.com

### Password

P@ssw0rd

# [Setting up JW Player](https://github.com/oozou/seac-central/wiki/JW-Player)

# Deployment

For deployment, each package has a dedicated `Dockerfile` and some packages will also have a `docker-compose.yml` file.

These files will be used to containerize each application and then deploy them using AWS Fargate

## Environment variables

Please note that before deploying a new version of the app it is best to confirm that the corresponding task definition for that service has to have the up to date env variables:

- Go to `infrastructure/terraform/ecs.tf`
- For example, if we are updating the `auth service`
- Check the task definition for that service, should look like below

```
resource "aws_ecs_task_definition" "auth_api_definition" {
  ...
    environment = [
      {
        "name" : "PORT",
        "value" : tostring(var.auth_app_container_port)
      },
      {
        "name" : "DB_NAME",
        "value" : var.database_name
      },
      {
        "name" : "DB_HOST",
        "value" : aws_db_instance.rds.address
      },
      {
        "name" : "DB_USERNAME",
        "value" : var.database_username
      },
      {
        "name" : "DB_PASSWORD",
        "value" : var.database_password
      }
    ]
    portMappings = [{
      containerPort = var.auth_app_container_port
      hostPort      = var.auth_app_container_port
    }]
  ...
}

```

- In the `environment` array, add any new environment variable you want the server to have
- Run `terraform plan -out=./.plan-output`
- And if you're fine with the changes, run `terraform apply "./.plan-output"`

# Built With

- Javascript
- React
- Next JS
- Nest js
- PostgreSQL

# Authors

TODO: Add the Authors
