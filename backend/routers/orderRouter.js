import express from 'express'
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
// import { isAdmin, isAuth, isSellerOrAdmin } from '../utils.js';
import {
    isAdmin,
    isAuth,
    isSellerOrAdmin,
    mailgun,
    payOrderEmailTemplate,
  } from '../utils.js';

const orderRouter = express.Router();

orderRouter.get(
    '/summary',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
      const orders = await Order.aggregate([
        {
          $group: {
            //   _id still null
            _id: null,
            // numOrders incrememt by one every order
            numOrders: { $sum: 1 },
            // tatolSales add $totalPrice for every order
            totalSales: { $sum: '$totalPrice' },
          },
        },
      ]);
      const users = await User.aggregate([
        {
          $group: {
            _id: null,
            numUsers: { $sum: 1 },
          },
        },
      ]);
      const dailyOrders = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            sales: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      const productCategories = await Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);
      res.send({ users, orders, dailyOrders, productCategories });
    })
  );

orderRouter.get('/mine', isAuth, expressAsyncHandler(async(req, res) => {
    const orders = await Order.find({user : req.user._id});
    res.send(orders)
})
);

orderRouter.post(
    '/',
    // isAuth is a middleware by calling next in it req.user will be filled by user information
    isAuth,
    expressAsyncHandler(async(req, res) => {
        if(req.body.orderItems.length === 0){
            res.status(400).send({message: 'Cart is empty' });
        }else{
            const order = new Order({
                seller: req.body.orderItems[0].seller,
                orderItems: req.body.orderItems,
                shippingAddress: req.body.shippingAddress,
                itemsPrice: req.body.itemsPrice,
                paymentMethod: req.body.paymentMethod,
                shippingPrice: req.body.shippingPrice,
                taxPrice: req.body.taxPrice,
                totalPrice: req.body.totalPrice,
                // this information of user is coming from isAuth 
                user: req.user._id,
            });
            // save the order
            const createdOrder = await order.save();
            // order to the frontend
            res.status(201).send({message: 'New Order Created', order: createdOrder})
        }
    })
);

orderRouter.get('/:id',isAuth, expressAsyncHandler(async(req,res) => {
    const order = await Order.findById(req.params.id);
    if(order){
        res.send(order);
    }else{
        res.status(404).send({message : 'Order not found'});
    }
}));

orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(async (req, res) =>{
    // const order = await Order.findById(req.params.id);
    const order = await Order.findById(req.params.id).populate(
        'user',
        'email name'
      );
    if(order){
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {id: req.body.id, status: req.body.status, update_time: req.body.update_time, email_address: req.body.email_address};
        const updatedOrder = await order.save();
        try{
          mailgun()
        .messages()
        .send(
          {
            from: 'Amazona <amazona@mg.yourdomain.com>',
            to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );
        }catch(err){
          console.log(err)
        }
        
        res.send({message: 'Order Paid', order: updatedOrder});
    }else{
        res.status(404).send({message: 'Order not found'});
    }
}))

orderRouter.get('/',isAuth, 
// isAdmin
isSellerOrAdmin
, expressAsyncHandler(async (req,res)=> {
    // populate bring the name of the user (user is id) since it is not exist in the Order.find({})
    // const orders = await Order.find({}).populate('user', 'name');
    // req.query get the result after ? in url
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};

    const orders = await Order.find({ ...sellerFilter }).populate(
      'user',
      'name'
    );
    res.send(orders);
})
);

orderRouter.delete('/:id', isAuth, isAdmin,
 expressAsyncHandler(async(req,res) => {
     const order = await Order.findById(req.params.id);
     if(order){
         deleteOrder = await order.remove();
         res.send({message: 'Order Deleted ', order: deleteOrder});
     }else{
        res.status(404).send({ message: 'Order Not Found' })
     }
 }))

 orderRouter.put(
     '/:id/deliver',
     isAuth,
     isAdmin,
     expressAsyncHandler(async(req,res)=> {
         const order = await Order.findById(req.params.id);
         if(order){
             order.isDelivered = true;
             order.deliveredAt = Date.now();
         
         const updatedOrder = order.save();
         res.send({message: 'Order Delivered', order: updatedOrder});
     }else{
         res.status(404).send({message: 'Order Not Found'});
     }
     })
 )

export default orderRouter;