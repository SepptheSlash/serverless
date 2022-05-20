import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'; //formerly done with class AttachmentURL??
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
//TODOimport { parseUserId } from '../auth/utils'
//TODOimport { Uuid } from 'aws-sdk/clients/groundstation';
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('todos');
const errors = createError('todos-errors');
console.log(errors); //just for making sure the variable is used

const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

// TODO: Implement businessLogic
export async function getTodosForUser(userId: String): Promise<TodoItem[]> {
    return await todosAccess.getAllTodos(userId)
  }


export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
  ): Promise<TodoItem> {
    
    logger.info('A todo item is created from ', userId);

    const itemId = uuid.v4()
  
    return await todosAccess.createTodo({
      userId: userId,
      todoId: itemId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false,
      //attachmentUrl?: createTodoRequest.attachmentUrl
      //attachmentUrl??
    })
  }


  export async function updateTodo(
    updatedTodo: UpdateTodoRequest,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {

    return await todosAccess.updateTodo(todoId, userId, updatedTodo)
  }


  export async function deleteTodo(
    todoId: string,
    userId: string
  ): Promise<boolean> {

    return await todosAccess.deleteTodo(todoId, userId)
  }
/*
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
  */


  export async function createAttachmentPresignedUrl(
    todoId: string,
    userId: string
  ): Promise <string> {
    
    console.log('The user to delete a todo is ' + userId)
    return await attachmentUtils.getPreSignedUrl(todoId)
  }