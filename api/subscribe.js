export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { email, company } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email manquant" });
    }

    const response = await fetch("https://api.systeme.io/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SYSTEME_IO_API_KEY,
      },
      body: JSON.stringify({
        email,
        tags: [1909605], // ID du tag "landing-artisan"
        attributes: {
          company: company, // stocké dans les attributs du contact
        },
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({ error: text });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
