import { useState, useCallback } from "react";
import axios from "axios";
import { Layout } from "react-grid-layout";
import { useNavigate, useParams } from "react-router-dom";

export type ChartType =
  | "employees-by-department"
  | "employees-by-location"
  | "avg-salary-by-department"
  | "salary-distribution"
  | "department-salary-comparison";

export interface WidgetItem extends Layout {
  type: ChartType;
}

export const useDashboard = () => {
  const [dashboardName, setDashboardName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [widgets, setWidgets] = useState<WidgetItem[]>([]);
  const [dashboardCreated, setDashboardCreated] = useState(false);
  const [dashboardId, setDashboardId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const saveDashboard = useCallback(() => {
    if (!dashboardName || widgets.length === 0) {
      alert("Please enter dashboard name and add widgets");
      return;
    }
    axios
      .post("http://localhost:5000/api/dashboards", {
        name: dashboardName,
        layout: widgets,
        widgets: widgets.map((w) => w.type),
      })
      .then(({ data }) => {
        setDashboardCreated(true);
        setDashboardId(data._id);
        setIsSaved(true);
        setEditMode(false);
        navigate(`/dashboard/${data._id}`);
      })
      .catch(() => alert("Failed to save dashboard"));
  }, [dashboardName, widgets]);

  const updateDashboard = useCallback(
    (existingId: any) => {
      if (!dashboardName || widgets.length === 0) {
        alert("Please enter dashboard name and add widgets");
        return;
      }
      axios
        .put(`http://localhost:5000/api/dashboards/${existingId}`, {
          name: dashboardName,
          layout: widgets,
          widgets: widgets.map((w) => w.type),
        })
        .then(({ data }) => {
          setDashboardCreated(true);
          setDashboardId(data._id);
          setIsSaved(true);
          setEditMode(false);
          navigate(`/dashboard/${data._id}`);
        })
        .catch(() => alert("Failed to save dashboard"));
    },
    [dashboardName, widgets]
  );

  const createDashboard = useCallback(() => {
    setDashboardName("");
    setWidgets([]);
    setDashboardId(null);
    setDashboardCreated(true);
    setIsSaved(false);
    setEditMode(true);
    navigate("/dashboard/new");
  }, []);

  const deleteDashboard = useCallback(() => {
    if (!(id || dashboardId)) {
      alert("No dashboard selected to delete");
      return;
    }
    if (window.confirm("Are you sure to delete this dashboard?")) {
      axios
        .delete(`http://localhost:5000/api/dashboards/${id}`)
        .then(() => {
          alert("Deleted");
          createDashboard();
        })
        .catch(() => alert("Delete failed"));
    }
  }, [id, createDashboard]);

  const enableEditMode = useCallback(() => {
    setEditMode(true);
    setIsSaved(false);
  }, []);

  const findNextPosition = useCallback((currentWidgets: WidgetItem[]) => {
    const cols = 12;
    const widgetWidth = 6;
    const widgetHeight = 3;

    if (currentWidgets.length === 0) {
      return { x: 0, y: 0 };
    }

    let maxY = 0;
    const occupied: { [key: string]: boolean } = {};

    currentWidgets.forEach((widget) => {
      const endY = widget.y + widget.h;
      if (endY > maxY) {
        maxY = endY;
      }

      for (let row = widget.y; row < widget.y + widget.h; row++) {
        for (let col = widget.x; col < widget.x + widget.w; col++) {
          occupied[`${row}-${col}`] = true;
        }
      }
    });

    for (let row = 0; row <= maxY; row++) {
      for (let col = 0; col <= cols - widgetWidth; col += widgetWidth) {
        let available = true;
        for (let r = row; r < row + widgetHeight; r++) {
          for (let c = col; c < col + widgetWidth; c++) {
            if (occupied[`${r}-${c}`]) {
              available = false;
              break;
            }
          }
          if (!available) break;
        }

        if (available) {
          return { x: col, y: row };
        }
      }
    }

    return { x: 0, y: maxY };
  }, []);

  const addWidget = useCallback(
    (type: ChartType) => {
      const position = findNextPosition(widgets);

      const newWidget: WidgetItem = {
        i: `${type}-${Date.now()}`,
        x: position.x,
        y: position.y,
        w: 6,
        h: 3,
        type,
      };

      setWidgets((prev) => [...prev, newWidget]);
      setIsSaved(false);
    },
    [widgets, findNextPosition]
  );

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.i !== id));
    setIsSaved(false);
  }, []);

  const updateLayout = useCallback((newLayout: Layout[]) => {
    setWidgets((prev) =>
      prev.map((widget) => {
        const updated = newLayout.find((l) => l.i === widget.i);
        return updated ? { ...widget, ...updated } : widget;
      })
    );
    setIsSaved(false);
  }, []);

  const canSave = dashboardName.trim() !== "" && widgets.length > 0;

  return {
    dashboardName,
    setDashboardName,
    editMode,
    enableEditMode,
    widgets,
    addWidget,
    removeWidget,
    setWidgets,
    updateLayout,
    saveDashboard,
    deleteDashboard,
    dashboardCreated,
    createDashboard,
    isSaved,
    canSave,
    dashboardId,
    setEditMode,
    updateDashboard,
  };
};
