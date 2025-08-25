// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

export const EMAILJS_CONFIG = {
  // Get these from your EmailJS dashboard at https://www.emailjs.com/
  SERVICE_ID: 'service_z9p4pct',     // e.g., 'service_xyz123'
  TEMPLATE_ID: 'template_6vyp9tu',   // e.g., 'template_abc456'
  PUBLIC_KEY: 'IlYxYRXiDrBBbATYi',     // e.g., 'user_def789'
  
  // Your email where messages will be sent
  TO_EMAIL: 'asithamk62778544@gmail.com'
};

/* 
Setup Instructions for EmailJS Template:

In your EmailJS template, configure it as follows:

TO EMAIL: asithamk62778544@gmail.com (your email - where you receive messages)
FROM EMAIL: {{reply_to}} (this will be the user's email so you can reply directly)
REPLY TO: {{reply_to}} (this ensures replies go back to the user)

SUBJECT: InfantFuel Contact: {{subject}}

EMAIL CONTENT:
---
Hello Asitha,

You have received a new message through the InfantFuel contact form:

From: {{from_name}}
Email: {{reply_to}}
Subject: Contact Form Message

Message:
{{message}}

---
You can reply directly to this email to respond to {{from_name}}.

Best regards,
InfantFuel Contact System
---

IMPORTANT: In your EmailJS template settings, make sure to:
1. Set TO field to: asithamk62778544@gmail.com
2. Set FROM field to: {{reply_to}}
3. Set REPLY-TO field to: {{reply_to}}

This way:
- You receive the email at your Gmail
- The email appears to come from the user
- When you hit reply, it goes directly to the user's email
*/
