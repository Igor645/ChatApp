const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();

const uri = 'mongodb+srv://admin:kali@chat-application.1tsxyfg.mongodb.net/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Create an HTTP server instance using Express
const server = app.listen(port, () => console.log(`Server running on port ${port}`));

// Create WebSocket server using the HTTP server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  });

  
  const newMessage = { type: 'newMessage' };
  ws.send(JSON.stringify(newMessage));
});

app.get('/api/chats/:objectId', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('chat-app').collection('Chats');

    const objectId = req.params.objectId; // Assuming the objectId is passed as a parameter

    // Convert the provided string to a MongoDB ObjectId
    const searchObjectId = new ObjectId(objectId);

    // Search for chats that contain the provided ObjectId in their users array
    const chats = await collection.find({ users: searchObjectId }).toArray();

    res.json(chats); // Send the found chats as a JSON response
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/user/:objectId', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('chat-app').collection('Users');

    const objectId = req.params.objectId; // Assuming the objectId is passed as a parameter

    // Convert the provided string to a MongoDB ObjectId
    const searchObjectId = new ObjectId(objectId);

    // Search for the user by ObjectId
    const user = await collection.findOne({ _id: searchObjectId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user); // Send the found user as a JSON response
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('chat-app').collection('Users');
    const { Email, Password } = req.body;

    // Check if the user exists with the provided email
    const user = await collection.findOne({ Email: Email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(Password, user.Password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // If the login is successful, return the user data (except the password)
    const loggedInUser = { _id: user._id, Email: user.Email, Username: user.Username};

    res.status(200).json({ message: 'Login successful', user: loggedInUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/register', async (req, res) => {
  try {  
    await client.connect();
    const collection = client.db('chat-app').collection('Users');
    const { Username, Password, Email } = req.body;

    const doesUserExistByEmail = async (email) => {    
      const user = await collection.findOne({ Email: email });
    
      return !!user;
    };

    const userExists = await doesUserExistByEmail(Email);

    if (userExists) {
      console.log("User exists")
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // If the user doesn't exist, proceed with registration
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = {
      Username: Username,
      Password: hashedPassword,
      Email: Email,
      Chats: []
    };

    await collection.insertOne(newUser);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const generateUniqueUniqPas = async (collection) => {
  const generateRandomUniqPas = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uniqPas = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      uniqPas += charset[randomIndex];
    }
    return uniqPas;
  };

  let newUniqPas;
  let isUnique = false;

  while (!isUnique) {
    newUniqPas = generateRandomUniqPas();
    const existingChat = await collection.findOne({ uniqPas: newUniqPas });
    if (!existingChat) {
      isUnique = true;
    }
  }

  return newUniqPas;
};

app.post('/api/create-chat', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('chat-app').collection('Chats');

    const { users, messages } = req.body;

    // Generate a new unique 6-character uniqPas
    const uniqPas = await generateUniqueUniqPas(collection);

    // Convert strings to MongoDB ObjectIds
    const userObjectIds = users.map(userId => new ObjectId(userId));

    const newChat = {
      uniqPas: uniqPas,
      users: userObjectIds,
      messages: messages
    };

    await collection.insertOne(newChat);

    res.status(201).json({ message: 'Chat created successfully' });
  } catch (error) {
    console.error('Chat creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chat-messages/:chatId', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('chat-app').collection('Chats');
    const messageCollection = client.db('chat-app').collection('Messages');

    const chatId = req.params.chatId; // Assuming the chatId is passed as a parameter

    // Convert the provided string to a MongoDB ObjectId
    const searchChatId = new ObjectId(chatId);

    // Find the chat with the given ID
    const chat = await collection.findOne({ _id: searchChatId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    let messageIds = chat.messages || [];

    // Convert each string message ID to MongoDB ObjectId
    messageIds = messageIds.map(id => new ObjectId(id));
    messageIds = chat.messages;

    if (!messageIds || messageIds.length === 0) {
      return res.status(200).json({ messages: [] });
    }

    const messages = await messageCollection.find({ _id: { $in: messageIds } }).sort({ Datum: 1 }).toArray();

    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error('Chat messages retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/chat-users/:chatId', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('chat-app').collection('Chats');
    const usersCollection = client.db('chat-app').collection('Users');

    const chatId = req.params.chatId; // Assuming the chatId is passed as a parameter

    // Convert the provided string to a MongoDB ObjectId
    const searchChatId = new ObjectId(chatId);

    // Find the chat with the given ID
    const chat = await collection.findOne({ _id: searchChatId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Get usernames for users in the chat
    const userIds = chat.users.map(userId => new ObjectId(userId));
    const users = await usersCollection.find({ _id: { $in: userIds } }).project({ Username: 1 }).toArray();

    res.status(200).json({ users: users });
  } catch (error) {
    console.error('Chat users retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add-message', async (req, res) => {
  try {
    const { chatId, userId, content } = req.body;

    // Create a new message object
    const newMessage = {
      Nachricht: content,
      Datum: new Date().toLocaleString(), // Get current date and time
      UserId: new ObjectId(userId) // Convert the userId string to ObjectId
    };

    // Store the new message in the Messages collection
    const messageCollection = client.db('chat-app').collection('Messages');
    const { insertedId } = await messageCollection.insertOne(newMessage);

    // Update the respective chat's messages array with the new message's ID
    const chatCollection = client.db('chat-app').collection('Chats');
    const chatObjectId = new ObjectId(chatId);

    await chatCollection.updateOne(
      { _id: chatObjectId },
      { $push: { messages: insertedId } }
    );

    res.status(200).json({ message: 'Message added successfully', messageId: insertedId });
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ type: 'newMessage', messageId: insertedId }));
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add-user-to-chat', async (req, res) => {
  try {
    const { uniqPas, userId } = req.body;

    await client.connect();
    const collection = client.db('chat-app').collection('Chats');

    // Search for the chat by uniqPas
    const chat = await collection.findOne({ uniqPas: uniqPas });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Convert userId to MongoDB ObjectId
    const userObjectId = new ObjectId(userId);

    // Check if the user is already in the users array
    const userExists = chat.users.some(user => user.equals(userObjectId));

    if (userExists) {
      return res.status(400).json({ error: 'User already exists in the chat' });
    }

    // Add the user to the users array of the chat
    await collection.updateOne(
      { uniqPas: uniqPas },
      { $push: { users: userObjectId } }
    );

    res.status(200).json({ message: 'User added to chat successfully' });
  } catch (error) {
    console.error('Add user to chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/synchronize-messages/:chatId/:loadedMessages', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('chat-app').collection('Chats');
    const messageCollection = client.db('chat-app').collection('Messages');

    const chatId = req.params.chatId; // Assuming the chatId is passed as a parameter
    const loadedMessages = req.query.loadedMessages ? new Set(JSON.parse(req.query.loadedMessages)) : new Set();

    // Convert the provided string to a MongoDB ObjectId
    const searchChatId = new ObjectId(chatId);

    // Find the chat with the given ID
    const chat = await collection.findOne({ _id: searchChatId });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    let messageIds = chat.messages || [];

    // Convert each string message ID to MongoDB ObjectId
    messageIds = messageIds.map(id => new ObjectId(id));

    if (!messageIds || messageIds.length === 0) {
      return res.status(200).json({ messages: [] });
    }

    // Filter messages based on loadedMessages set
    const unloadedMessageIds = messageIds.filter(id => !loadedMessages.has(id.toString()));

    const messages = await messageCollection.find({ _id: { $in: unloadedMessageIds } }).sort({ Datum: 1 }).toArray();

    // Extract unique user IDs from the messages
    const userIds = Array.from(new Set(messages.map(message => new ObjectId(message.UserId))));

    // Fetch usernames corresponding to the user IDs
    const userCollection = client.db('chat-app').collection('Users');
    const users = await userCollection.find({ _id: { $in: userIds } }).toArray();
    console.log(users)
    // Map user IDs to their respective usernames
    const userIdToUsername = new Map(users.map(user => [user._id.toString(), user.Username]));
    console.log(userIdToUsername)

    // Add usernames to each message object
    messages.forEach(message => {
      const username = userIdToUsername.get(message.UserId.toString());
      message.Username = username; // Add the 'username' property to the message
    });
    console.log(messages)
    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error('Chat messages retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
