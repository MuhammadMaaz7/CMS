import frappe
from frappe import _
from frappe.utils import flt, cint, getdate, date_diff
from frappe import msgprint

def execute(filters=None):
    if not filters:
        filters = {}
    
    columns = get_columns()
    cs_data = get_cs_data(filters)
    
    if not cs_data:
        msgprint('No records found')
        return columns, []
  
    data = []
    for d in cs_data:
        row = frappe._dict({
            'name' : d.name,
            'task_name': d.task_name,
            'task_description': d.task_description,
            'task_generator': d.task_generator,
            'assigned_to': d.assigned_to,
            'start_date': d.start_date,
            'end_date': d.end_date,
            'task_duration': d.task_duration,
            'status': d.status,
            'priority': d.priority,
            'completion_percentage': d.completion_percentage
        })
        data.append(row)
  
    return columns, data
     
def get_columns():
    return [
        {
            "label": _("Task Number"),
            "fieldname": "name",
            "fieldtype": "Link",
            "options": "Project Task",
            "width": 100
        },
        {
            "label": _("Task Name"),
            "fieldname": "task_name",
            "fieldtype": "Data",
            "width": 100
        },
        {
            "label": _("Task Description"),
            "fieldname": "task_description",
            "fieldtype": "Text",
            "width": 100
        },
        {
            "label": _("Task Generator"),
            "fieldname": "task_generator",
            "fieldtype": "Data",
            "width": 100,
        },
        {
            "label": _("Assigned To"),
            "fieldname": "assigned_to",
            "fieldtype": "Link",
            "options": "User",
            "width": 100
        },
        {
            "label": _("Start Date"),
            "fieldname": "start_date",
            "fieldtype": "Date",
            "width": 100,
        },
        {
            "label": _("End Date"),
            "fieldname": "end_date",
            "fieldtype": "Date",
            "width": 100,
        },
        {
            "label": _("Task Duration"),
            "fieldname": "task_duration",
            "fieldtype": "Data",
            "width": 100,
        },
        {
            "label": _("Status"),
            "fieldname": "status",
            "fieldtype": "Select",
            "options": "\nOpen\nIn Progress\nCompleted\nResolved\nClosed",
            "width": 100
        },
        {
            "label": _("Priority"),
            "fieldname": "priority",
            "fieldtype": "Select",
            "options": "\nLow\nMedium\nHigh",
            "width": 100
        },
        {
            "label": _("Completion Percentage"),
            "fieldname": "completion_percentage",
            "fieldtype": "Percent",
            "width": 100,
        }
    ]

def get_cs_data(filters):
    conditions = get_conditions(filters)
    data = frappe.get_all(
        doctype='Project Task',
        fields=[
            'name','task_name', 'task_description', 'task_generator', 'assigned_to',
            'start_date', 'end_date', 'task_duration', 'status', 'priority', 'completion_percentage'
        ],
        filters=conditions
    )
    return data

def get_conditions(filters):
    conditions = {}
    if filters.get("start_date") and filters.get("end_date"):
        conditions["start_date"] = [">=", filters.get("start_date")]
        conditions["end_date"] = ["<=", filters.get("end_date")]
    else:
        if filters.get("start_date"):
            conditions["start_date"] = [">=", filters.get("start_date")]
        if filters.get("end_date"):
            conditions["end_date"] = ["<=", filters.get("end_date")]

    for key, value in filters.items():
        if key not in ["start_date", "end_date"] and filters.get(key):
            conditions[key] = value

    return conditions