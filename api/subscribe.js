export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { email, company } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email manquant" });
    }

    // 1️⃣ Création du contact avec le champ personnalisé "company"
    const createContact = await fetch("https://api.systeme.io/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SYSTEME_IO_API_KEY,
      },
      body: JSON.stringify({
        email,
        custom_fields: {
          company: company, // "company" = clé unique du champ personnalisé
        },
      }),
    });

    const created = await createContact.json();

    if (!createContact.ok) {
      return res.status(500).json({ error: created });
    }

    const contactId = created.id;

    // 2️⃣ Ajout du tag
    await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SYSTEME_IO_API_KEY,
      },
      body: JSON.stringify({
        tag_id: 1909605, // ID du tag "landing-artisan"
      }),
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
