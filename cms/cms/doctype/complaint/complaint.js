// Function for assigning session user and employee code
function userAssigning(frm) {
	if (frappe.session.user != "Administrator") {
		if (frm.is_new()) {
			frappe.call({
				method: 'frappe.client.get_value',
				args: {
					'doctype': 'Employee',
					'fieldname': ['name'],
					'filters': { 'user_id': frappe.session.user }
				},
				callback: function (r) {
					if (r.message) {
						let employeeCode = r.message.name;
						frm.set_value('raised_by', employeeCode);
						frm.refresh_field('raised_by');
					} else {
						frappe.msgprint('Employee code not found for the logged-in user.');
					}
				}
			});
		}
	}
}

// Function to set initial priority to low
function initialPriority(frm) {
	if (frm.is_new()) {
		frm.set_value('priority', "Low");
		frm.refresh_field('priority');
		frm.set_value('resolution_time',0);
		frm.refresh_field('resolution_time');
	}
}

// Function to fetch employee details and set them in the form fields
function fetchAndSetEmployeeDetails(frm) {
	if (frm.doc.raised_by) {
		frappe.call({
			method: 'frappe.client.get_value',
			args: {
				'doctype': 'Employee',
				'fieldname': ['employee_name', 'personal_email', 'department'],
				'filters': { 'name': frm.doc.raised_by }
			},
			callback: function (r) {
				if (r.message) {
					let employeeName = r.message.employee_name;
					let personalEmail = r.message.personal_email;
					let department = r.message.department;

					if (employeeName) {
						frm.set_value('name1', employeeName);
					} else {
						frappe.msgprint(__('Employee name not found.'));
						frm.set_value('name1', null);
					}

					if (personalEmail) {
						frm.set_value('email', personalEmail);
					} else {
						frappe.msgprint(__('Personal email not found.'));
						frm.set_value('email', null);
					}

					if (department) {
						frm.set_value('department', department);
					} else {
						frappe.msgprint(__('Department not found.'));
						frm.set_value('department', null);
					}

					frm.refresh_field('name1');
					frm.refresh_field('email');
					frm.refresh_field('department');
				} else {
					frappe.msgprint(__('No employee details found for the given raised_by value.'));
				}
			}
		});
	}
}


frappe.ui.form.on('Complaint', {
	onload: function (frm) {
		userAssigning(frm);
		initialPriority(frm);
	},
	raised_by: function (frm) {
		fetchAndSetEmployeeDetails(frm);
	}
});



//function for validating start and end dates
function dates_Validation(frm) {
	var start = frm.doc.start_date;
	var end = frm.doc.expected_end_date;

	if (start && end && end <= start) {
		frappe.msgprint(__("End Date cannot be earlier than Start Date"));
		frm.set_value('expected_end_date', null);
	}
}

//function to set expected end date based on priority
function setEndDateBasedOnPriority(frm) {
	let priority = frm.doc.priority;
	let startDate = frm.doc.start_date;

	if (startDate && priority) {
		let daysToAdd = 3; 

		if (priority === 'High') {
			daysToAdd = 1;
		} else if (priority === 'Medium') {
			daysToAdd = 2;
		}

		let endDate = frappe.datetime.add_days(startDate, daysToAdd);
		frm.set_value('expected_end_date', endDate);
	}
}

frappe.ui.form.on('Complaint', {
	refresh: function (frm) {
		if (!frm.doc.__islocal) {
			return;
		}
		let currentDate = frappe.datetime.get_today();
		frm.set_value('start_date', currentDate);

		let endDate = frappe.datetime.add_days(currentDate, 3);
		frm.set_value('expected_end_date', endDate);
	},
	start_date: function (frm) {
		dates_Validation(frm);
	},
	expected_end_date: function (frm) {
		dates_Validation(frm);
	},
	priority: function (frm) {
		setEndDateBasedOnPriority(frm);
	}
});

frappe.ui.form.on('Complaint', {
	update_status: function (frm) {
		frm.set_value('status', frm.doc.update_status);
	},
	onload: function (frm) {
		frm.set_value('status', frm.doc.update_status);
	}
});

