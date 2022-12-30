import { ConfigError, ProviderGetUserError, TokenError } from '../../utils/errors';
import { parseQuerystring } from '../../utils/helpers';

async function getTokensFromCode(code, { clientId, clientSecret }) {
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
  ;

  if (result.error) {
    throw new TokenError({
      message: result.error_description,
    });
  }
  return result;
}

async function getUser(token) {
  try {
    const headers = {
      accept: 'application/vnd.github.v3+json',
      authorization: `token ${token}`,
      'user-agent': 'cool-bio-analytics-github-oauth-login',
    };
    ;
      const getUserResponse = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers,
    });
    const data = await getUserResponse.json();
    ;
    if (!data.email) {
          // If the user does not have a public email, get another via the GitHub API
          // See https://docs.github.com/en/rest/users/emails#list-public-email-addresses-for-the-authenticated-user
          const res = await fetch("https://api.github.com/user/emails", {
                method: 'GET',
                headers,
          });
          const emails = await res.json()
          ;
          data.emails = emails
          data.email = (emails.find((e) => e.primary) ?? emails[0]).email
    }
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
  ;
  const providerUser = await getUser(accessToken);
  return {
    user: providerUser,
    tokens
  };
}
