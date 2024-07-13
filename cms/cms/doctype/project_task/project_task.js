frappe.ui.form.on('Project Task', {
	refresh: function (frm) {
		// Check if the form is new (not saved yet)
		if (!frm.doc.__islocal) {
			return;
		}
		// Set the default start date to current date
		let currentDate = frappe.datetime.get_today();
		frm.set_value('start_date', currentDate);

		// Set the default end date to 3 days after the current date
		let endDate = frappe.datetime.add_days(currentDate, 3);
		frm.set_value('end_date', endDate);
	},
	start_date: function (frm) {
		dates_Validation(frm);
	},
	end_date: function (frm) {
		dates_Validation(frm);
	}
});

function dates_Validation(frm) {
	var start = frm.doc.start_date;
	var end = frm.doc.end_date;

	if (start && end && end < start) {
		frappe.msgprint(__("End Date cannot be earlier than Start Date"));
		frm.set_value('end_date', null);
	}
}

frappe.ui.form.on('Project Task', {
	onload: function (frm) {
		userAssigning(frm);
	}
});

function userAssigning(frm) {
	if (frm.is_new()) {
		frm.set_value('task_generator', frappe.session.user);
		frm.refresh_field('task_generator');
	}
}

frappe.ui.form.on('Project Task', {
	status: function (frm) {
		updateCompletionPercentage(frm);
	}
});

function updateCompletionPercentage(frm) {
	if (frm.doc.status === "Completed") {
		frm.set_value('completion_percentage', 100);
		frm.refresh_field('completion_percentage');
	}
}

frappe.ui.form.on('Project Task', {
	priority: function (frm) {
		priorityAlert(frm);
	}
});

function priorityAlert(frm) {
	if (frm.doc.priority === "High") {
		frappe.msgprint(__("Priority set to High!"));
	}
}

frappe.ui.form.on('Project Task', {
	onload: function (frm) {
		infoButton(frm);
	}
});

function infoButton(frm) {
	frm.add_custom_button(__('Task Info'), function () {
		var taskName = frm.doc.task_name;
		var assigned = frm.doc.assigned_to;

		if (taskName && assigned) {
			frappe.msgprint(__("Task Name: {0}<br>Assigned To: {1}" + taskName + "", [taskName, assigned]));
		} else {
			frappe.msgprint(__("Task information is incomplete."));
		}
	});
}

frappe.ui.form.on('Project Task', {
	refresh: function (frm) {
		cur_frm.set_query("assigned_to", function () {
			return {
				query: "cms.cms.doctype.project_task.project_task.get_system_manager_users"
			};
		});
	},
})

frappe.ui.form.on('Project Task', {
	refresh: function (frm) {
		calculateTaskDuration(frm);
	},
	start_date: function (frm) {
		calculateTaskDuration(frm);
	},
	end_date: function (frm) {
		calculateTaskDuration(frm);
	}
});

function calculateTaskDuration(frm) {
	var start_date = frappe.datetime.str_to_obj(frm.doc.start_date);
	var end_date = frappe.datetime.str_to_obj(frm.doc.end_date);

	if (end_date >= start_date) {
		var duration = frappe.datetime.get_day_diff(end_date, start_date) + 1;
		frm.set_value('task_duration', duration);
	} else {
		frm.set_value('task_duration', 0);
		frappe.msgprint(__('End Date cannot be earlier than Start Date'));
	}
}

frappe.ui.form.on('Project Task', {
	after_save: function (frm) {
		checkPermissions(frm);
	}
});

function checkPermissions(frm) {
	frappe.call({
		method: 'frappe.client.get',
		args: {
			doctype: 'User',
			name: frappe.session.user
		},
		callback: function (r) {
			if (r.message) {
				let roles = r.message.roles.map(role => role.role);
				// frappe.msgprint(__('User Roles: ' + roles.join(', '))); 

				if (roles.includes('Complaint User') && !roles.includes('Complaint Manager')) {
					frm.set_read_only(true);
					frappe.msgprint(__('This form is read-only for users with the "CMS User" role.'));
				} else if (roles.includes('CMS Manager')) {
					frm.set_read_only(false);
					frappe.msgprint(__('This form is editable for users with the "CMS Manager" role.'));
				}
			} else {
				frappe.msgprint(__('Unable to fetch user roles.'));
			}
		}
	});
}