//for different roles
frappe.ui.form.on('Complaint', {
	onload: function (frm) {
		if (frappe.session.user != "Administrator") {
			if (frappe.user.has_role('Complaint User')) {
				if (frm.is_new()) {
					frm.set_df_property('raised_by', 'read_only', 1);
					frm.set_df_property('start_date', 'read_only', 1);
					frm.set_df_property('resolution_details_section', 'hidden', 1);
					frm.set_df_property('resolution', 'hidden', 1);
					frm.set_df_property('column_break_foooc', 'hidden', 1);
					frm.set_df_property('resolution_date', 'hidden', 1);
					frm.set_df_property('update_status', 'hidden', 1);
					frm.set_df_property('resolution_time', 'hidden', 1);
					frm.set_df_property('response_details_section', 'hidden', 1);
					frm.set_df_property('response_by', 'hidden', 1);
					frm.set_df_property('column_break_ib1tx', 'hidden', 1);
					frm.set_df_property('response_time', 'hidden', 1);
				} else {
					frm.fields.forEach(function (field) {
						frm.set_df_property(field.df.fieldname, 'hidden', 0);
						frm.set_df_property(field.df.fieldname, 'read_only', 1);
					});
					frm.set_df_property('resolution_time', 'hidden', 1);
					frm.set_df_property('update_status', 'hidden', 1);
					frm.set_df_property('resolution_details_section', 'hidden', 0);
					frm.set_df_property('resolution', 'hidden', 0);
					frm.set_df_property('column_break_foooc', 'hidden', 0);
					frm.set_df_property('resolution_date', 'hidden', 0);
					frm.set_df_property('response_details_section', 'hidden', 0);
					frm.set_df_property('response_by', 'hidden', 0);
					frm.set_df_property('column_break_ib1tx', 'hidden', 0);
					frm.set_df_property('response_time', 'hidden', 0);
				}
			}
			else if (frappe.user.has_role('CMS Admin') || frappe.user.has_role('CMS IT')) {
				frm.set_df_property('subject', 'read_only', 1);
				frm.set_df_property('raised_by', 'read_only', 1);
				frm.set_df_property('name1', 'read_only', 1);
				frm.set_df_property('email', 'read_only', 1);
				frm.set_df_property('department', 'read_only', 1);
				frm.set_df_property('type', 'read_only', 1);
				frm.set_df_property('priority', 'read_only', 1);
				frm.set_df_property('status', 'read_only', 1);
				frm.set_df_property('complain_to', 'read_only', 1);
				frm.set_df_property('start_date', 'read_only', 1);
                frm.set_df_property('expected_end_date', 'read_only', 1);
				frm.set_df_property('attachment', 'read_only', 1);
				frm.set_df_property('description', 'read_only', 1);
				frm.set_df_property('resolution_date', 'read_only', 1);
				frm.set_df_property('resolution_time', 'read_only', 1);
				frm.set_df_property('response_time', 'read_only', 1);
				frm.set_df_property('response_by', 'read_only', 1);	
			}
		}
	},
	refresh: function (frm) {
		frm.trigger('onload');
	},
	after_save: function (frm) {
		frm.trigger('onload');
	}
});


frappe.ui.form.on('Complaint', {
	resolution: function (frm) {
        if (frappe.session.user != "Administrator") {
            if (frappe.user.has_role('CMS Admin') || frappe.user.has_role('CMS IT')) {

                frm.set_value('response_time', frappe.datetime.now_datetime());

                frappe.call({
                    method: 'frappe.client.get_value',
                    args: {
                        'doctype': 'Employee',
                        'fieldname': ['employee_name'],
                        'filters': { 'user_id': frappe.session.user }
                    },
                    callback: function (r) {
                        if (r.message) {
                            let employeeName = r.message.employee_name;
                            frm.set_value('response_by', employeeName);
                            frm.refresh_field('response_by');
                        } else {
                            frappe.msgprint('Employee name not found for the logged-in user.');
                        }
                    }
                });
            }
        }
    },
    update_status: function (frm) {
        frm.trigger('resolution');
    }
});

frappe.ui.form.on('Complaint', {
	status: function (frm) {
		if (frm.doc.status === 'Closed' || frm.doc.status === 'Resolved') {
			frm.set_value('resolution_date', frappe.datetime.nowdate());
		} else {
			frm.set_value('resolution_date', null);
		}
	}
});

frappe.ui.form.on('Complaint', {
	resolution_date: function (frm) {
		var start_date = frappe.datetime.str_to_obj(frm.doc.start_date);
		var end_date = frappe.datetime.str_to_obj(frm.doc.resolution_date);

		var duration = frappe.datetime.get_day_diff(end_date, start_date) + 1;
		frm.set_value('resolution_time', duration);
	}
});

// // Function for assigning session user and employee code
// function userAssigning(frm) {
//     if (frappe.session.user != "Administrator") {
//         if (frm.is_new()) {
//             frappe.call({
//                 method: 'frappe.client.get_value',
//                 args: {
//                     'doctype': 'Employee',
//                     'fieldname': ['name'],
//                     'filters': { 'user_id': frappe.session.user }
//                 },
//                 callback: function (r) {
//                     if (r.message) {
//                         let employeeCode = r.message.name;
//                         frm.set_value('raised_by', employeeCode);
//                         frm.refresh_field('raised_by');
//                     } else {
//                         frappe.msgprint('Employee code not found for the logged-in user.');
//                     }
//                 }
//             });
//         }
//     }
// }

// // Function to set initial priority to low
// function initialPriority(frm) {
//     if (frm.is_new()) {
//         frm.set_value('priority', "Low");
//         frm.refresh_field('priority');
//         frm.set_value('resolution_time', 0);
//         frm.refresh_field('resolution_time');
//     }
// }

