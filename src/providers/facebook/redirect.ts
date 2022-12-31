import * as queryString from 'query-string';
import { BaseProvider } from '../../types';
import { ConfigError } from '../../utils/errors';
import { Facebook } from './types';

export default async function redirect({ options }: Facebook.RedirectOptions): Promise<string> {
	const {
		clientId,
		redirectUrl,
		scope = 'email, user_friends',
		responseType = 'code',
		authType = 'rerequest',
		display = 'popup'
	} = options;
	if (!clientId) {
		throw new ConfigError({
			message: 'No client id passed'
		});
	}
	const params = queryString.stringify({
		client_id: clientId,
		redirect_uri: redirectUrl,
		scope,
		response_type: responseType,
		auth_type: authType,
		display
	});

	const url = `https://www.facebook.com/v4.0/dialog/oauth?${params}`;
	return url;
}
