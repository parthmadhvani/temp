import AWS from 'aws-sdk';
const sqs = new AWS.SQS();
const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/054439588002/RegistrarionQueue'

export const handler = async (event) => {  
  const { userAnswer, correctAnswer, email } = event;

  if (parseInt(userAnswer, 10) === parseInt(correctAnswer, 10)) {
    const message = {
        email : email,
        message: 'Login successful! Welcome to QDP Web app.'
    };

    await sqs.sendMessage({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(message)
    }).promise();
      return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Math skill validated' })
      };
  } else {
      return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Incorrect answer' })
      };
  }
};