// // Function to fetch employee details and set them in the form fields
// function fetchAndSetEmployeeDetails(frm) {
//     if (frm.doc.raised_by) {
//         frappe.call({
//             method: 'frappe.client.get_value',
//             args: {
//                 'doctype': 'Employee',
//                 'fieldname': ['employee_name', 'personal_email', 'department'],
//                 'filters': { 'name': frm.doc.raised_by }
//             },
//             callback: function (r) {
//                 if (r.message) {
//                     let employeeName = r.message.employee_name;
//                     let personalEmail = r.message.personal_email;
//                     let department = r.message.department;

//                     if (employeeName) {
//                         frm.set_value('name1', employeeName);
//                     } else {
//                         frappe.msgprint(__('Employee name not found.'));
//                         frm.set_value('name1', null);
//                     }

//                     if (personalEmail) {
//                         frm.set_value('email', personalEmail);
//                     } else {
//                         frappe.msgprint(__('Personal email not found.'));
//                         frm.set_value('email', null);
//                     }

//                     if (department) {
//                         frm.set_value('department', department);
//                     } else {
//                         frappe.msgprint(__('Department not found.'));
//                         frm.set_value('department', null);
//                     }

//                     frm.refresh_field('name1');
//                     frm.refresh_field('email');
//                     frm.refresh_field('department');
//                 } else {
//                     frappe.msgprint(__('No employee details found for the given raised_by value.'));
//                 }
//             }
//         });
//     }
// }

// // Function for validating start and end dates
// function dates_Validation(frm) {
//     var start = frm.doc.start_date;
//     var end = frm.doc.expected_end_date;

//     if (start && end && end <= start) {
//         frappe.msgprint(__("End Date cannot be earlier than Start Date"));
//         frm.set_value('expected_end_date', null);
//     }
// }

// // Function to set expected end date based on priority
// function setEndDateBasedOnPriority(frm) {
//     let priority = frm.doc.priority;
//     let startDate = frm.doc.start_date;

//     if (startDate && priority) {
//         let daysToAdd = 3;

//         if (priority === 'High') {
//             daysToAdd = 1;
//         } else if (priority === 'Medium') {
//             daysToAdd = 2;
//         }

//         let endDate = frappe.datetime.add_days(startDate, daysToAdd);
//         frm.set_value('expected_end_date', endDate);
//     }
// }

// // Main form events
// frappe.ui.form.on('Complaint', {
//     onload: function (frm) {
//         userAssigning(frm);
//         initialPriority(frm);
//         if (frm.is_new()) {
//             let currentDate = frappe.datetime.get_today();
//             frm.set_value('start_date', currentDate);

//             let endDate = frappe.datetime.add_days(currentDate, 3);
//             frm.set_value('expected_end_date', endDate);
//         }

//         // Set the response_by field for non-Administrator users with specific roles
//         if (frappe.session.user != "Administrator") {
//             if (frappe.user.has_role('CMS Admin') || frappe.user.has_role('CMS IT')) {
//                 frappe.call({
//                     method: 'frappe.client.get_value',
//                     args: {
//                         'doctype': 'Employee',
//                         'fieldname': ['employee_name'],
//                         'filters': { 'user_id': frappe.session.user }
//                     },
//                     callback: function (r) {
//                         if (r.message) {
//                             let employeeName = r.message.employee_name;
//                             frm.set_value('response_by', employeeName);
//                             frm.refresh_field('response_by');
//                         } else {
//                             frappe.msgprint('Employee name not found for the logged-in user.');
//                         }
//                     }
//                 });
//             }
//         }
//     },
//     refresh: function (frm) {
//         frm.trigger('onload');
//     },
//     raised_by: function (frm) {
//         fetchAndSetEmployeeDetails(frm);
//     },
//     start_date: function (frm) {
//         dates_Validation(frm);
//     },
//     expected_end_date: function (frm) {
//         dates_Validation(frm);
//     },
//     priority: function (frm) {
//         setEndDateBasedOnPriority(frm);
//     },
//     status: function (frm) {
//         if (frm.doc.status === 'Closed' || frm.doc.status === 'Resolved') {
//             frm.set_value('resolution_date', frappe.datetime.nowdate());
//         } else {
//             frm.set_value('resolution_date', null);
//         }
//     },
//     resolution_date: function (frm) {
//         var start_date = frappe.datetime.str_to_obj(frm.doc.start_date);
//         var end_date = frappe.datetime.str_to_obj(frm.doc.resolution_date);

//         var duration = frappe.datetime.get_day_diff(end_date, start_date) + 1;
//         frm.set_value('resolution_time', duration);
//     },
//     after_save: function (frm) {
//         frm.trigger('onload');
//     },
//     update_status: function (frm) {
//         frm.set_value('status', frm.doc.update_status);
//     }
// });
