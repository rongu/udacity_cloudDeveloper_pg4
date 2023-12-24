import { TodosAccess } from '../todoDB/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
//import * as uuid from 'uuid'
const uuid = require('uuid')

// TODO: Implement businessLogic
const logger = createLogger('TodosAccess')
const attachmentUtils = new AttachmentUtils()
const todosAcess = new TodosAccess()

// getTodosForUser
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Call -------getTodosForUser------')
    return todosAcess.getAllTodos(userId)
}

// createTodo
export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info('Call -------createTodo------')
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }
    return await todosAcess.createTodoItem(newItem)
}

// updateTodo
export async function updateTodo(todoId: string,todoUpdate: UpdateTodoRequest,userId: string): Promise<TodoUpdate> {
    logger.info('Call -------updateTodo------')
    return todosAcess.updateTodoItem(todoId, userId, todoUpdate)
}

// deleteTodo
export async function deleteTodo(todoId: string,userId: string): Promise<string> {
    logger.info('Call -------deleteTodo------')
    return todosAcess.deleteTodoItem(todoId, userId)
}

// createAttachmentPresignedUrl
export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info('Create attachment presigned url function by: ', userId, todoId)
    return attachmentUtils.getUploadUrl(todoId)
}