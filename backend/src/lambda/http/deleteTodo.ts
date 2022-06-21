import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId = getUserId(event);

    const deletedSuccessfully = await deleteTodo(todoId, userId);

    if (deletedSuccessfully){
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: JSON.stringify(`Deleted item ${todoId} of user ${userId} succesfully!`)
        })
      }
    }

    return {
      statusCode: 400,
      body: `Error while deleting item ${todoId} of user ${userId}`
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
