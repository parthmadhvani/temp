import AWS from 'aws-sdk';

const glue = new AWS.Glue();

// Define the Glue job name
const GLUE_JOB_NAME = 'json-to-csv-conversion';

export const handler = async (event) => {
  for (const record of event.Records) {
    // Check if the event is an 'INSERT' operation in DynamoDB
    if (record.eventName !== 'INSERT') {
      console.log('Skipping non-INSERT event');
      continue;
    }

    // Extract data from DynamoDB event
    const newItem = record.dynamodb.NewImage;
    const fileId = newItem.fileId.S;  // File ID
    const inputFileLocation = newItem.inputFileLocation.S;  // Input S3 path
    const outputFileLocation = newItem.outputFileLocation.S;  // Output S3 path

    console.log(`Triggering Glue job for File ID: ${fileId}`);
    console.log(`Input File Location: ${inputFileLocation}`);
    console.log(`Output File Location: ${outputFileLocation}`);

    try {
      // Start the Glue job with the extracted input and output paths
      await glue.startJobRun({
        JobName: GLUE_JOB_NAME,
        Arguments: {
          '--S3_INPUT_PATH': inputFileLocation,
          '--S3_OUTPUT_PATH': outputFileLocation,
          '--FileId':fileId
        }
      }).promise();

      console.log(`Glue job started successfully for File ID: ${fileId}`);

    } catch (error) {
      console.error(`Error starting Glue job for File ID: ${fileId}`, error);
      return {
        statusCode: 500,
        body: JSON.stringify(`Error starting Glue job: ${error.message}`)
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Glue job triggered successfully")
  };
};
