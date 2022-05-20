import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
console.log(XAWS);//just to make sure the variable is used

const logger = createLogger('TodosAccess')


export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(), 
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(userId: String): Promise<TodoItem[]> {
    
    logger.info('Getting all todos')
    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: '#userId =:userId',
        ExpressionAttributeNames: {
            '#userId': 'userId'
        },
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todoId: string, userId: string, update: TodoUpdate): Promise<TodoUpdate> {

    await this.docClient.update({
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        ExpressionAttributeNames: {
            '#nameToDo': 'name',
            '#dueDateToDo': 'dueDate',
            '#doneToDo': 'done'
        },
        ExpressionAttributeValues: {
        ":name": update.name,
        ":dueDate": update.dueDate,
        ":done": update.done
        },
        UpdateExpression:
            "SET #nameToDo = :name, #dueDateToDo = :dueDate, #doneToDo = :done",
        ReturnValues: "UPDATED_NEW"
    }).promise()

    return update
  }


async deleteTodo(todoId: string, userId: string): Promise<boolean> {
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        }
        }).promise()

    return true
    }


}


function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new AWS.DynamoDB.DocumentClient()
  }
