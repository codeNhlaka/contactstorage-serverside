'use strict';
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

function returnUsername(e){
    if (e){
        const { Authorization } = e;
        const decoded = jwt.decode(Authorization.split(' ')[1]);
        const user = decoded['cognito:username'];
        return user;
    }
    
    return;
}

module.exports.delete = async (event, context, callback) => {
    try {
        const dynamodbClient = new AWS.DynamoDB();
        const deleteParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                ID: {
                    S: event.path.id
                },
                User: {
                    S: returnUsername(event.headers)
                }
            }
        }

        const result = await dynamodbClient.deleteItem(deleteParams).promise();

        const resp = {
            statusCode: 200,
            headers: {
                'Allow-Control-Access-Origin' : '*',
                'Access-Control-Allow-Credentials': true,
                'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
            },
            body: JSON.stringify({
                message: 'Success'
            })
        } 

        callback(null, resp)

    } catch(error){
        callback(error, null);
    }
}