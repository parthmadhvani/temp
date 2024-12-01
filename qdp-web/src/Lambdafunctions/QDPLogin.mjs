import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider();
import axios from 'axios';
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const CLIENT_ID = 'vvv42qolhtr3rkgrjd78hdc46';
const DYNAMO_TABLE_NAME = 'QDPUserTable';


export const handler = async (event) => {
    const { email, password } = event;

    try {
        // Authenticate user with Cognito using username and password
        const authResponse = await cognito.initiateAuth({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        }).promise();

        const dynamoResponse = await dynamoDB
            .get({
                TableName: DYNAMO_TABLE_NAME,
                Key: { email },
            })
            .promise();

        if (!dynamoResponse.Item) {
            throw new Error(`User with email ${email} not found in DynamoDB`);
        }

        let userType = dynamoResponse.Item.userType || 'Guest';
        if(userType === "admin"){
            userType = "QDP Agent";
        }
        else if(userType==="customer"){
            userType = "Registered Customer"
        }
        console.log("dssdd" + userType);

        function convertToISO(dateObj) {
            const timestamp = dateObj._seconds * 1000 + dateObj._nanoseconds / 1e6;
            return new Date(timestamp).toISOString();
        }

        const userStatisticsUrl = `https://us-central1-serverless-project-gp3.cloudfunctions.net/getUserStatistics`;
        let loginCount = 0;

        try {
            const userStatsResponse = await axios.get(userStatisticsUrl,{params: {"user_id":email}});
            console.log(userStatsResponse.data.data.login_count);

            if (userStatsResponse.data.statusCode === 200) {

                loginCount = userStatsResponse.data.data.login_count + 1;

                await axios.post(
                    `https://us-central1-serverless-project-gp3.cloudfunctions.net/storeUserStatistics`,
                    {
                        last_login: new Date().toISOString(),
                        login_count: loginCount,
                        registration_date: convertToISO(userStatsResponse.data.data.registration_date),
                        user_id: email,
                        user_type: userType,
                    },
                    { headers: { 'Content-Type': 'application/json' } }
                );
            }
        } catch (error) {
            console.log(error.response);
            if (error.response && error.response.status === 404) {
                await axios.post(
                    `https://us-central1-serverless-project-gp3.cloudfunctions.net/storeUserStatistics`,
                    {
                        last_login: new Date().toISOString(),
                        login_count: 1,
                        registration_date: new Date().toISOString(),
                        user_id: email,
                        user_type: userType,
                    },
                    { headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                throw new Error(`Error fetching user statistics: ${error.message}`);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'First factor authentication successful',
                accessToken: authResponse.AuthenticationResult.AccessToken,
                idToken: authResponse.AuthenticationResult.IdToken,
                refreshToken: authResponse.AuthenticationResult.RefreshToken ,
                userType: userType
            })
        };

    } catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Authentication failed: ' + error.message })
        };
    }
};
