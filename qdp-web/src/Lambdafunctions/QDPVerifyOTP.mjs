import AWS from 'aws-sdk';
const sqs = new AWS.SQS();

const cognito = new AWS.CognitoIdentityServiceProvider();

const CLIENT_ID = 'vvv42qolhtr3rkgrjd78hdc46';
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/054439588002/RegistrarionQueue';


export const handler = async (event) => {
    const { email, otp } = event;

    try {
        const confirmResponse = await cognito.confirmSignUp({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: otp
        }).promise();

        const message = {
            email : email,
            message: 'Signup successful! Welcome to QDP Web app.'
        };

        await sqs.sendMessage({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(message)
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User confirmed successfully' })
        };

    } catch (error) {
        // Handle errors such as invalid OTP
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Confirmation failed: ' + error.message })
        };
    }
};
