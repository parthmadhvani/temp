import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'QDPUserTable';

export const handler = async (event) => {
    const { email, answer } = event;

    try {

      const user = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { email }
        }).promise();

        if (user.Item && user.Item.answer === answer) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Security question validated' })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Incorrect answer' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};
