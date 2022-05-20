import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { updateToDowithAttachmentUrl } from '../../helpers/attachmentUtils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event);

    try {
    const signedUrl = await createAttachmentPresignedUrl(todoId, userId);
    await updateToDowithAttachmentUrl(todoId, userId);

    return {statusCode: 200,
      body: JSON.stringify({
        uploadUrl: signedUrl,
      })
      }
    }catch (e){
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: e,
        })
    };
  }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
