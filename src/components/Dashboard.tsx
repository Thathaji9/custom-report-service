import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  TextField,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import axios from "axios";
import Sidebar from "./Sidebar";
import ChartWidget from "./Widgets";
import ScheduleReportDialog from "./SecheduleReportDialog";
import { useEmployeeData } from "../hooks/useEmployeeData";
import { useDashboard } from "../hooks/useDashboard";
import { useNavigate, useParams } from "react-router-dom";
import { usePdfExport } from "../hooks/usePdfExport";
const ResponsiveGridLayout = WidthProvider(Responsive);

const availableCharts = [
  { type: "employees-by-department", name: "Employees by Department" },
  { type: "employees-by-location", name: "Employees by Location" },
  { type: "avg-salary-by-department", name: "Avg Salary by Dept" },
  { type: "salary-distribution", name: "Salary Distribution" },
  { type: "department-salary-comparison", name: "Salary Comparison" },
];

const Dashboard: React.FC = () => {
  const {
    dashboardName,
    setDashboardName,
    editMode,
    enableEditMode,
    widgets,
    addWidget,
    removeWidget,
    updateLayout,
    setWidgets,
    saveDashboard,
    deleteDashboard,
    createDashboard,
    dashboardId,
    setEditMode,
    updateDashboard,
  } = useDashboard();

  const { loadEmployeeData } = useEmployeeData();
  const { generateDashboardPDF, isGenerating } = usePdfExport();
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/dashboards/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDashboardName(data.name);
        setWidgets(data?.layout || []);
        updateLayout(data.layout);
      })
      .catch(console.error);
  }, [id]);

  const [savedDashboards, setSavedDashboards] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [loadEmployeeData]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboards")
      .then((res) => setSavedDashboards(res.data))
      .catch(() => setSavedDashboards([]));
  }, [dashboardId]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    updateLayout(newLayout);
  };

  const handleExportPDF = async () => {
    await generateDashboardPDF(dashboardName || "Dashboard");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        savedDashboards={savedDashboards}
        onAddChart={addWidget as any}
        onSelectDashboard={(id) => {
          axios
            .get(`http://localhost:5000/api/dashboards/${id}`)
            .then(({ data }) => {
              setDashboardName(data.name);
              updateLayout(data.layout);
              navigate(`/dashboard/${id}`);
              setEditMode(false);
            });
        }}
        onCreateNewDashboard={() => {
          createDashboard();
          navigate("/dashboard/new");
        }}
        editMode={editMode}
      />

      <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}>
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {editMode ? (
                <TextField
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  placeholder="Enter dashboard name"
                  variant="outlined"
                  size="small"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: 1,
                    minWidth: 300,
                  }}
                />
              ) : (
                <Typography variant="h6" component="h1">
                  {dashboardName || "Untitled Dashboard"}
                </Typography>
              )}
            </Box>

            <Box display="flex" gap={1}>
              {(dashboardId || id) && (
                <>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => setScheduleDialogOpen(true)}
                    disabled={!dashboardName || widgets.length === 0}
                  >
                    Schedule
                  </Button>
                  <ScheduleReportDialog
                    open={scheduleDialogOpen}
                    onClose={() => setScheduleDialogOpen(false)}
                    dashboardName={dashboardName}
                    widgets={widgets.map((w) => w.type)}
                    dashboardId={dashboardId || (id as any)}
                  />
                  <Button
                    data-testid="export-pdf-btn"
                    variant="contained"
                    color="warning"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPDF}
                    disabled={
                      isGenerating || !dashboardName || widgets.length === 0
                    }
                  >
                    Export
                  </Button>
                </>
              )}

              {!editMode && (
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<EditIcon />}
                  onClick={enableEditMode}
                >
                  Edit
                </Button>
              )}

              {!editMode && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={deleteDashboard}
                >
                  Delete
                </Button>
              )}

              {editMode && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  disabled={!dashboardName || widgets.length === 0}
                  onClick={() => {
                    if (dashboardId || id) {
                      updateDashboard(dashboardId || id);
                    } else {
                      saveDashboard();
                    }
                  }}
                >
                  Save
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {editMode && (
          <Paper
            elevation={0}
            sx={{
              padding: 1.5,
              margin: 2,
              backgroundColor: "#fff3cd",
              borderLeft: "4px solid #ffc107",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Edit Mode: Add charts from sidebar, drag to rearrange, resize
              using corners. Enter dashboard name and add widgets to save.
            </Typography>
          </Paper>
        )}

        {widgets.length === 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "calc(100vh - 150px)",
              padding: 4,
            }}
          >
            <Paper
              elevation={3}
              sx={{ padding: 6, textAlign: "center", maxWidth: 500 }}
            >
              <Typography variant="h5" gutterBottom>
                Your dashboard is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Add widgets from sidebar to start building dashboard
              </Typography>
            </Paper>
          </Box>
        )}

        {widgets.length > 0 && (
          <Box sx={{ padding: 2 }}>
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: widgets }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              isDraggable={editMode}
              isResizable={editMode}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
            >
              {widgets.map((widget) => (
                <div
                  key={widget.i}
                  data-grid={widgets.find((l) => l.i === widget.i)}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        backgroundColor: "primary.main",
                        color: "white",
                      }}
                    >
                      <Box
                        className={editMode ? "drag-handle" : ""}
                        sx={{
                          flex: 1,
                          padding: 1,
                          cursor: editMode ? "move" : "default",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="subtitle2" noWrap>
                          {availableCharts.find((c) => c.type === widget.type)
                            ?.name || "Chart"}
                        </Typography>
                      </Box>
                      {editMode && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => removeWidget(widget.i)}
                            sx={{
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.2)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, overflow: "hidden" }}>
                      <ChartWidget type={widget.type} />
                    </Box>
                  </Paper>
                </div>
              ))}
            </ResponsiveGridLayout>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
