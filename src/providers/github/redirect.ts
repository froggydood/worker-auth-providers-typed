import * as queryString from "query-string";
import { BaseProvider } from "../../types";
import { ConfigError } from "../../utils/errors";
import { Github } from "./types";

export default async function redirect({
	options
}: BaseProvider.RedirectOptions): Promise<string> {
  const { clientId } = options;
  if (!clientId) {
    throw new ConfigError({
      message: "No client id passed"
    });
  }
  const params = queryString.stringify({
    client_id: clientId,
    scope: ["read:user", "user:email"].join(" "),
    allow_signup: true
  });

  const githubLoginUrl = `https://github.com/login/oauth/authorize?${params}`;
  return githubLoginUrl;
}
