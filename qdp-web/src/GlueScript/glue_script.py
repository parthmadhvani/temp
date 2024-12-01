import sys
import time
import json
import boto3
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
from pyspark.sql.functions import col

# Get input and output paths
args = getResolvedOptions(sys.argv, ['S3_INPUT_PATH', 'S3_OUTPUT_PATH','FileId'])

# Initialize Spark and Glue context
sc = SparkContext.getOrCreate()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init('json-to-csv-conversion', args)

# AWS S3 and DynamoDB Connection setup
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('QDPFileProcessingRecords')
print("AWS S3 and DynamoDB Connection established")


# Read the input JSON file from S3
df = spark.read.option("multiline", "true").json(args['S3_INPUT_PATH'])

# Function to check if the DataFrame is flattened
def is_flattened(df):
    for field in df.schema.fields:
        if isinstance(field.dataType, (StructType, ArrayType, MapType)):
            return False
    return True

# Function to flatten the JSON DataFrame
def flatten_json(df):
    while not is_flattened(df):
        columns_to_process = 2
        columns_to_drop = []
        processed_columns = 0

        for col_name, col_type in df.dtypes:
            if processed_columns >= columns_to_process:
                break

            field_type = df.schema[col_name].dataType

            if isinstance(field_type, StructType):
                for field in field_type.fields:
                    new_col_name = f"{col_name}_{field.name}"
                    df = df.withColumn(
                        new_col_name,
                        when(col(col_name).isNotNull(), col(col_name).getItem(field.name)).otherwise(lit(None))
                    )
                columns_to_drop.append(col_name)
                processed_columns += 1

            elif isinstance(field_type, ArrayType):
                df = df.withColumn(col_name, explode(coalesce(col(col_name), array(lit(None)))))
                processed_columns += 1

            elif isinstance(field_type, MapType):
                df = df.withColumn(col_name, explode(coalesce(col(col_name), lit({}))))
                processed_columns += 1

        df = df.drop(*columns_to_drop)

    return df

# Flattened Json DF
flattened_df = flatten_json(df)

# Define output file name and paths
bucket_name = 'qdpoutputcsvfile'
output_file_name = args['S3_OUTPUT_PATH'].replace('s3://qdpoutputcsvfile/','')
intermediate_s3_path = f"{'s3://qdpoutputcsvfile/outputCsv'}/intermediate"
# final_s3_path = f"{intermediate_s3_path}/{output_file_name}"

print(f"Metadata updated in DynamoDB for {output_file_name}: Status - {intermediate_s3_path}")


# Step 1: Write flattened data to an intermediate S3 path
flattened_df.write.mode("overwrite").option("header", "true").csv(intermediate_s3_path)

# List files in the intermediate directory
response = s3.list_objects_v2(Bucket=bucket_name, Prefix='outputCsv/intermediate/')
files = response.get('Contents', [])

# Introduce a delay to account for writing the CSV to S3
time.sleep(30)

# Ensure there are files in the intermediate path
if files:
    first_file_key = files[0]['Key']  # Get the key of the first file in the intermediate directory

    # Step 2: Copy the CSV from the intermediate location to the final S3 location with a specific file name
    s3.copy_object(
        Bucket=bucket_name,
        CopySource={'Bucket': bucket_name, 'Key': first_file_key},
        Key=f'{output_file_name}'
    )
    s3.delete_object(Bucket = bucket_name, Key = first_file_key)
    print(f"File copied successfully to outputCsv/{output_file_name}")

else:
    print("No files found in the intermediate path. Please check if the write operation succeeded.")



# Save metadata and job status in DynamoDB
job_status = "completed"
try:
    table.update_item(
        Key={'fileId': args['FileId']},
        UpdateExpression="SET #status = :status, referenceId = :referenceId",
        ExpressionAttributeNames={
            '#status': 'status'
        },
        ExpressionAttributeValues={
            ':status': job_status,
        }
    )
    print(f"Metadata updated in DynamoDB for {args['S3_INPUT_PATH']}: Status - {job_status}")
except Exception as e:
    print(f"Error updating DynamoDB: {str(e)}")

# Glue job Completion
job.commit()
