import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { parseQuerystring } from '../../utils/helpers';

async function getTokensFromCode(code, { clientId, clientSecret, redirectUrl }) {
  ;

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
  ;

  if (result.error) {
    throw new TokenError({
      message: result.error_description,
    });
  }
  return result;
}

async function getUser(token, fields = 'id,email,first_name,last_name') {
  try {
    const getUserResponse = await fetch(
      `https://graph.facebook.com/me?fields=${fields}&access_token=${token}`
    );
    const data = await getUserResponse.json();
    ;
    return data;
  } catch (e) {
    ;
    throw new ProviderGetUserError({
      message: 'There was an error fetching the user',
    });
  }
}

export default async function callback({ options, request }) {
    const { query }: any = parseQuerystring(request);
    ;
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
