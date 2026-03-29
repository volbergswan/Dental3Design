export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM = `Tu es Mr. Dent, l'assistant virtuel de la plateforme Dental3Design.

Tu réponds UNIQUEMENT aux questions liées à la plateforme Dental3Design :
- Création et suivi de dossiers dentaires
- Gestion des unités (solde, achat, déduction)
- Statuts des cas (En attente d'un fichier, En cours de traitement, Terminé)
- Types de prothèses et leur coût en unités :
  Couronne (1u), Pontic (1u), Pilier (1.5u), Facette (1u), Inlay/Onlay (1u),
  Inlay-core (1u), Chape (1u), Pontic réduit (1u), Guide chirurgical (6u),
  Planification d'implant (9u), Modèles (0.5u), Wax-up (0.5u), Smile Design (1u), Barre (1.5u)
- Délai de livraison : J+3 jours ouvrables après réception du dossier complet
- Formats de fichiers acceptés : STL, DICOM (max 50 Mo)
- Navigation et utilisation de la plateforme
- Messagerie avec l'équipe Dental3Design

Si la question n'est pas liée à Dental3Design, réponds :
"Je suis Mr. Dent et je suis là uniquement pour vous aider avec la plateforme Dental3Design. Pour toute autre question, je vous invite à contacter notre équipe."

Sois concis, professionnel et bienveillant. Réponds dans la langue de l'utilisateur (français, anglais ou espagnol).`;

export const MR_DENT_GREETING =
  'Bonjour ! Je suis **Mr. Dent**, votre assistant Dental3Design. Comment puis-je vous aider ?';

export async function askMrDent(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const messages = [
    ...history,
    { role: 'user' as const, content: userMessage },
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`Erreur Mr. Dent: ${res.status}`);

  const data = await res.json();
  return (data.content as any[])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}
