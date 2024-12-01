import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider();


export const handler = async (event) => {

    const token = event.headers['Authorization'];

    let userEmail;
    try {
        const user = await cognito.getUser({
            "AccessToken": token.toString()
        }).promise();

        userEmail = user.UserAttributes.find(attr => attr.Name === 'email').Value;
    } catch (error) {
        return {
            statusCode: 403,
            body: JSON.stringify("Invalid or expired token")
        };
    }
    return {
        statusCode: 200,
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
            userEmail: userEmail,
        })
    };
};
