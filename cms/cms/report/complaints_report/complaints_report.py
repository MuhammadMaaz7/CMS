import frappe
from frappe import _
from frappe.utils import flt, cint, getdate, date_diff
from frappe import msgprint

def execute(filters=None):
    if not filters:
        filters = {}
    
    columns = get_columns()
    complaints_data = get_complaints_data(filters)
    
    if not complaints_data:
        msgprint('No records found')
        return columns, []
  
    data = []
    for d in complaints_data:
        row = frappe._dict({
            'name': d.name,
            'subject': d.subject,
            'description': d.description,
            'raised_by': d.raised_by,
            'name1': d.name1,
            # 'email': d.email,
            'department': d.department,
            'complain_to': d.complain_to, 
            'type': d.type, #added
            'priority': d.priority,
            'status': d.status,
            'start_date': d.start_date,
            'expected_end_date': d.expected_end_date,
            'resolution_date': d.resolution_date,
            'resolution': d.resolution,
            'response_by': d.response_by,
            'response_time': d.response_time
        })
        data.append(row)
  
    return columns, data
     
def get_columns():
    return [
        {
            "label": _("Complaint Number"),
            "fieldname": "name",
            "fieldtype": "Link",
            "options": "Complaint",
            "width": 100
        },
        {
            "label": _("Subject"),
            "fieldname": "subject",
            "fieldtype": "Data",
            "width": 100
        },
        {
            "label": _("Description"),
            "fieldname": "description",
            "fieldtype": "Text",
            "width": 200,
        },
        {
            "label": _("Raised By"),
            "fieldname": "raised_by",
            "fieldtype": "Link",
            "options": "Employee",
            "width": 100
        },
        {
            "label": _("Name"),
            "fieldname": "name1",
            "fieldtype": "Data",
            "width": 100
        },
        # {
        #     "label": _("Email"),
        #     "fieldname": "email",
        #     "fieldtype": "Data",
        #     "width": 150,
        # },
        {
            "label": _("Department"),
            "fieldname": "department",
            "fieldtype": "Link",
            "options": "Department",
            "width": 100
        },
        {
            "label": _("Complain To"),
            "fieldname": "complain_to",
            "fieldtype": "Link",
            "options": "Complaint Submitting",
            "width": 100
        },
        {
            "label": _("Complain Type"),
            "fieldname": "type",
            "fieldtype": "Link",
            "options": "Complaint Type",
            "width": 100
        },
        {
            "label": _("Priority"),
            "fieldname": "priority",
            "fieldtype": "Link",
            "options": "Complaint Priority",
            "width": 100
        },
        {
            "label": _("Status"),
            "fieldname": "status",
            "fieldtype": "Link",
            "options": "Complaint Status",
            "width": 100
        },
        {
            "label": _("Complaint Date"),
            "fieldname": "start_date",
            "fieldtype": "Date",
            "width": 100,
        },
        {
            "label": _("Expected End Date"),
            "fieldname": "expected_end_date",
            "fieldtype": "Date",
            "width": 100,
        },
        {
            "label": _("Resolution Date"),
            "fieldname": "resolution_date",
            "fieldtype": "Date",
            "width": 100,
        },
        {
            "label": _("Resolution"),
            "fieldname": "resolution",
            "fieldtype": "Text",
            "width": 100,
        },
        {
            "label": _("Response By"),
            "fieldname": "response_by",
            "fieldtype": "Link",
            "options": "Employee",
            "width": 100
        },
        {
            "label": _("Response Time"),
            "fieldname": "response_time",
            "fieldtype": "Datetime",
            "width": 150
        }
    ]

def get_complaints_data(filters):
    conditions = get_conditions(filters)
    data = frappe.get_all(
        doctype='Complaint',
        fields=[
            'name', 'subject', 'raised_by','name1' # ,'email'
            , 'department', 'priority', 'status', 'description','complain_to','type',
            'start_date', 'expected_end_date', 'resolution_date', 'resolution','response_by', 'response_time'
        ],
        filters=conditions
    )
    return data

def get_conditions(filters):
    conditions = {}
    if filters.get("start_date") and filters.get("resolution_date"):
        conditions["start_date"] = [">=", filters.get("start_date")]
        conditions["resolution_date"] = ["<=", filters.get("resolution_date")]
    else:
        if filters.get("start_date"):
            conditions["start_date"] = [">=", filters.get("start_date")]
        if filters.get("resolution_date"):
            conditions["resolution_date"] = ["<=", filters.get("resolution_date")]

    for key, value in filters.items():
        if key not in ["start_date", "resolution_date"] and filters.get(key):
            conditions[key] = value

    return conditions
