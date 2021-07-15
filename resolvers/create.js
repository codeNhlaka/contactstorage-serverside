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

module.exports.create = async (event, context, callback) => {
    let body = {}, username = '';

    try {
        body = JSON.parse(event.body);
        username = returnUsername(event.headers);
    
    } catch(error){
        callback(error, null);
    }

    try {
        const dynamodbClient = new AWS.DynamoDB({apiVersion: '2012-08-10'});
        const {id, name, digits} = body;

        const putParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                ID: {
                    S: id
                },
                User: {
                    S: username
                },
                Digits: {
                    S: digits
                },
                Name: {
                    S: name
                }
            }
        }

        const result = await dynamodbClient.putItem(putParams).promise();
    
        const resp = {
                statusCode: 201,
                headers: {
                    'Access-Control-Allow-Headers' : 'Content-Type',
                    'Allow-Control-Access-Origin' : '*',
                    'Access-Control-Allow-Credentials': true,
                    'Access-Control-Allow-Methods': 'OPTIONS,POST'
                },
                body: JSON.stringify({
                    message: 'Success'
                })
            }
    
        callback(null, resp);
        
    } catch(error){
        callback(error, null);
    }

}