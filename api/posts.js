const express = require('express');
const postsRouter = express.Router();
const { requireUser } = require('./utils');
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');


postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
			if (post.active || req.user && post.author.id === req.user.id) {
				return true;
			} else if(!post.active && req.user && post.author.id !== req.user.id) {
				return false;
			} return false;
    });

    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.post('/', requireUser, async(req, res, next) => {
		const user = req.user;
    const { title, content, tags = "" } = req.body;

		try {
		const tagArr = tags.trim().split(/\s+/)
		const postData = {
			authorId: user.id,
			title,
			content,
		};
			
		if(tagArr.length) {
			postData.tags = tagArr;
		};
		const post = await createPost(postData);

    if(post) {
    	res.send(post);
    } else {
      next({
        name: "NoPostError",
        message: "Post not found"
      });
    }
    } catch ({ name, message }) {
      next({ name, message });
    }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});

postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");

    next();
});

postsRouter.use('/', async(req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});

module.exports = postsRouter;