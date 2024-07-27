import { EmailTemplate } from '#/app/components/EmailTemplate';
import { sendEmail } from '#/app/lib/actions';

export async function POST() {
  const email = "setemi@mailinator.com"
  const name = "Setemi"
  const subject = "Welcome to the club"

  try {
    await sendEmail(subject, email, name);
    return Response.json({
      status: 200,
      body: {
        message: "Email sent successfully"
      }
    })
  } catch (error) {
    console.error("Error sending email", error);
    return Response.json({
      status: 500,
      body: {
        message: "Failed to send email."
      }
    })
  }
}
