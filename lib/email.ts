export async function sendEmail({
    to,
    subject,
    htmlbody,
}: {
    to: string;
    subject: string;
    htmlbody: string;
}) {
    const zeptoMailToken = process.env.ZEPTOMAIL_TOKEN?.trim();
    const fromEmail = (process.env.ZEPTOMAIL_FROM_EMAIL || "noreply@obvateinvestmentcompany.pro").trim();
    const fromName = (process.env.ZEPTOMAIL_FROM_NAME || "Obvate Investment Company").trim();

    if (!zeptoMailToken) {
        console.error("ZEPTOMAIL_TOKEN is missing from environment variables.");
        return { success: false, error: "Email service is currently unconfigured." };
    }

    const payload = {
        from: { address: fromEmail, name: fromName },
        to: [{ email_address: { address: to } }],
        subject,
        htmlbody,
    };

    const response = await fetch("https://api.zeptomail.com/v1.1/email", {
        method: "POST",
        headers: {
            Authorization: `Zoho-enczapikey ${zeptoMailToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("ZeptoMail API Error:", response.status, errorText);
        return { success: false, error: "Failed to send email." };
    }

    return { success: true };
}
