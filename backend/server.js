import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
// import data from './data.js';
import userRouter from './routers/userRouter.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import uploadRouter from './routers/uploadRouter.js';
import path from 'path'

// to read the content of env
dotenv.config();

const app = express();

// a middleware will transfor the data to json req.body in the app{
// add middleware which parsing json data in the body of middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// }

mongoose.connect( process.env.MONGODB_URL  ||'mongodb://localhost/amazona'
// , {
//     useNewUrlParser: true, // <-- no longer necessary
//     useUnifiedTopology: true, // <-- no longer necessary
//     useCreateIndex: true // <-- no longer necessary
// }
);


// there is no need to them we will fetch data from mongodb instead of data.js
/*
app.get('/api/products/:id', (req, res) => {
    const product = data.products.find(x => x._id === req.params.id);
    if(product){
        res.send(product);
    }else{
        res.status(404).send('Product Not Found');
    }
});

app.get('/api/products', (req, res) => {
    res.send(data.products);
})
*/
app.use('/api/uploads', uploadRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.get('/api/config/paypal', (req,res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});
app.get('/api/config/google', (req, res) => {
    res.send(process.env.GOOGLE_API_KEY || '');
  });
  
const _dirname = path.resolve();
app.use('/uploads', express.static(path.join(_dirname, '/uploads')));

app.get('/', (req, res) =>{
    res.send('Server is ready...');
});

app.use((err, req, res, next) => {
    res.status(500).send({message: err.message});
});
// the right error will be redirect to frontend
const port = process.env.PORT || 5001;
// app.listen(port, () => {
//     console.log(`Server at http://localhost:${port}`);
// });


const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const users = [];

io.on('connection', (socket) => {
  console.log('connection', socket.id);
  socket.on('disconnect', () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log('Offline', user.name);
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit('updateUser', user);
      }
    }
  });
  socket.on('onLogin', (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };
    const existUser = users.find((x) => x._id === updatedUser._id);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    console.log('Online', user.name);
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      io.to(admin.socketId).emit('updateUser', updatedUser);
    }
    if (updatedUser.isAdmin) {
      io.to(updatedUser.socketId).emit('listUsers', users);
    }
  });

  socket.on('onUserSelected', (user) => {
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      const existUser = users.find((x) => x._id === user._id);
      io.to(admin.socketId).emit('selectUser', existUser);
    }
  });

  socket.on('onMessage', (message) => {
    if (message.isAdmin) {
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        io.to(user.socketId).emit('message', message);
        user.messages.push(message);
      }
    } else {
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit('message', message);
        const user = users.find((x) => x._id === message._id && x.online);
        user.messages.push(message);
      } else {
        io.to(socket.id).emit('message', {
          name: 'Admin',
          body: 'Sorry. I am not online right now',
        });
      }
    }
  });
});

httpServer.listen(port, () => {
    console.log(`Server at http://localhost:${port}`);
    });