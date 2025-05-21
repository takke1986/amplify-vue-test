import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Tag: a
    .model({
      name: a.string(),
      color: a.string(),
      createdBy: a.string(),
      createdAt: a.string(),
      processSettings: a.string(), // JSON文字列で工程別通知設定
      circularTags: a.hasMany('CircularTag', 'tagId'),
      todoMessages: a.hasMany('TodoMessage', 'tagId'),
    })
    .secondaryIndexes((index) => [index('name'), index('createdBy')])
    .authorization((allow) => [allow.publicApiKey()]),

  Circular: a
    .model({
      title: a.string(),
      content: a.string(),
      creator: a.string(),
      createdAt: a.string(),
      deadline: a.string(),
      process: a.integer(),
      department: a.string(),
      recipients: a.string().array(),
      fileLinks: a.string(), // JSON文字列
      status: a.string(),
      circulationStatus: a.string(), // JSON文字列
      updatedBy: a.string(),
      updatedAt: a.string(),
      history: a.string(), // JSON文字列
      circularTags: a.hasMany('CircularTag', 'circularId'),
      notifications: a.hasMany('Notification', 'circularId'),
    })
    .secondaryIndexes((index) => [
      index('department'),
      index('status'),
      index('deadline'),
      index('creator'),
    ])
    .authorization((allow) => [allow.publicApiKey()]),

  CircularTag: a
    .model({
      circularId: a.id(),
      tagId: a.id(),
      circular: a.belongsTo('Circular', 'circularId'),
      tag: a.belongsTo('Tag', 'tagId'),
    })
    .secondaryIndexes((index) => [index('circularId'), index('tagId')])
    .authorization((allow) => [allow.publicApiKey()]),

  TodoMessage: a
    .model({
      tagId: a.id(),
      tag: a.belongsTo('Tag', 'tagId'),
      process: a.integer(),
      message: a.string(),
      notifications: a.hasMany('Notification', 'todoMessageId'),
    })
    .secondaryIndexes((index) => [index('tagId'), index('process')])
    .authorization((allow) => [allow.publicApiKey()]),

  Notification: a
    .model({
      circularId: a.id(),
      circular: a.belongsTo('Circular', 'circularId'),
      todoMessageId: a.id(),
      todoMessage: a.belongsTo('TodoMessage', 'todoMessageId'),
      status: a.string(),
      statusText: a.string(),
      changeDescription: a.string(),
      actionRequired: a.string(),
      assignee: a.string(),
      dueDate: a.string(),
      statusChangedAt: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .secondaryIndexes((index) => [
      index('circularId'),
      index('todoMessageId'),
      index('assignee'),
      index('status'),
      index('dueDate'),
    ])
    .authorization((allow) => [allow.publicApiKey()]),

  Department: a
    .model({
      departmentId: a.string(),
      departmentCode: a.string(),
      departmentName: a.string(),
      affiliationCode: a.string(),
      affiliationName: a.string(),
      role: a.string(),
      notificationEmails: a.string().array(),
    })
    .secondaryIndexes((index) => [
      index('departmentCode'),
      index('affiliationCode'),
    ])
    .authorization((allow) => [allow.publicApiKey()]),

  // 必要に応じてUserモデルも追加可能
  // User: a.model({
  //   userId: a.string(),
  //   name: a.string(),
  //   email: a.string(),
  //   departmentId: a.string(),
  //   role: a.string(),
  // }).authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
