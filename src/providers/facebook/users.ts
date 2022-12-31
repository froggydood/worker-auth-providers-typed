import { BaseProvider, OAuthTokens } from '../../types';
import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { checkTokenResponseError, checkValidResponse, parseQuerystring } from '../../utils/helpers';
import { Facebook } from './types';

async function getTokensFromCode(
	code: string,
	{ clientId, clientSecret, redirectUrl }: BaseProvider.TokensFromCodeOptions
): Promise<OAuthTokens> {

  const params = {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUrl,
    code,
  };

  const response = await fetch('https://graph.facebook.com/v4.0/oauth/access_token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(params),
  });
  const result = await response.json();

  await checkTokenResponseError(result)
  await checkValidResponse(response)

  return result as OAuthTokens;
}

async function getUser(
	token: string,
	fields = 'id,email,first_name,last_name'
): Promise<Facebook.UserResponse> {
  try {
    const getUserResponse = await fetch(
      `https://graph.facebook.com/me?fields=${fields}&access_token=${token}`
    );
    const data = await getUserResponse.json() as Facebook.UserResponse;
	await checkValidResponse(getUserResponse)

    return data;
  } catch (e) {
    ;
    throw new ProviderGetUserError({
      message: 'There was an error fetching the user',
    });
  }
}

export default async function callback({ options, request }: Facebook.CallbackOptions): Promise<Facebook.CallbackResponse> {
    const { query } = parseQuerystring(request);
    
    if (!query.code) {
      throw new ConfigError({
        message: 'No code is paased!',
      });
    }
    const tokens = await getTokensFromCode(query.code, options);
    const accessToken = tokens.access_token;
    const providerUser = await getUser(accessToken, options.fields);
    return {
      user: providerUser,
      tokens
    };
}
