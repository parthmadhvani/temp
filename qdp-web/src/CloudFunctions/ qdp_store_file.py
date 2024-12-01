from google.cloud import firestore, storage, bigquery
import json
import uuid
import re
import collections
from datetime import datetime
import functions_framework

db = firestore.Client()
storage_client = storage.Client()
bigquery_client = bigquery.Client()

bucket_name = 'qdpwordcloudbucket'
dataset_name = 'wordcloud_dataset'
table_name = 'wordcloud_data'

@functions_framework.http
def store_file(request):
    try:
        # Parse the JSON input
        data = request.get_json()

        # Validate required fields
        required_fields = ['fileName', 'email', 'fileContent']
        if not all(field in data for field in required_fields):
            return json.dumps({"error": "Missing required fields"}), 400

        file_name = data['fileName']
        email = data['email']
        file_content = data['fileContent']
        referenceId = data['referenceId']

        # Generate a unique ID for the record
        unique_id = uuid.uuid4().hex
        temp_id = unique_id + file_name


        # Save details to Firestore
        doc_ref = db.collection("qdpwordcloud").document(unique_id)
        doc_ref.set({
            "id": unique_id,
            "fileName": file_name,
            "email": email,
            "uploadedAt": firestore.SERVER_TIMESTAMP,
            "location": f"gs://{bucket_name}/uploads/{temp_id}",
            "status": "Processing",
            "referenceId":referenceId
        })

        # Save the file to Cloud Storage
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(f"uploads/{temp_id}")
        blob.upload_from_string(file_content, content_type="text/plain")

        # Compute word frequencies
        words = re.findall(r'\b\w+\b', file_content.lower())
        word_count = collections.Counter(words)

        # Prepare data for BigQuery
        rows_to_insert = [
            {"document_id": unique_id, "word": word, "frequency": count,"file_name" : file_name, "email":email}
            for word, count in word_count.items()
        ]

        # Define BigQuery table ID
        table_id = f"{bigquery_client.project}.{dataset_name}.{table_name}"

        # Batch insert rows into BigQuery ensuring uniqueness
        for row in rows_to_insert:
            query = f"""
            INSERT INTO `{table_id}` (document_id, word, frequency, file_name, email)
            VALUES ("{row['document_id']}", "{row['word']}", {row['frequency']}, "{row['file_name']}", "{row['email']}")
            """
            bigquery_client.query(query).result()

        # Update Firestore document status
        doc_ref.update({
            "status": "Ready for Looker Studio",
            "processedAt": firestore.SERVER_TIMESTAMP
        })

        # Success response
        return json.dumps({
            "message": "File and metadata successfully stored, and data inserted into BigQuery",
            "recordId": unique_id,
            "fileUrl": f"gs://{bucket_name}/uploads/{temp_id}",
        }), 200

    except Exception as e:
        # Handle exceptions and update Firestore status
        doc_ref.update({
            "status": "Failed",
            "errorMessage": str(e)
        }) if 'doc_ref' in locals() else None
        return json.dumps({"error": str(e)}), 500