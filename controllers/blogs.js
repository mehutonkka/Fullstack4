const blogsRouter = require('express').Router()
const { urlencoded } = require('express')
const Blog = require('../models/blog')
const User = require('../models/user') 

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    const user = await User.findOne({})

    if (!user) {
      return response.status(400).json({ error: 'no users in DB' })
    }

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes ?? 0,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const id  = request.params.id
    const body = request.body

    const updates = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updates,
      { returnDocument: 'after' }
      )
      response.status(200).json(updatedBlog)
  } catch (error) {
    next(error)
  }
})


module.exports = blogsRouter