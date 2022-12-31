import { BaseProvider, OAuthTokens } from '../../types';
import {
	ConfigError,
	ProviderGetUserError,
	TokenError
} from '../../utils/errors';
import { checkTokenResponseError, checkValidResponse, parseQuerystring } from '../../utils/helpers';
import { Discord } from './types';

function _encode(obj: Record<string, unknown>): string {
	let string = "";
  
	for (const [key, value] of Object.entries(obj)) {
	  if (!value) continue;
	  string += `&${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`;
	}
  
	return string.substring(1);
}
  
async function getTokensFromCode(
	code: string,
	{ clientId, clientSecret, redirectUrl, scope = 'identify' }: Discord.GetTokenFromCodeOptions
): Promise<OAuthTokens> {
	;
	const data = {
		'client_id': clientId,
		'client_secret': clientSecret,
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': redirectUrl,
		'scope': scope
	};
	const params = _encode(data);
	const response = await fetch(`https://discordapp.com/api/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

	const result = await response.json();
	
	await checkTokenResponseError(result)
	await checkValidResponse(response);

	return result as OAuthTokens;
}

async function getUser(oauthData: OAuthTokens): Promise<Discord.UserResponse> {
	try {
		const getUserResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				authorization: `${oauthData.token_type} ${oauthData.access_token}`,
			}
		});
		await checkValidResponse(getUserResponse)

		const data = await getUserResponse.json();
		
		return data as Discord.UserResponse;
	} catch (e) {
		;
		throw new ProviderGetUserError({
			message: 'There was an error fetching the user'
		});
	}
}

export default async function callback({ options, request }: BaseProvider.CallbackOptions): Promise<Discord.CallbackResponse> {
	const { query } = parseQuerystring(request);
	
	if (!query.code) {
		throw new ConfigError({
			message: 'No code is paased!'
		});
	}
	const tokens = await getTokensFromCode(query.code, options);
	const providerUser = await getUser(tokens);
	return {
		user: providerUser,
		tokens
	};
}
