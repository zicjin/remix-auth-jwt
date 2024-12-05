# JWT Strategy

[![npm version](https://badge.fury.io/js/remix-auth-jwt.svg)](https://badge.fury.io/js/remix-auth-jwt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Remix Auth strategy for working with JWT.

This strategy is influenced by Ktor's JSON Web Tokens-related library and the express-jwt library.

In other words, when Remix is used as an API-only application, this strategy comes into effect.

## Supported runtimes

| Runtime | Has Support |
| ------- | ----------- |
| Node.js | ✅          |

This strategy has been tested to work with Node.js.

## API

The parameter passed as the first argument when this strategy class is initialized contains the following:

| Name       | Type                      | Description                            |
| ---------- | ------------------------- | -------------------------------------- | -------------------------------------------- |
| secret     | string                    | The secret used to sign the token.     |
| algorithms | Algorithm[]               | The algorithms used to sign the token. |
| getPayload | (request: Request) => any | Promise<any>;                          | A function that returns the payload to sign. |

## How to use

<!-- Explain how to use the strategy, here you should tell what options it expects from the developer when instantiating the strategy -->

First, install the strategy, jsonwebtoken@8.5.1, jsonwebtoken-esm@1.0.5 and Remix Auth.

```bash
$ npm install remix-auth remix-auth-jwt jsonwebtoken@8.5.1
```

Then, create an Authenticator instance.

```ts
// app/auth.server.ts
import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";

export let authenticator = new Authenticator<AuthData>();
```

And you can tell the authenticator to use the JwtStrategy.

```ts
import { JwtStrategy } from "remix-auth-jwt";

// The rest of the code above here...

authenticator.use(
  new JwtStrategy(
    {
      secret: "s3cr3t",
      algorithms: ["HS256"] as Algorithm[],
      getPayload: (request: Request) => {
        // Get username and password from the request
        // Body, params, etc.
        return { username, password };
      }
    },
    // Define what to do when the request is authenticated
    async ({ payload, request, token }) => {
      // You can access decoded token values here using payload      
      return payload;
    }
  ),
  // each strategy has a name and can be changed to use another one
  "jwt"
);
```

In order to authenticate a request, you can use the following inside of an `loader` function:

```ts
import { LoaderArgs } from "@remix-run/server-runtime";
import { authenticator } from "~/auth.server";

export async function loader({ params, request }: LoaderArgs) {
  try {
    const result = await authenticator.authenticate("jwt", request);
    /* handle success */
  } catch (error: unknown) {
    /* handle error */
  }
}
```

In order to authenticate a request, you can use the following inside of an `action` function:

```ts
import type { ActionArgs } from "@remix-run/server-runtime";
import { authenticator } from "~/auth.server";

export const action = async ({ request }: ActionArgs) => {
  try {
    const result = await authenticator.authenticate("jwt", request);
    switch (request.method) {
      case "POST": {
        /* handle "POST" */
      }
      case "PUT": {
        /* handle "PUT" */
      }
      case "PATCH": {
        /* handle "PATCH" */
      }
      case "DELETE": {
        /* handle "DELETE" */
      }
    }
  } catch (error: unknown) {
    /* handle error */
  }
};
```
