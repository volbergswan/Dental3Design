// supabase/functions/mr-dent/index.ts
// Déployer avec: supabase functions deploy mr-dent

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Tu es Mr. Dent, l'assistant virtuel de la plateforme Dental3Design. 
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Erreur API Anthropic');
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? 'Je suis désolé, je n\'ai pas pu générer une réponse.';

    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
