import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMembersToProject,
  getProjectMembers,
  updateMemberRole,
  deleteMember,
} from "../controllers/project.controllers.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  createProjectValidator,
  addMemberProjectValidator} from "../validators/validator.js";
import { virifyJwt, validateProjectPermission} from "../middleware/auth.middleware.js";
import { AvailableUserRole, userRoleEnum } from "../utils/constants.js";


const router = Router();
router.use(virifyJwt)

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getProjectById)
  .put(
    validateProjectPermission([userRoleEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(
    validateProjectPermission([userRoleEnum.ADMIN]),
    deleteProject
  );

router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(
    validateProjectPermission([userRoleEnum.ADMIN]),
    addMemberProjectValidator(),
    validate,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(
    validateProjectPermission([userRoleEnum.ADMIN]),
    updateMemberRole
  )
  .delete(
    validateProjectPermission([userRoleEnum.ADMIN]),
    deleteMember
  );





export default router;