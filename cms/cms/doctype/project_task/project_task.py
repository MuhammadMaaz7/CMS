# Copyright (c) 2024, Maaz and contributors
# For license information, please see license.txt

import random
import frappe
from frappe.model.document import Document
from frappe.utils.pdf import get_pdf
from frappe.utils import add_days, today, getdate

class ProjectTask(Document):
	pass

@frappe.whitelist()
def get_system_manager_users(doctype, txt, searchfield, start, page_len, filters):
	return frappe.db.sql("""
		select u.name, concat(u.first_name, ' ', u.last_name)
		from tabUser u, `tabHas Role` r
		where u.name = r.parent and r.role = 'Projects Manager' 
		and u.enabled = 1 and u.name like %s
	""", ("%" + txt + "%"))
 
def task1(doc, method):
    if not doc.task_description:
        doc.task_description = "Default Task Description"
        

def task2(doc, method):
    max_length = 50
    if doc.task_name and len(doc.task_name) > max_length:
        frappe.throw(f"Task Name cannot exceed {max_length} characters.")
        
def task3(doc, method):
    if doc.status in ["Open", "In Progress"]:
        frappe.throw(f"Cannot delete a document with status {doc.status}.")

def task4(doc, method):
    if doc.assigned_to:
        assigned_user_email = doc.assigned_to
        subject = "New Task Assigned"
        message = f"Hello,\n\nYou have been assigned a new task:\n\n{doc.task_description}\n\nPlease review and proceed accordingly.\n\nBest Regards,\nThe Admin Team"
        frappe.sendmail(recipients=[assigned_user_email], subject=subject, message=message)
        frappe.msgprint(f"Task assigning mail sent to {assigned_user_email}.")

def task5(doc, method):
    if doc.status == "Completed" and doc.assigned_to and doc.get_db_value("status") != "Completed":
        assigned_user_email = doc.assigned_to
        subject = "Task Completed"
        message = f"Hello,\n\nThe Task is Completed.\n\nPlease review and confirm.\n\nBest Regards,\nThe Admin Team"
        frappe.sendmail(recipients=[assigned_user_email], subject=subject, message=message)
        frappe.msgprint(f"Task completion mail sent to {assigned_user_email}.")


def task6(doc, method):
    if doc.status == "In Progress" and doc.get_db_value("status") != "In Progress" and not doc.assigned_to:
        users = frappe.get_all("User", filters={"enabled": 1}, fields=["name"])    
        if users:
            random_user = random.choice(users)["name"]
            doc.assigned_to = random_user
            frappe.msgprint(f"Task auto-assigned to {random_user} as the status is set to 'In Progress'.")
        else:
            frappe.throw("No active users found to assign the task.")

# def task8():
#     frappe.msgprint(f"Task 8 triggered.")
#     frappe.logger().info("Task 8 triggered.")
    
#     threshold_date = add_days(today(), -30)
    
#     old_tasks = frappe.get_all("Project Task", filters={
#         "status": "Open",
#         "start_date": ["<=", threshold_date]
#     }, fields=["name", "assigned_to", "start_date"])

#     frappe.logger().info(f"Old tasks found: {len(old_tasks)}")

#     for task in old_tasks:
#         doc = frappe.get_doc("Project Task", task["name"])
#         doc.status = "Closed"
#         doc.save()

#         if doc.assigned_to:
#             assigned_user_email = doc.assigned_to
#             subject = "Task Closed Due to Inactivity"
#             message = f"Hello,\n\nThe task with ID {doc.name} has been closed due to inactivity for more than 30 days.\n\nBest Regards,\nThe Admin Team"
            
#             frappe.sendmail(
#                 recipients=[assigned_user_email],
#                 subject=subject,
#                 message=message
#             )
#             frappe.msgprint(f"Task {doc.name} closed and notification sent to {assigned_user_email}.")
#             frappe.logger().info(f"Task {doc.name} closed and notification sent to {assigned_user_email}.")
