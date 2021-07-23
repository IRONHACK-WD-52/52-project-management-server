const router = require("express").Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const TaskModel = require("../models/Task.model");
const ProjectModel = require("../models/Project.model");

// Criar uma nova tarefa
router.post(
  "/task",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      // Cria a tarefa
      const createdTask = await TaskModel.create(req.body);

      // Insere o id da tarefa recém-criada no documento do projeto
      const updatedUser = await ProjectModel.findOneAndUpdate(
        { _id: req.body.projectId },
        { $push: { tasks: createdTask._id } },
        { new: true }
      );

      if (updatedUser) {
        return res.status(201).json(createdTask);
      }

      return res.status(404).json({
        error:
          "Não foi possível gravar a tarefa desse projeto pois o projeto não foi encontrado.",
      });
    } catch (err) {
      next(err);
    }
  }
);

// Ver todas as tarefas
router.get(
  "/task",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const tasks = await TaskModel.find();

      return res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  }
);

// Ver uma tarefa específica
router.get(
  "/task/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const task = await TaskModel.findOne({ _id: id }).populate("projectId");

      if (task) {
        return res.status(200).json(task);
      }

      return res.status(404).json({ error: "Tarefa não encontrada" });
    } catch (err) {
      next(err);
    }
  }
);

// Atualizar uma tarefa específica
router.put(
  "/task/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const updatedTask = await TaskModel.findOneAndUpdate(
        { _id: id },
        { $set: { ...req.body } },
        { new: true, runValidators: true }
      );

      if (updatedTask) {
        return res.status(200).json(updatedTask);
      }

      return res.status(404).json({ error: "Tarefa não encontrada" });
    } catch (err) {
      next(err);
    }
  }
);

// Deletar uma tarefa específica
router.delete(
  "/task/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Buscar a tarefa
      const task = await TaskModel.findOne({ _id: id });

      // Deletar a tarefa do banco
      const deletionResult = await TaskModel.deleteOne({ _id: id });

      if (deletionResult.n > 0) {
        // Remover o id da lista de referências do projeto
        const updatedProject = await ProjectModel.findOneAndUpdate(
          { _id: task.projectId },
          { $pull: { tasks: id } }, // O pull remove o elemento da array dentro do banco
          { new: true }
        );

        if (updatedProject) {
          return res.status(200).json({});
        }

        return res.status(404).json({
          error:
            "Não foi possível remover estar tarefa do projeto pois este projeto não foi encontrado.",
        });
      }

      return res.status(404).json({ error: "Tarefa não encontrada." });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
