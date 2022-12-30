import jwt from '@tsndr/cloudflare-worker-jwt';
import { BaseProvider, KVProvider } from '../../types';
import { ProviderVerifyOtpError } from '../../utils/errors';
import { get24HourExpiry } from '../../utils/helpers';


function generateJWT({ secret, phone, claims }: BaseProvider.JWTOptions): Promise<string> {
	const customClaims = claims || {
		id: phone
	};

	return jwt.sign({ exp: get24HourExpiry(), ...customClaims}, secret, { algorithm: 'HS256' });
}

export default async function verify({ options }: BaseProvider.VerifyOptions) {
	const { kvProvider, phone, otp, secret, claims } = options;

	const storedOtp = await kvProvider.get(phone);

	if (!storedOtp || Number(otp) !== Number(storedOtp)) {
		throw new ProviderVerifyOtpError({
			message: 'OTP did not match!'
		});
	}

	const token = secret ? generateJWT({
		secret,
		phone,
		claims
	}) : null;

	;
	await kvProvider.delete(phone);

	return token ? {
		id: phone,
		token
	} : {
		id: phone
	};
}