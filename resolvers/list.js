'use strict';
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

function returnUsername(e){
  if (e){
      const { Authorization } = e;
      const decoded = jwt.decode(Authorization.split(' ')[1]);
      const user = decoded['cognito:username'];
      return user;
  }
  
  return;
}

module.exports.list = async (event, context, callback) => {
  let username = '';

  try {
    username = returnUsername(event.headers);
  } catch(error){
      callback(error, null)
  }

  try {
    const dynamodbClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        IndexName: "User-index",
        ExpressionAttributeValues: {
          ":v1": username
         },
         ExpressionAttributeNames: {
          "#userId": "User",
        },
        KeyConditionExpression: "#userId = :v1"
    }

    const result = await dynamodbClient.query(params).promise();
    
    const resp = {
      statusCode: 200,
      headers: {
          "Allow-Control-Access-Origin": "*",
          "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({result, username})
    }

    callback(null, resp);

  } catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}