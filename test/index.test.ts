import { JwtStrategy, JwtStrategyVerifyParams } from "../src";
import jsonwebtoken from "jsonwebtoken";

describe(JwtStrategy, () => {
  let verify = jest.fn();

  const secret = "s3cr3t";
  let options = Object.freeze({
    secret,
    algorithms: ["HS256"] as jsonwebtoken.Algorithm[],
    getPayload: () => {
      return { username: "example@example.com" };
    },
  });

  let payload = options.getPayload();
  let token: string;
  interface User {
    id: string;
  }

  beforeAll(async () => {
    token = jsonwebtoken.sign(payload, secret);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should have the name of the strategy", () => {
    let strategy = new JwtStrategy(options, verify);
    expect(strategy.name).toBe("jwt");
  });

  test("should pass the payload, request and token to the verify callback", async () => {
    let strategy = new JwtStrategy<User>(options, verify);

    // create request with Authorization header with bearer token
    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await strategy.authenticate(request);
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.anything(),
        token: expect.anything(),
      })
    );
  });

  test("should return what the verify callback returned", async () => {
    verify.mockImplementationOnce(
      async ({ payload }: JwtStrategyVerifyParams) => {
        return payload;
      }
    );

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let strategy = new JwtStrategy<User>(options, verify);

    const user = await strategy.authenticate(request);

    expect(user).toEqual(
      expect.objectContaining({
        iat: expect.any(Number),
        token: expect.anything(),
        username: "example@example.com",
      })
    );
  });

  test("should pass token to verify callback", async () => {
    const request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const strategy = new JwtStrategy<User>(options, verify);

    await strategy.authenticate(request);
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.anything(),
        token: expect.anything(),
      })
    );
  });

  test("should pass error as cause on failure", async () => {
    verify.mockImplementationOnce(() => {
      throw new TypeError("Invalid bearer token");
    });

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let strategy = new JwtStrategy<User>(options, verify);

    let result = await strategy.authenticate(request).catch((error) => error);

    expect(result).toEqual(new Error("Invalid bearer token"));
  });

  test("should pass generate error from string on failure", async () => {
    verify.mockImplementationOnce(() => {
      throw "Invalid bearer token";
    });

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let strategy = new JwtStrategy<User>(options, verify);

    let result = await strategy.authenticate(request).catch((error) => error);

    expect(result).toEqual(new Error("Invalid bearer token"));
  });

  test("should create Unknown error if thrown value is not Error or string", async () => {
    verify.mockImplementationOnce(() => {
      throw { message: "Invalid bearer token" };
    });

    let request = new Request("http://localhost:3000", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let strategy = new JwtStrategy<User>(options, verify);

    let result = await strategy.authenticate(request).catch((error) => error);

    expect(result).toEqual(new Error("Unknown error"));
  });

  test("should raise an error if getPayload returns undefined", async () => {
    const request = new Request("http://localhost:3000");
    const strategy = new JwtStrategy<User>(
      {
        secret: "test",
        algorithms: ["HS256"] as jsonwebtoken.Algorithm[],
        getPayload: () => {
          return undefined;
        },
      },
      verify
    );
    const result = await strategy.authenticate(request).catch((error) => error);
    expect(result).toEqual(new Error("getPayload returns undefined!"));
  });
});
