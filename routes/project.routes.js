const router = require("express").Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");

const ProjectModel = require("../models/Project.model");
const TaskModel = require("../models/Task.model");

// Criar um novo projeto
router.post(
  "/project",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const result = await ProjectModel.create({
        ...req.body,
        userId: req.currentUser._id,
      });

      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// Listar todos os projetos
router.get(
  "/project",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const projects = await ProjectModel.find();

      return res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  }
);

// Listar um projeto específico
router.get(
  "/project/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      // Extrair o id do projeto dos parâmetros de rota
      const { id } = req.params;

      // O populate popula o campo especificado com o objeto completo do modelo referenciado
      const project = await ProjectModel.findOne({ _id: id })
        .populate("tasks")
        .populate("userId");

      if (project) {
        return res.status(200).json(project);
      }

      return res.status(404).json({ error: "Projeto não encontrado" });
    } catch (err) {
      next(err);
    }
  }
);

// Atualizar um projeto específico
router.put(
  "/project/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const updatedProject = await ProjectModel.findOneAndUpdate(
        { _id: id },
        { $set: { ...req.body } },
        { new: true }
      );

      // Se o resultado for diferente de null (pois essa função retorna null quando não encontra um documento)
      if (updatedProject) {
        return res.status(200).json(updatedProject);
      }

      return res.status(404).json({ error: "Projeto não encontrado." });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/project/:id",
  isAuthenticated,
  attachCurrentUser,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Apagando o projeto
      const deletionResult = await ProjectModel.deleteOne({ _id: id });

      // Apagar todas as tarefas referentes à esse projeto
      await TaskModel.deleteMany({ projectId: id });

      if (deletionResult.n > 0) {
        return res.status(200).json({});
      }

      return res.status(404).json({ error: "Projeto não encontrado." });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
