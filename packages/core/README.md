## @seaccentral/central

The core package for the SEAC Central Platform
## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn ts:watch

# production mode
$ yarn ts:build
```

## Database migrations

```bash
# Generate migration based on entity changes
$ yarn db:migration:generate -n <name>

# Running migrations
$ yarn db:migration:run

# Creating plain migration file (without comparing changes)
$ yarn db:migration:create -n <name>

# Reverting last migration
$ yarn db:migration:revert

## Setting up AWS SES locally
- Setup your AWS shared file credentials, follow this [guide](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/create-shared-credentials-file.html)
- Your AWS credentials have already been provided, if they haven't, please ask other team members
- Ask a member of the team to add your email address to the sandbox, while in the sandbox environment, only verified email addresses can receive email messages
- Once email is verified, you can add replace the key, `AWS_SES_SENDER_ADDRESS` with the email address you just verified.
