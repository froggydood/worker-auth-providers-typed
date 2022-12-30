import { BaseProvider, OAuthTokens } from '../../types';
import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { checkTokenResponseError, parseQuerystring } from '../../utils/helpers';
import { Google } from './types';

async function getTokensFromCode(
	code: string, {
		clientId, clientSecret, redirectUrl
	}: BaseProvider.TokensFromCodeOptions
): Promise<OAuthTokens> {
  const params = {
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUrl,
    code,
    grant_type: 'authorization_code',
  };

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(params),
  });
  const result = await response.json();
  checkTokenResponseError(result)
  return result as OAuthTokens;
}

async function getUser(token: string): Promise<Google.UserResponse> {
  try {
    const getUserResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await getUserResponse.json();
    
    return data as Google.UserResponse;
  } catch (e) {
    throw new ProviderGetUserError({
      message: 'There was an error fetching the user',
    });
  }
}

export default async function callback({ options, request }: BaseProvider.CallbackOptions): Promise<Google.CallbackResponse> {
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
