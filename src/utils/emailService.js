import emailjs from 'emailjs-com'

// Initialize EmailJS
emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID)

export const sendIssueNotificationToDept = async (departmentEmail, issueData) => {
  try {
    const templateParams = {
      to_email: departmentEmail,
      issue_title: issueData.title,
      issue_description: issueData.description,
      issue_location: issueData.location,
      issue_reporter: issueData.reporter_name,
      issue_date: new Date(issueData.created_at).toLocaleDateString(),
      department_name: issueData.department
    }

    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_DEPT_TEMPLATE_ID,
      templateParams
    )
    
    return { success: true }
  } catch (error) {
    console.error('Error sending email to department:', error)
    return { success: false, error: error.message }
  }
}

export const sendResolutionNotificationToUser = async (userEmail, issueData) => {
  try {
    const templateParams = {
      to_email: userEmail,
      issue_title: issueData.title,
      issue_description: issueData.description,
      issue_location: issueData.location,
      resolution_date: new Date().toLocaleDateString(),
      department_name: issueData.department
    }

    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_RESOLUTION_TEMPLATE_ID,
      templateParams
    )
    
    return { success: true }
  } catch (error) {
    console.error('Error sending resolution email to user:', error)
    return { success: false, error: error.message }
  }
} 