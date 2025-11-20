import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { ChartType } from "../hooks/useDashboard";

interface SidebarProps {
  savedDashboards: Array<{ _id: string; name: string }>;
  onAddChart: (type: string) => void;
  onSelectDashboard: (id: string) => void;
  onCreateNewDashboard: () => void;
  editMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  savedDashboards,
  onAddChart,
  onSelectDashboard,
  onCreateNewDashboard,
  editMode,
}) => {
  const drawerWidth = 280;
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(
    null
  );

  const chartOptions: Array<{
    type: ChartType;
    name: string;
    icon: React.ReactElement;
  }> = [
    {
      type: "employees-by-department",
      name: "Employees by Department",
      icon: <BarChartIcon />,
    },
    {
      type: "employees-by-location",
      name: "Employees by Location",
      icon: <PieChartIcon />,
    },
    {
      type: "avg-salary-by-department",
      name: "Avg Salary by Dept",
      icon: <BarChartIcon />,
    },
    {
      type: "salary-distribution",
      name: "Salary Distribution",
      icon: <DonutLargeIcon />,
    },
    {
      type: "department-salary-comparison",
      name: "Salary Comparison",
      icon: <ShowChartIcon />,
    },
  ];

  const handleSelectDashboard = (id: string) => {
    setSelectedDashboard(id);
    onSelectDashboard(id);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#f0f4f8",
          display: "flex",
          flexDirection: "column",
          paddingTop: 2,
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <List disablePadding>
          {/* Create New Dashboard menu item */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                setSelectedDashboard(null);
                onCreateNewDashboard();
              }}
              selected={selectedDashboard === null}
              sx={{
                borderRadius: 2,
                bgcolor: selectedDashboard === null ? "#bbdefb" : "transparent",
                "&:hover": {
                  bgcolor: "#e3f2fd",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#1976d2" }}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText
                primary="Create New Dashboard"
                primaryTypographyProps={{
                  fontWeight: selectedDashboard === null ? 700 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ mb: 2 }} />

          {/* Saved Dashboards menu items */}
          <Typography
            variant="subtitle1"
            color="textSecondary"
            sx={{ px: 2, pb: 1, fontWeight: "bold", color: "#555" }}
          >
            Saved Dashboards
          </Typography>

          {savedDashboards.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, py: 1 }}
            >
              No dashboards saved.
            </Typography>
          )}

          {savedDashboards.map((dash) => (
            <ListItem disablePadding key={dash._id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleSelectDashboard(dash._id)}
                selected={selectedDashboard === dash._id}
                sx={{
                  borderRadius: 2,
                  bgcolor:
                    selectedDashboard === dash._id ? "#bbdefb" : "transparent",
                  "&:hover": {
                    bgcolor: "#e3f2fd",
                  },
                }}
              >
                <ListItemText
                  primary={dash.name}
                  primaryTypographyProps={{
                    fontWeight: selectedDashboard === dash._id ? 700 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* Dashboard Builder widgets menu */}
          {editMode && (
            <>
              <Typography
                variant="subtitle1"
                sx={{ px: 2, pt: 1, color: "#1976d2", fontWeight: "bold" }}
              >
                Dashboard Builder
              </Typography>
              {chartOptions.map((chart) => (
                <ListItem disablePadding key={chart.type} sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => onAddChart(chart.type)}
                    disabled={!editMode}
                    sx={{
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#e3f2fd" },
                      cursor: editMode ? "pointer" : "default",
                    }}
                  >
                    <ListItemIcon>{chart.icon}</ListItemIcon>
                    <ListItemText
                      primary={chart.name}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
