import express from "express";
import Dashboard from "../models/Dashboard";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, layout, widgets } = req.body;
    const dashboard = new Dashboard({ name, layout, widgets });
    await dashboard.save();
    res.status(201).json(dashboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to create dashboard" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id);
    if (!dashboard)
      return res.status(404).json({ error: "Dashboard not found" });
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

router.get("/", async (req, res) => {
  try {
    const dashboards = await Dashboard.find();
    res.json(dashboards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboards" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Dashboard.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Dashboard not found" });
    res.json({ message: "Dashboard deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete dashboard" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, layout, widgets } = req.body;
    const updated = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { name, layout, widgets },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Dashboard not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update dashboard" });
  }
});

export default router;
