export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { email, company } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email manquant" });
    }

    // 0️⃣ Vérifier si le contact existe déjà
    const check = await fetch(`https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`, {
      headers: {
        "X-API-Key": process.env.SYSTEME_IO_API_KEY,
      },
    });

    const existing = await check.json();

    if (existing && existing.data && existing.data.length > 0) {
      return res.status(200).json({
        already: true,
        message: "Vous êtes déjà inscrit.",
      });
    }

    // 1️⃣ Création du contact
    const createContact = await fetch("https://api.systeme.io/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SYSTEME_IO_API_KEY,
      },
      body: JSON.stringify({ email }),
    });

    const created = await createContact.json();

    if (!createContact.ok) {
      return res.status(500).json({ error: created.message || "Erreur lors de la création du contact" });
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
        tag_id: 1909605,
      }),
    });

    // 3️⃣ Mise à jour du champ personnalisé "company"
    await fetch(`https://api.systeme.io/api/contacts/${contactId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SYSTEME_IO_API_KEY,
      },
      body: JSON.stringify({
        custom_fields: {
          company: company,
        },
      }),
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
