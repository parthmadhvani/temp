import AWS from 'aws-sdk';
import axios from 'axios';

const cognito = new AWS.CognitoIdentityServiceProvider();

export const handler = async (event) => {
  const token = event.headers['Authorization'];
  const fileName = event.queryStringParameters['filename'];
  const txtContent = JSON.parse(event.body).content; // Assuming the text file content is passed in the request body as plain text
  let userEmail;
  let referenceId;
  const timestamp = Date.now();
  const jobName = "jb_";
  referenceId = jobName.concat(timestamp);

  // Step 1: Retrieve user email from Cognito
  try {
    const user = await cognito.getUser({
      AccessToken: token.toString(),
    }).promise();

    userEmail = user.UserAttributes.find(attr => attr.Name === 'email').Value;
  } catch (error) {
    return {
      statusCode: 403,
      body: JSON.stringify("Invalid or expired token"),
    };
  }

  // Step 2: Prepare payload for the other cloud function
  const payload = {
    email: userEmail,
    fileName: fileName,
    fileContent: txtContent,
    referenceId : referenceId
  };

  // Step 3: Send payload to the other cloud function
  const cloudFunctionEndpoint = "https://us-central1-csci-5410-441714.cloudfunctions.net/qdp_store_file"; // Replace with actual endpoint
  try {
    const response = await axios.post(cloudFunctionEndpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Response from other cloud function:", response.data);
  } catch (error) {
    console.error("Error invoking other cloud function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send data to the other cloud function",
        error: error.message,
      }),
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
      message: "File processing in progress",
      referenceId : referenceId
    }),
  };
};
