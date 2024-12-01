import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const USER_POOL_ID = 'us-east-1_m71VbRG4P';
const CLIENT_ID = 'vvv42qolhtr3rkgrjd78hdc46';
const TABLE_NAME = 'QDPUserTable';

export const handler = async (event) => {
    const { email, password, userType, question, answer } = event;

    try {
        // Register user in Cognito
        const cognitoResponse = await cognito.signUp({
            ClientId: CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [
                { Name: 'custom:user_type', Value: userType }
            ]
        }).promise();

        // Store user information and security question in DynamoDB
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: {
                email,
                userType,
                question,
                answer
            }
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User registered successfully' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};
