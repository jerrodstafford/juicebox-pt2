const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');


tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;
    try {
      const posts = await getPostsByTagName(tagName)
      if(posts) {
        res.send(posts)
      } else {
        next({
          name: "NoTagsForPostsError",
					message: "No posts foun matching tags"
        })
      }
    } catch ({ name, message }) {
      next ({ name, message })
    }
  });

tagsRouter.use ((req, res, next) => {
    console.log("A request is being made to /tags");

    next();
});

tagsRouter.use('/', async(req, res) => {
    const tags = await getAllTags();

    res.send({
        tags
    });
});

module.exports = tagsRouter;