import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) { }

    // getAllTodos.
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Call -------getAllTodos------')
        logger.info(`userID: ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        logger.info(`Result: ${items}`)
        logger.info('End call getAllTodos function.')
        return items as TodoItem[]
    }

    // createTodoItem.
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Call -------createTodoItem------')
        logger.info(`Create TodoItemID: ${todoItem.todoId}`)

        const result = await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todoItem
            }).promise()
        logger.info('Create result:', result)
        logger.info('End call createTodoItem function.')
        return todoItem as TodoItem
    }

    // updateTodoItem
    async updateTodoItem(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Call -------updateTodoItem------')
        logger.info(`Update todo itemID: ${todoId}`)

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ReturnValues: 'ALL_NEW'
        }).promise()
        const updateItem = result.Attributes
        logger.info('Update result:', updateItem)
        logger.info('End call updateTodoItem function.')
        return updateItem as TodoUpdate
    }

    // deleteTodoItem
    async deleteTodoItem(todoId: string, userId: string): Promise<string> {
        logger.info('Call -------deleteTodoItem------')
        logger.info(`Delete todo itemID: ${todoId}`)

        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()
        logger.info('Delete result:', result)
        logger.info('End call deleteTodoItem function.')
        return todoId as string
    }
}