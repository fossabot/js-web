## @seaccentral/central

The Web service for the SEAC Central Platform
## Installation

```bash
$ yarn install
```

## Running the app

```bash
# watch mode
$ yarn dev

# production mode
$ yarn build && yarn start
```


## Test

```bash
# unit tests
$ yarn test

# watch unit tests
$ yarn test:watch
```

## Storybook

```bash
# Build
$ yarn build-storybook

# Run
$ yarn storybook
```

## AUTH FLOW

### LOCAL LOGIN
 - On the login page, once login is clicked, a NEXT API route (`/api/login`)
 - The Next API route handler takes the request and "fowards" the request to the Auth API Service which returns a few values after successful authentication: `refreshToken`, `refreshTokenExpiry`, `accessToken` .e.t.c.
 - The Next API route handler then sets the `refresh_token` in the cookies before passing on the response to the client
 - The axios request that was made from the Login button click recieves a response containing the access token, then a call to `authLogin` is made which stores the access token in memory to be used across the app.

### LOCAL SIGNUP
 - On the signup page, once "Sign Up" is clicked, a NEXT API route (`/api/sign-up-local`)
 - The Next API route handler takes the request and "fowards" the request to the Auth API Service which returns a few values after successful authentication: `refreshToken`, `refreshTokenExpiry`, `accessToken` .e.t.c.
 - The Next API route handler then sets the `refresh_token` in the cookies before passing on the response to the client
 - The axios request that was made from the Login button click recieves a response containing the access token, then a call to `authLogin` is made which stores the access token in memory to be used across the app.


### ACCESS TOKEN REFRESH
A few reasons why the app will need to refresh the access token, full page refresh or if the access token expires. In the case where we do a full page refresh, we call the method `handleAuthRefresh`. This method does a few things:
- We wrap each page level component with a HOC called `withAuth`, this HOC uses NextJS's `getInitialProps` method
- In `getInitialProps`, we call `handleAuthRefresh`, which checks if we already have an `inMemoryToken`, if the token is missing, an API request to get a new access token is made:
  - If on the client, a Next API route call is made to get the access token
  - If on the server, a direct API request to the Auth Service is made (both options return the same properties)
- Once the token is gotten, a call is made to set the acess token in memory so it can be used across the app.

In the case of an expired access token, we have setup an axios interceptor on the client side to intercept any failed requests due to an expired access token, and call the same Next API route to get a new access token.

In both cases, if the refresh token is also expired, it is cleared from the cache and the user is logged out.

## OAUTH FLOW

Once a user has completed the oauth flow from the server successfully, the server then redirects to the `/dashboard` endpoint with the query params: `flow` set to `oauth` and the `refresh-token`. Then, a request is made to the social login API endpoint in the Auth Service which returns a new `refreshToken` and sets that token into the browser's cookies, then redirects the request to the `dashboard` page

## Translation

When we update translation json file. We also need to synchronize with google sheet.
We use [internal translation tool](https://github.com/oozou/gtranslate) for handling this matter. To setup first time, please follow [this section](https://github.com/oozou/gtranslate#1-enable-google-sheets-api).  
Once it's all set, run `yarn sync:translation`
