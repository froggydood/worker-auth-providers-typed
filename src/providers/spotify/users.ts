import * as queryString from "query-string";
import { BaseProvider, OAuthTokens } from "../../types";
import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { checkTokenResponseError, checkValidResponse, parseQuerystring } from '../../utils/helpers';
import { Spotify } from "./types";

async function getTokensFromCode(
	code: string,
	{ clientId, clientSecret, redirectUrl }: BaseProvider.TokensFromCodeOptions
): Promise<OAuthTokens> {
	const params = queryString.stringify({
		redirect_uri: redirectUrl,
		code,
		grant_type: 'authorization_code',
	});
	const token = btoa(`${clientId}:${clientSecret}`);
	const response = await fetch(`https://accounts.spotify.com/api/token?${params}`, {
		method: 'POST',
		headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Authorization': `Basic ${token}`,
		},
	});
	const result = await response.json();
	await checkTokenResponseError(result)
	await checkValidResponse(response)
	return result as OAuthTokens;
}

async function getUser(token: string): Promise<Spotify.UserResponse> {
  try {
    const getUserResponse = await fetch(
      'https://api.spotify.com/v1/me',
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await getUserResponse.json();
    return data as Spotify.UserResponse;
  } catch (e) {
    throw new ProviderGetUserError({
      message: 'There was an error fetching the user',
    });
  }
}

export default async function callback({
	options, request
}: BaseProvider.CallbackOptions): Promise<Spotify.CallbackResponse> {
    const { query } = parseQuerystring(request);
    
    if (!query.code) {
      throw new ConfigError({
        message: 'No code is passed!',
      });
    }
    const tokens = await getTokensFromCode(query.code, options);
    const accessToken = tokens.access_token;
    const providerUser = await getUser(accessToken);
    return {
      user: providerUser,
      tokens
    };
}
