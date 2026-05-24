import { Router } from "express";
import { getPlans, Register } from "../controller/RegisterController.js";

const router = Router()

router.post('/register' , Register)
router.post('/add-plan' , getPlans)
export default router