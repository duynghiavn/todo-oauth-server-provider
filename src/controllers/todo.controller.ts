import { NextFunction, Request, Response } from "express"
import Todo from "../models/todo.model"
import User from "../models/user.model"

export default {
  showTodo: async (req: Request, res: Response) => {
    const currentUser = req.user

    const todos = await Todo.query()
      .withGraphJoined("user")
      .where("user.id", currentUser.id)
    res.json(todos)
  },

  createTodo: async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = req.user
    const { content } = req.body
    try {
      const user = await User.query().findById(currentUser.id)
      if (!user) throw new Error("Not found User")

      const newTodo = await Todo.query().insert({
        content,
        user_id: currentUser.id,
      })

      res.json(newTodo)
    } catch (err) {
      next(err)
    }
  },

  deleteTodo: async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = req.user
    const { id } = req.params
    try {
      const todo = await Todo.query().findById(id)
      if (todo.user_id !== currentUser.id)
        throw new Error("You can not delete this todo")

      const deletedTodo = await todo.$query().delete()

      res.json(deletedTodo)
    } catch (err) {
      next(err)
    }
  },
}
