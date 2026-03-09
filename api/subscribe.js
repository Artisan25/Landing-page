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
    const check = await fetch(
      `https://api.systeme.io/api/contacts?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "X-API-Key": process.env.SYSTEME_IO_API_KEY,
        },
      }
    );

    const existing = await check.json();

    if (existing?.data?.length > 0) {
      return res.status(200).json({
        already: true,
        message: "Vous êtes déjà inscrit.",
      });
    }

    // 1️⃣ Création du contact (SANS custom_fields)
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
      return res.status(500).json({
        error: created.message || "Erreur lors de la création du contact",
      });
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
    const update = await fetch(
      `https://api.systeme.io/api/contacts/${contactId}`,
      {
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
      }
    );

    const updated = await update.json();

    if (!update.ok) {
      return res.status(500).json({
        error: updated.message || "Erreur lors de la mise à jour du contact",
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
