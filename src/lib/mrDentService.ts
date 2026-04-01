// ─── MR. DENT — Chatbot IA Dental3Design ──────────────────────
// Répond UNIQUEMENT aux questions liées à la plateforme Dental3Design

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Clé Anthropic à passer via import.meta.env dans Vite
// Ajouter dans .env: VITE_ANTHROPIC_API_KEY=sk-ant-...
const ANTHROPIC_KEY = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '';

const MR_DENT_SYSTEM_PROMPT = `Tu es Mr. Dent, l'assistant virtuel de la plateforme Dental3Design. 
Tu es un expert de la plateforme Dental3Design et tu aides les clients (laboratoires et cabinets dentaires) à utiliser la plateforme.

RÈGLES ABSOLUES:
1. Tu réponds UNIQUEMENT aux questions concernant Dental3Design et son utilisation
2. Si une question ne concerne pas Dental3Design, tu réponds poliment: "Je suis Mr. Dent, l'assistant de Dental3Design. Je ne peux vous aider qu'avec des questions concernant notre plateforme."
3. Tu es toujours professionnel, bienveillant et concis
4. Tu réponds dans la langue de l'utilisateur (français par défaut)

CE QUE TU SAIS SUR DENTAL3DESIGN:
- C'est une plateforme de conception numérique dentaire (FAO)
- Les clients soumettent des dossiers de conception (couronnes, bridges, implants, facettes, etc.)
- Le système fonctionne par "unités" : chaque type de prothèse coûte un certain nombre d'unités
- Les unités s'achètent via Stripe (packs de 1, 10, 50 ou 100 unités)
- Les fichiers STL/DICOM sont uploadés par les clients
- L'admin (Dental3Design) traite les conceptions et renvoie les fichiers
- Les délais sont de J+3 jours ouvrables
- La messagerie permet de communiquer avec l'équipe Dental3Design

TARIFS PAR TYPE:
- Couronne, Pontique, Facette, Inlay/Onlay, Chape, Pontique réduit: 1 unité
- Pilier: 1.5 unités
- Modèles, Wax-up: 0.5 unités
- Smile Design, Barre: 1 unité (barre: par implant)
- Planification d'implant: 9 unités
- Guide chirurgical: 6 unités

PROCESS:
1. Créer un dossier → sélectionner dents sur le schéma dentaire → choisir le type de prothèse
2. Uploader les fichiers STL/DICOM
3. Ajouter les instructions
4. Soumettre → les unités seront déduites à la livraison
5. L'admin traite le cas (statut: En attente → En cours → Terminé)
6. Le client télécharge les fichiers de conception finaux`;

export interface MrDentMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── ENVOYER UN MESSAGE À MR. DENT ───────────────────────────
export async function askMrDent(
  messages: MrDentMessage[],
  userMessage: string
): Promise<string> {
  const allMessages: MrDentMessage[] = [
    ...messages,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: MR_DENT_SYSTEM_PROMPT,
        messages: allMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Erreur API Anthropic');
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Je suis désolé, je n\'ai pas pu générer une réponse.';
  } catch (error: any) {
    console.error('Mr. Dent error:', error);
    throw new Error('Mr. Dent est temporairement indisponible. Veuillez réessayer.');
  }
}

// ─── SAUVEGARDER L'HISTORIQUE CHAT ───────────────────────────
export function saveChatHistory(userId: string, messages: MrDentMessage[]): void {
  try {
    localStorage.setItem(
      `mr_dent_history_${userId}`,
      JSON.stringify(messages.slice(-20)) // Garder les 20 derniers messages
    );
  } catch {}
}

export function loadChatHistory(userId: string): MrDentMessage[] {
  try {
    const raw = localStorage.getItem(`mr_dent_history_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
