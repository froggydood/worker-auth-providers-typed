import jwt from '@tsndr/cloudflare-worker-jwt';
import { BaseProvider } from '../../types';
import { ProviderVerifyOtpError } from '../../utils/errors';
import { get24HourExpiry } from '../../utils/helpers';
import { SendgridEmail } from './types';

function generateJWT({
	secret, to, claims
}: SendgridEmail.JWTOptions) {
	const customClaims = claims || {
		id: to
	};
	
	return jwt.sign({ exp: get24HourExpiry(), ...customClaims}, secret, { algorithm: 'HS256'});
}

export default async function verify({
	options
}: SendgridEmail.VerifyOptions): Promise<SendgridEmail.VerifyResponse> {
	const { kvProvider, to, otp, secret, claims } = options;

	const storedOtp = await kvProvider.get(to);

	if (!storedOtp || Number(otp) !== Number(storedOtp)) {
		throw new ProviderVerifyOtpError({
			message: 'OTP did not match!'
		});
	}

	const token = secret ? await generateJWT({
		secret,
		to,
		claims
	}) : null;

	await kvProvider.delete(to);

	return token ? {
		id: to,
		token
	} : {
		id: to
	};
}
