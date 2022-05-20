import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient: DocumentClient = createDynamoDBClient();
const todosTable = process.env.TODOS_TABLE;



// TODO: Implement the fileStogare logic

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
        private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET) {
        }

    async getPreSignedUrl(
    todoId: string,
  ): Promise <string> {
    
    return this.s3.getSignedUrl('putObject', {
        	    Bucket: this.s3BucketName,
        	    Key: todoId,
        	    Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
        	  })
  }
}

export async function updateToDowithAttachmentUrl(todoId: string, userId: string): Promise <string> {
    await docClient.update({
        TableName: todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        ExpressionAttributeNames: {
            '#attachmentUrlToDo': 'attachmentUrl',
        },
        ExpressionAttributeValues: {
        ":attachmentUrl": `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`
        },
        UpdateExpression:
            "SET #attachmentUrlToDo = :attachmentUrl",
        ReturnValues: "UPDATED_WITH_ATTACHMENTURL"
    }).promise()
    
    return 'updated attachment Url'
}

function createDynamoDBClient() {
  return new XAWS.DynamoDB.DocumentClient()
}