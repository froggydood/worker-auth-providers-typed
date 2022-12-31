import { BaseProvider, OAuthTokens } from '../../types';
import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { checkTokenResponseError, checkValidResponse, parseQuerystring } from '../../utils/helpers';
import { Github } from "./types"

async function getTokensFromCode(
	code: string,
	{ clientId, clientSecret }: BaseProvider.TokensFromCodeOptions
): Promise<OAuthTokens> {
  const params = {
    client_id: clientId,
    client_secret: clientSecret,
    code,
  };

  const response = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(params),
    },
  );
  const result = await response.json();

  await checkTokenResponseError(result)
  await checkValidResponse(response)
  return result as OAuthTokens;
}

async function getUser(token: string): Promise<Github.UserResponse> {
  try {
    const headers = {
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${token}`,
      'user-agent': 'cool-bio-analytics-github-oauth-login',
    };

	const getUserResponse = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers,
    });
	await checkValidResponse(getUserResponse)
    const data = await getUserResponse.json() as Github.UserResponse;

    if (!data.email) {
          // If the user does not have a public email, get another via the GitHub API
          // See https://docs.github.com/en/rest/users/emails#list-public-email-addresses-for-the-authenticated-user
          const res = await fetch("https://api.github.com/user/emails", {
                method: 'GET',
                headers,
          });
          const emails = await res.json() as Github.EmailResponse[]
		  await checkValidResponse(res)

          data.emails = emails
          data.email = (emails.find((e) => e.primary) ?? emails[0]).email
    }
    return data;
  } catch (e) {
    
    throw new ProviderGetUserError({
      message: 'There was an error fetching the user',
    });
  }
}

export default async function callback({
	options, request
}: BaseProvider.CallbackOptions): Promise<Github.CallbackResponse> {
  const { query } = parseQuerystring(request);
  
  if (!query.code) {
    throw new ConfigError({
      message: 'No code is paased!',
    });
  }
  const tokens = await getTokensFromCode(query.code, options);
  const accessToken = tokens.access_token;
  ;
  const providerUser = await getUser(accessToken);
  return {
    user: providerUser,
    tokens
  };
}
