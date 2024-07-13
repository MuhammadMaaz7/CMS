import frappe
from frappe.model.document import Document
import frappe
from frappe import _

class Complaint(Document):
    pass

def send_complaint_email(doc, method):
    if doc.email:
        subject = "Complaint Filed"
        message = f"Dear {doc.name1},\n\nYour complaint has been filed successfully.\n\nThank you."

        try:
            frappe.sendmail(
                recipients=[doc.email],
                subject=subject,
                message=message
            )
            # frappe.msgprint(f"Complaint filed mail sent to {doc.email}.")
        except Exception as e:
            frappe.msgprint(f"")
    else:
        frappe.msgprint("")
