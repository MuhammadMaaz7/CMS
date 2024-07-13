frappe.query_reports["complaint test"] = {
	"filters": [
		{
			"label": "Task Number",
			"fieldname": "name",
			"fieldtype": "Link",
			"options": "Project Task",
			"width": 100
		},
		{
			"label": "Task Name",
			"fieldname": "task_name",
			"fieldtype": "Data",
			"width": 100
		},
		{
			"label": "Assigned To",
			"fieldname": "assigned_to",
			"fieldtype": "Link",
			"options": "User",
			"width": 100
		},
		{
			"label": "Status",
			"fieldname": "status",
			"fieldtype": "Select",
			"options": "\nOpen\nIn Progress\nCompleted\nResolved\nClosed",
			"width": 100
		},
		{
			"label": "Priority",
			"fieldname": "priority",
			"fieldtype": "Select",
			"options": "\nLow\nMedium\nHigh",
			"width": 100
		},
		{
			"label": "From",
			"fieldname": "start_date",
			"fieldtype": "Date",
			"width": 100
		},
		{
			"label": "To",
			"fieldname": "end_date",
			"fieldtype": "Date",
			"width": 100
		}
	]
};
