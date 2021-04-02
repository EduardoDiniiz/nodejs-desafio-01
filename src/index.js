const express = require('express');
// const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

// app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if(!user) {
    return response.status(404).json({ error: "User not found." });
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const usernameAlreadyExist = users.some((user) => user.username === username);
  if(usernameAlreadyExist) {
    return response.status(400).json({error: "Username already exists!"});
  }
  const user = {
    id: uuidv4(), // precisa ser um uuid
    name: name, 
    username: username, 
    todos: []
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const todoExist = user.todos.some((todo) => todo.id === id);

  if(todoExist) {
    const todo = user.todos.find((todo) => todo.id === id);
    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(200).json(todo);
  }

  return response.status(404).json({error: "Todo not found!"});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoExist = user.todos.some((todo) => todo.id === id);  

  if(todoExist) {
    const todo = user.todos.find((todo) => todo.id === id);
    todo.done = true;

    return response.status(200).json(todo);
  }

  return response.status(404).json({error: "Todo not found!"});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoExist = user.todos.some((todo) => todo.id === id);  

  if(todoExist) {
    const todo = user.todos.find((todo) => todo.id === id);
    user.todos = user.todos.filter((todo) => todo.id !== id);
    
    return response.status(204).json(todo);
  }

  return response.status(404).json({error: "Todo not found!"});
});

module.exports = app;