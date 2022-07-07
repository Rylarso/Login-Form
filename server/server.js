const express = require("express");
const { User, Thread } = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();

// tel your server to understand how to handle json
app.use(express.json());

// allow serving of UI code
app.use(express.static(`${__dirname}/../public/`));

setUpSession(app);
setUpAuth(app);
// 9
app.post("/users", async (req, res) => {
  try {
    let user = await User.create({
      username: req.body.username,
      fullname: req.body.fullname,
      password: req.body.password,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({
      message: `post request failed to create user`,
      error: err,
    });
    return;
  }
});

app.get("/thread/:id", async (req, res) => {
    let thread;

    try{
        thread = await Thread.findById(req.params.id);
        if (!thread) {
            res.status(404).json({
                message:"thread not found"
            });
            return;
        }
    }catch (err){
        res.status(500).json({
            message:`get request failed to get thread`,
            error: err
        });
        return;
    }

    try{
        thread = thread.toObject();
        let user = await User.findById(thread.user_id);
        thread.user = user;
    } catch(err){
        console.log(
            `unable to get user ${thread.user_id} when getting thread ${thread._id}`
        );
    }
    res.status(200).json(thread);
});

app.get("/threads", async (req, res) => {
    let threads;
    try {
        threads = await Thread.find({}, "-posts")
    } catch (err) {
        res.status(500).json({
            message: "list request failed to get threads",
            error: err,
        });
    }
    for (let k in threads) {
        try{
            threads[k] = threads[k].toObject();
            let user = await User.findById(threads[k].user_id);
            threads[k].user = user;
        } catch(err){
            console.log(
                `unable to get user ${threads[k].user_id} when getting thread ${threads[k]._id}`
            );
        }
    }
    res.status(200).json(threads);
});

app.post("/thread", async (req, res) => {
  // auth
  if (!req.user) {
    res.status(401).json({ message: "unauthed" });
    return;
  }
  // create with await + try/catch
  try {
    let thread = await Thread.create({
      user_id: req.user.id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
    });
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({
      message: "could not create thread",
      error: err,
    });
    return;
  }
});

app.delete("/thread/:id", async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: "unauthed" });
        return;
      }
     let thread;

     try {
        thread = await Thread.findById(req.params.id);
     } catch (err) {
        res.status(500).json({
            message:"failed to delete thread",
            error: err
        });
        return;
     }

     if (thread === null) {
        res.status(404).json({
            message:"thread not found",
            thread_id:req.params.thread_id
        });
     }

        if (req.user.id != thread.user_id){
            console.log("error cannot delete other peoples threads");
            return;
        }
     
     try {
        await Thread.findByIdAndDelete(req.params.id);
     }
     catch (err){
        res.status(500).json({
            message: "failed to delete post",
            error: err
        });
        return;
     }
     res.status(200).json(thread);
});

app.post("/post",  async (req, res) => {
    //get auth
    if (!req.user) {
        res.status(401).json({ message: "unauthed" });
        return;
      }
      
    let thread;

    try{
        thread = await Thread.findByIdAndUpdate(
            //what is the id
            req.body.thread_id,
            //what to update
            {
                $push: {
                    posts: {
                    user_id: req.user.id,
                    body: req.body.body,
                    thread_id: req.body.thread_id
                    },
                    
                }
            },
            {
                new: true,
            }
            //options
        );
        if (!thread) {
            res.status(404).json({
                message:"thread not found",
                id: req.body.thread_id,
            });
            return;
        }
    } catch (err) {
        res.status(500).json({
            message: "failed to insert post",
            error: err,
        });
        return;
        }
        res.status(201).json(thread.posts[thread.posts.length - 1])
});

app.delete("/thread/:thread_id/post/:post_id", async (req, res) => {
    // check auth
    if (!req.user) {
      res.status(401).json({ message: "unauthed" });
      return;
    }
  
    let thread;
    let post;
  
    // pull thread
    try {
      thread = await Thread.findOne({
        _id: req.params.thread_id,
        "posts._id": req.params.post_id,
      });
    } catch (err) {
      res.status(500).json({
        message: `error finding thread when deleting post`,
        error: err,
      });
      return;
    }
  
    if (!thread) {
      res.status(404).json({
        message: `thread not found when deleting post`,
        thread_id: req.params.thread_id,
        post_id: req.params.post_id,
      });
      return;
    }
    // check that the post on the thread is "owned" by the requesting user (authorization)
    // for loop over thread.posts to find the post you're looking for so you can check the user_id
    let isSameUser = false;
    for (let k in thread.posts) {
      // find post
      if (thread.posts[k]._id == req.params.post_id) {
        post = thread.posts[k];
        if (thread.posts[k].user_id == req.user.id) {
          isSameUser = true;
        }
      }
      // check user id
    }
  
    if (!isSameUser) {
      res.status(403).json({ mesage: "unauthorized" });
      return;
    }
  
    // delete the post
    try {
      await Thread.findByIdAndUpdate(req.params.thread_id, {
        $pull: {
          posts: {
            _id: req.params.post_id,
          },
        },
      });
    } catch (err) {
      res.status(500).json({
        message: `error deleting post`,
        error: err,
      });
      return;
    }
  
    // return the deleted post
    res.status(200).json(post);
  });
  
//update thread
app.put("thread/:id", async (req, res) => {
    // check auth
    if (!req.user) {
        res.status(401).json({ message: "unauthed" });
        return;
      }

});

module.exports = app;