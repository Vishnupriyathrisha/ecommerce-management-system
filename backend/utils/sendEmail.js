const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "E-Commerce Store <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);
      return false;
    }

    console.log(`Email sent successfully to ${to}`);
    console.log("Resend Email ID:", data?.id);

    return true;
  } catch (error) {
    console.error("Email sending error:", error.message);
    return false;
  }
};

module.exports = sendEmail;