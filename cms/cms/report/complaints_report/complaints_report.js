frappe.query_reports["Complaints Report"] = {
	"filters": [
		{
			"label": "Complaint Number",
			"fieldname": "name",
			"fieldtype": "Link",
			"options": "Complaint",
			"width": 100
		},
		{
			"label": "Raised By",
			"fieldname": "raised_by",
			"fieldtype": "Link",
			"options": "Employee",
			"width": 100
		},
		{
			"label": "Department",
			"fieldname": "department",
			"fieldtype": "Link",
			"options": "Department",
			"width": 100
		},
		{
			"label": "Status",
			"fieldname": "status",
			"fieldtype": "Link",
			"options": "Complaint Status",
			"width": 100
		},
		{
			"label": "Priority",
			"fieldname": "priority",
			"fieldtype": "Link",
			"options": "Complaint Priority",
			"width": 100
		},
		{
			"label": "From Date",
			"fieldname": "start_date",
			"fieldtype": "Date",
			"width": 100
		},
		{
			"label": "To Date",
			"fieldname": "resolution_date",
			"fieldtype": "Date",
			"width": 100
		}
	]
};
