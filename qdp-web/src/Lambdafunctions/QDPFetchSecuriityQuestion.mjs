import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'QDPUserTable';

export const handler = async (event) => {
  const { email} = event;

    try {
        const user = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { email }
        }).promise();

        if (!user.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' })
            };
        }
        // Check if user exists and has a security question
        if (user.Item && user.Item.question) {
          return {
              statusCode: 200,
              body: JSON.stringify({ question: user.Item.question })
          };
        } else {
          return {
              statusCode: 404,
              body: JSON.stringify({ message: 'User not found or no security question set' })
          };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }

}