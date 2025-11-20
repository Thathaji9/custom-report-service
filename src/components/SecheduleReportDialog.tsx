import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";

interface ScheduleReportDialogProps {
  open: boolean;
  onClose: () => void;
  dashboardName: string;
  widgets: string[];
  dashboardId: string;
}

const ScheduleReportDialog: React.FC<ScheduleReportDialogProps> = ({
  open,
  onClose,
  dashboardName,
  widgets,
  dashboardId,
}) => {
  const [scheduleType, setScheduleType] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidDates, setIsValidDates] = useState(false);

  useEffect(() => {
    if (!open) {
      setScheduleType("daily");
      setStartDate("");
      setEndDate("");
      setTime("09:00");
      setErrorMsg("");
      setSuccessMsg("");
      setIsValidDates(false);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setErrorMsg("");
      setIsValidDates(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setErrorMsg("End date cannot be before start date.");
      setIsValidDates(false);
    } else {
      setErrorMsg("");
      setIsValidDates(true);
    }
  }, [startDate, endDate]);

  const getCronExpression = (): string => {
    const [hours, minutes] = time.split(":").map(Number);

    switch (scheduleType) {
      case "daily":
        return `${minutes} ${hours} * * *`; // every day at HH:mm
      case "weekly":
        return `${minutes} ${hours} * * 1`; // every Monday at HH:mm
      case "monthly":
        return `${minutes} ${hours} 1 * *`; // 1st of every month at HH:mm
      default:
        return `${minutes} ${hours} * * *`;
    }
  };

  const handleSchedule = async () => {
    if (!isValidDates) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const dashboardUrl = window.location.href;

    try {
      const response = await fetch(
        "http://localhost:5000/api/reports/schedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dashboardName,
            baseUrl: dashboardUrl,
            scheduleType,
            cronExpression: getCronExpression(),
            widgets,
            startDate,
            endDate,
            isActive: true,
            dashboardId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to schedule report");
      }
      setSuccessMsg("Report scheduled successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setErrorMsg("Error scheduling report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isScheduleDisabled = !startDate || !endDate || !isValidDates || loading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Dashboard Report</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginTop: 2,
          }}
        >
          <TextField
            label="Dashboard Name"
            value={dashboardName}
            disabled
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Schedule Frequency</InputLabel>
            <Select
              value={scheduleType}
              label="Schedule Frequency"
              onChange={(e) =>
                setScheduleType(
                  e.target.value as "daily" | "weekly" | "monthly"
                )
              }
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            error={!!errorMsg}
            helperText={errorMsg}
          />

          <TextField
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 300,
            }}
            fullWidth
          />

          {successMsg && <Alert severity="success">{successMsg}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSchedule}
          variant="contained"
          disabled={isScheduleDisabled}
        >
          {loading ? "Scheduling..." : "Schedule Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleReportDialog;
