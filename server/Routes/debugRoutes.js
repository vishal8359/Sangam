// routes/debugRoutes.js
import express from "express";
import Product from "../Models/Product.js";

const router = express.Router();

router.get("/fix-products-seller", async (req, res) => {
  const products = await Product.find({ seller: { $exists: false } });

  for (const p of products) {
    if (p.createdBy) {
      p.seller = p.createdBy;
      await p.save();
    }
  }

  res.send(`✅ Updated ${products.length} products`);
});

export default router;
