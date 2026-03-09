export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { email, company } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email manquant" });
    }

    // 1️⃣ Création du contact (ta version qui fonctionne)
    const createContact = await fetch("https://api.systeme.io/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SYSTEME_IO_API_KEY,
      },
      body: JSON.stringify({
        email,
        tags: [1909605], // ton tag fonctionne déjà
      }),
    });

    const created = await createContact.json();

    if (!createContact.ok) {
      return res.status(500).json({
        error: created.message || "Erreur lors de la création du contact",
      });
    }

    const contactId = created.id;

    // 2️⃣ Ajout d’une tâche visible dans la fiche contact
    if (company && company.trim() !== "") {
      await fetch(`https://api.systeme.io/api/contacts/${contactId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.SYSTEME_IO_API_KEY,
        },
        body: JSON.stringify({
          title: `Entreprise : ${company}`,
          description: "",
          status: "completed",
        }),
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
