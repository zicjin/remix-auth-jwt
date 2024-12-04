import { Strategy } from "remix-auth/strategy";
import jsonwebtoken from "jsonwebtoken";

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface JwtStrategyOptions {
  /**
   * The key to verify the JWT
   */
  secret: string;

  /**
   * The algorithms to verify the JWT
   */
  algorithms: jsonwebtoken.Algorithm[];

  /**
   * The function to get payload to sign JWT token
   * @param request
   * @returns
   */
  getPayload: (request: Request) => any | Promise<any>;
}

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export interface JwtStrategyVerifyParams {
  /** The request that triggered the verification flow */
  request: Request;
  /** The payload */
  payload: any;
  /** The token signed from payload */
  token: string;
}

export class JwtStrategy<User> extends Strategy<User, JwtStrategyVerifyParams> {
  name = "jwt";

  protected secret: string;
  protected algorithms: jsonwebtoken.Algorithm[];
  protected getPayload: JwtStrategyOptions["getPayload"];

  constructor(
    options: JwtStrategyOptions,
    verify: Strategy.VerifyFunction<User, JwtStrategyVerifyParams>
  ) {
    super(verify);
    this.secret = options.secret;
    this.algorithms = options.algorithms;
    this.getPayload = options.getPayload;
  }

  async authenticate(request: Request): Promise<User & { token: string }> {
    let token: string | undefined;
    try {
      token = request.headers.has("Authorization")
        ? request.headers.get("Authorization")?.split(" ")[1]
        : undefined;

      let payload: any;
      if (token == undefined) {
        payload = await this.getPayload(request);
        if (payload === undefined) {
          throw new Error("getPayload returns undefined!");
        }
        token = jsonwebtoken.sign(payload, this.secret);
      } else {
        payload = jsonwebtoken.verify(token, this.secret, {
          algorithms: this.algorithms,
        });
        if (!payload) {
          throw new Error("Invalid token");
        }
      }

      const user = await this.verify({
        request,
        payload,
        token,
      });

      return { ...user, token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      if (typeof error === "string") {
        throw new Error(error);
      }
      throw new Error("Unknown error");
    }
  }
}
