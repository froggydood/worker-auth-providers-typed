import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { getFixedDigitRandomNumber } from '../../utils/helpers';
import { ConfigError, UnknownError } from '../../utils/errors';

export default async function send({ options }) {
	const {
		region,
		otpLength = 4,
		message = 'Your verification code is: {OTP}',
		phone,
		kvProvider,
		expirationTtl = 60,
		accessKeyId,
		secretAccessKey
	} = options;

	const client = new SNSClient({
		region,
		credentials: {
            accessKeyId,
            secretAccessKey
        }
	});
	const otp = getFixedDigitRandomNumber(otpLength);

	if (otpLength < 4) {
		throw new ConfigError({
			message: 'OTP length can not be less then 4'
		});
	}

	const otpMessage = message.replace('{OTP}', otp);

	;

	const params = {
		Message: otpMessage,
		PhoneNumber: phone
	};
	const command = new PublishCommand(params);

	try {
		const data = await client.send(command);
		;
		const savedData = await kvProvider.put(phone, otp, {
			expirationTtl
		});
		;
		return data;
	} catch (e) {
		;
		throw new UnknownError({
			message: 'e.stack'
		});
	}
}