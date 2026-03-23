import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'es';

interface Translations {
  dashboard: string;
  createNewCase: string;
  unitsAvailable: string;
  buyMoreUnits: string;
  selectTeeth: string;
  clearSelection: string;
  selectProsthesisType: string;
  forTooth: string;
  forTeeth: string;
  selectTeethFirst: string;
  uploadStl: string;
  caseInstructions: string;
  patientNameLabel: string;
  patientNamePlaceholder: string;
  submitCase: string;
  upperJaw: string;
  lowerJaw: string;
  toothSelectionHint: string;
  crown: string;
  pontic: string;
  pilier: string;
  veneer: string;
  inlay: string;
  post_core: string;
  coping: string;
  reduced_pontic: string;
  implant_planning: string;
  surgical: string;
  modeles: string;
  wax_up: string;
  smile_design: string;
  barre: string;
  dragDropHint: string;
  supportedFormat: string;
  maxFileSize: string;
  caseSummary: string;
  teeth: string;
  items: string;
  item: string;
  noProsthesisSelected: string;
  noTeethSelectedYet: string;
  totalCost: string;
  unitsDeductionHint: string;
  validationError: string;
  ponticRuleError: string;
  footerCopyright: string;
  placeholderInstructions: string;
  caseSubmitted: string;
  helpTitle: string;
  helpDescription: string;
  sendMessage: string;
  messagePlaceholder: string;
  messageSent: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  insufficientUnitsTitle: string;
  insufficientUnitsMessage: string;
  ok: string;
  caseSentTitle: string;
  caseSentMessage: string;
  backToDashboard: string;
  caseDetailsTitle: string;
  caseNumber: string;
  date: string;
  type: string;
  downloadFiles: string;
  deleteCase: string;
  deleteCaseConfirm: string;
  helpWithCase: string;
  noCasesFound: string;
  manageAccount: string;
  logout: string;
  perTooth: string;
  perPilier: string;
  perImplant: string;
  statusInProgress: string;
  statusCompleted: string;
  statusPending: string;
  caseInProgressTitle: string;
  casePendingTitle: string;
  caseInProgressMessage: string;
  casePendingMessage: string;
  close: string;
  statInProgress: string;
  statCompleted: string;
  statPending: string;
  statTotal: string;
  myCasesTitle: string;
  welcomeMessage: string;
  quickActionsTitle: string;
  pricingLabel: string;
  libraryLabel: string;
  all: string;
  tableHeaderId: string;
  tableHeaderPatient: string;
  tableHeaderDate: string;
  tableHeaderStatus: string;
  buyUnitsTitle: string;
  unitPrice: string;
  totalPrice: string;
  cartTitle: string;
  emptyCart: string;
  checkout: string;
  orderSummary: string;
  landingTitle: string;
  landingDescription: string;
  getStarted: string;
  login: string;
  contactUs: string;
  email: string;
  cancel: string;
  confirm: string;
  buyNow: string;
  error3DTitle: string;
  error3DMessage: string;
  loading3D: string;
  no3DFile: string;
  viewDetails: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    dashboard: "Tableau de bord",
    createNewCase: "Créer un nouveau cas",
    unitsAvailable: "Units disponibles",
    buyMoreUnits: "Acheter plus d'units",
    selectTeeth: "1. Sélectionner les dents",
    clearSelection: "Effacer la sélection",
    selectProsthesisType: "2. Sélectionner le type de prothèse",
    forTooth: "pour la dent",
    forTeeth: "pour {count} dents",
    selectTeethFirst: "Sélectionnez d'abord les dents",
    uploadStl: "3. Déposer les fichiers",
    caseInstructions: "4. Instructions du cas",
    patientNameLabel: "Nom du patient",
    patientNamePlaceholder: "Ex: M. Jean Dupont",
    submitCase: "Soumettre le cas",
    upperJaw: "Maxillaire",
    lowerJaw: "Mandibule",
    toothSelectionHint: "Cliquez sur une dent pour la sélectionner. Utilisez Shift + Clic pour sélectionner plusieurs dents.",
    crown: "Couronne",
    pontic: "Pontique",
    pilier: "Pilier",
    veneer: "Facette",
    inlay: "Inlay/Onlay",
    post_core: "Inlay-core",
    coping: "Chape",
    reduced_pontic: "Pontique réduit",
    implant_planning: "Planification d'implant",
    surgical: "Guide chirurgical",
    modeles: "Modèles",
    wax_up: "Wax-up",
    smile_design: "Smile Design",
    barre: "Barre (simple/homothétique/toronto)",
    dragDropHint: "Glissez-déposez les fichiers ici, ou cliquez pour parcourir",
    supportedFormat: "Formats supportés : STL, DICOM",
    maxFileSize: "Taille max : 50Mo",
    caseSummary: "Résumé du cas",
    teeth: "Dents",
    items: "Éléments",
    item: "Élément",
    noProsthesisSelected: "Aucune prothèse sélectionnée",
    noTeethSelectedYet: "Aucune dent sélectionnée pour le moment",
    totalCost: "Coût total",
    unitsDeductionHint: "Les units seront déduites lors de la livraison du design.",
    validationError: "Erreur de validation",
    ponticRuleError: "Les pontiques doivent être adjacents à une couronne, un pilier, une chape ou un inlay/onlay.",
    footerCopyright: "© 2026 Dental3Design. Tous droits réservés.",
    placeholderInstructions: "Veuillez fournir les détails pour la conception (ex: Couronne sur 26, Chape sur 11, Teinte A2, Ajuster l'occlusion).",
    caseSubmitted: "Cas soumis avec succès !",
    helpTitle: "Besoin d'aide ?",
    helpDescription: "Décrivez votre problème et nous vous répondrons dès que possible.",
    sendMessage: "Envoyer le message",
    messagePlaceholder: "Écrivez votre message ici...",
    messageSent: "Votre message a bien été envoyé et sera traité dans les plus brefs délais.",
    subjectLabel: "Objet de la demande",
    subjectPlaceholder: "",
    insufficientUnitsTitle: "Units insuffisantes",
    insufficientUnitsMessage: "Vous n'avez pas assez d'units pour soumettre ce cas. Veuillez en acheter davantage.",
    ok: "OK",
    caseSentTitle: "Cas envoyé !",
    caseSentMessage: "Votre cas a bien été envoyé et est en cours de traitement par nos designers.",
    backToDashboard: "Retour au tableau de bord",
    caseDetailsTitle: "Détails du cas",
    caseNumber: "Numéro du cas",
    date: "Date",
    type: "Type",
    downloadFiles: "Télécharger les fichiers",
    deleteCase: "Supprimer le cas",
    deleteCaseConfirm: "Êtes-vous sûr de vouloir supprimer ce cas ?",
    helpWithCase: "Aide pour le cas",
    noCasesFound: "Aucun cas ne correspond à votre recherche.",
    manageAccount: "Gérer mon compte",
    logout: "Déconnexion",
    perTooth: "par dent",
    perPilier: "par pilier",
    perImplant: "par implant",
    statusInProgress: "En cours",
    statusCompleted: "Terminé",
    statusPending: "En attente",
    caseInProgressTitle: "Conception en cours",
    casePendingTitle: "En attente de traitement",
    caseInProgressMessage: "Nos designers travaillent actuellement sur votre cas. Vous recevrez une notification dès qu'il sera prêt.",
    casePendingMessage: "Votre cas a bien été reçu et sera bientôt pris en charge par l'un de nos designers.",
    close: "Fermer",
    statInProgress: "Cas en cours",
    statCompleted: "Terminés (30j)",
    statPending: "En attente",
    statTotal: "Total Designs",
    myCasesTitle: "Mes cas",
    welcomeMessage: "Bienvenue sur votre espace Dental3Design.",
    quickActionsTitle: "Actions rapides",
    pricingLabel: "Tarifs",
    libraryLabel: "Bibliothèque",
    all: "Tous",
    tableHeaderId: "ID Cas",
    tableHeaderPatient: "Patient",
    tableHeaderDate: "Date",
    tableHeaderStatus: "Statut",
    buyUnitsTitle: "Acheter des Units",
    unitPrice: "soit {price}€ / unit",
    totalPrice: "Total : {price}€",
    cartTitle: "Mon Panier",
    emptyCart: "Votre panier est vide",
    checkout: "Procéder au paiement",
    orderSummary: "Résumé de la commande",
    landingTitle: "Conception Numérique Dentaire",
    landingDescription: "Votre cabinet est équipé en FAO ? Ou votre laboratoire manque de temps ?\n\nDental3Design s'occupe de vos conceptions numériques ! Inscrivez-vous et déposez vos fichiers depuis votre scanner intra-oral ou depuis notre plateforme claire, simple et intuitive.\n\nVotre cas sera prêt à être traité dans des délais et coûts maîtrisés pour l'optimisation et la rentabilité de votre cabinet ou laboratoire, tout en vous proposant un service de qualité.\n\nVotre temps est précieux. Avec Dental3Design, concentrez-vous sur l'essentiel : vos patients et la production.",
    getStarted: "Commencez ici",
    login: "Connexion",
    contactUs: "Contactez-nous",
    email: "Email",
    cancel: "Annuler",
    confirm: "Confirmer",
    buyNow: "Commander",
    error3DTitle: "Erreur de chargement 3D",
    error3DMessage: "Le fichier STL n'a pas pu être chargé ou est corrompu.",
    loading3D: "Chargement...",
    no3DFile: "Aucun fichier 3D disponible",
    viewDetails: "Voir les détails"
  },
  en: {
    dashboard: "Dashboard",
    createNewCase: "Create New Case",
    unitsAvailable: "Units Available",
    buyMoreUnits: "Buy More Units",
    selectTeeth: "1. Select Teeth",
    clearSelection: "Clear Selection",
    selectProsthesisType: "2. Select Prosthesis Type",
    forTooth: "for Tooth",
    forTeeth: "for {count} Teeth",
    selectTeethFirst: "Select teeth first",
    uploadStl: "3. Drop Files",
    caseInstructions: "4. Case Instructions",
    patientNameLabel: "Patient Name",
    patientNamePlaceholder: "e.g. Mr. John Doe",
    submitCase: "Submit Case",
    upperJaw: "Upper Jaw",
    lowerJaw: "Lower Jaw",
    toothSelectionHint: "Click a tooth to select it. Use Shift + Click to select multiple teeth for group operations.",
    crown: "Crown",
    pontic: "Pontic",
    pilier: "Abutment",
    veneer: "Veneer",
    inlay: "Inlay/Onlay",
    post_core: "Post and Core",
    coping: "Coping",
    reduced_pontic: "Reduced Pontic",
    implant_planning: "Implant Planning",
    surgical: "Surgical Guide",
    modeles: "Models",
    wax_up: "Wax-up",
    smile_design: "Smile Design",
    barre: "Bar (simple/homothetic/toronto)",
    dragDropHint: "Drag and drop files here, or click to browse",
    supportedFormat: "Supported formats: STL, DICOM",
    maxFileSize: "Max file size: 50MB",
    caseSummary: "Case Summary",
    teeth: "Teeth",
    items: "Items",
    item: "Item",
    noProsthesisSelected: "No prosthesis selected",
    noTeethSelectedYet: "No teeth selected yet",
    totalCost: "Total Cost",
    unitsDeductionHint: "Units will be deducted upon successful design delivery.",
    validationError: "Validation Error",
    ponticRuleError: "Pontics must be adjacent to a Crown, Abutment, Coping, or Inlay/Onlay.",
    footerCopyright: "© 2026 Dental3Design. All rights reserved.",
    placeholderInstructions: "Please provide details for the design (e.g. Crown on 26, Coping on 11, Shade A2, Adjust occlusion).",
    caseSubmitted: "Case submitted successfully!",
    helpTitle: "Need help?",
    helpDescription: "Describe your problem and we will get back to you as soon as possible.",
    sendMessage: "Send message",
    messagePlaceholder: "Write your message here...",
    messageSent: "Your message has been sent and will be processed as soon as possible.",
    subjectLabel: "Subject",
    subjectPlaceholder: "",
    insufficientUnitsTitle: "Insufficient Units",
    insufficientUnitsMessage: "You do not have enough units to submit this case. Please purchase more.",
    ok: "OK",
    caseSentTitle: "Case Sent!",
    caseSentMessage: "Your case has been successfully sent and is being processed by our designers.",
    backToDashboard: "Back to Dashboard",
    caseDetailsTitle: "Case Details",
    caseNumber: "Case Number",
    date: "Date",
    type: "Type",
    downloadFiles: "Download Files",
    deleteCase: "Delete Case",
    deleteCaseConfirm: "Are you sure you want to delete this case?",
    helpWithCase: "Help with case",
    noCasesFound: "No cases match your search.",
    manageAccount: "Manage Account",
    logout: "Logout",
    perTooth: "per tooth",
    perPilier: "per abutment",
    perImplant: "per implant",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusPending: "Pending",
    caseInProgressTitle: "Design in Progress",
    casePendingTitle: "Pending Processing",
    caseInProgressMessage: "Our designers are currently working on your case. You will receive a notification as soon as it is ready.",
    casePendingMessage: "Your case has been received and will soon be handled by one of our designers.",
    close: "Close",
    statInProgress: "In Progress",
    statCompleted: "Completed (30d)",
    statPending: "Pending",
    statTotal: "Total Designs",
    myCasesTitle: "My cases",
    welcomeMessage: "Welcome to your Dental3Design workspace.",
    quickActionsTitle: "Quick Actions",
    pricingLabel: "Pricing",
    libraryLabel: "Library",
    all: "All",
    tableHeaderId: "Case ID",
    tableHeaderPatient: "Patient",
    tableHeaderDate: "Date",
    tableHeaderStatus: "Status",
    buyUnitsTitle: "Buy Units",
    unitPrice: "that is {price}€ / unit",
    totalPrice: "Total: {price}€",
    cartTitle: "My Cart",
    emptyCart: "Your cart is empty",
    checkout: "Proceed to Payment",
    orderSummary: "Order Summary",
    landingTitle: "Digital Dental Design",
    landingDescription: "Is your practice equipped with CAD/CAM? Or does your laboratory lack time?\n\nDental3Design takes care of your digital designs! Register and upload your files from your intra-oral scanner or from our clear, simple, and intuitive platform.\n\nYour case will be ready to be processed within controlled deadlines and costs for the optimization and profitability of your practice or laboratory, while offering you a quality service.\n\nYour time is precious. With Dental3Design, focus on the essentials: your patients and production.",
    getStarted: "Get Started Here",
    login: "Login",
    contactUs: "Contact Us",
    email: "Email",
    cancel: "Cancel",
    confirm: "Confirm",
    buyNow: "Order Now",
    error3DTitle: "3D Loading Error",
    error3DMessage: "The STL file could not be loaded or is corrupted.",
    loading3D: "Loading...",
    no3DFile: "No 3D file available",
    viewDetails: "View details"
  },
  es: {
    dashboard: "Tablero",
    createNewCase: "Crear nuevo caso",
    unitsAvailable: "Units disponibles",
    buyMoreUnits: "Comprar más units",
    selectTeeth: "1. Seleccionar dientes",
    clearSelection: "Borrar selección",
    selectProsthesisType: "2. Seleccionar tipo de prótesis",
    forTooth: "para el diente",
    forTeeth: "para {count} dientes",
    selectTeethFirst: "Seleccione los dientes primero",
    uploadStl: "3. Depositar los archivos",
    caseInstructions: "4. Instrucciones del caso",
    patientNameLabel: "Nombre del paciente",
    patientNamePlaceholder: "ej: Sr. Juan Pérez",
    submitCase: "Enviar caso",
    upperJaw: "Mandíbula superior",
    lowerJaw: "Mandíbula inferior",
    toothSelectionHint: "Haga clic en un diente para seleccionarlo. Use Shift + Clic para seleccionar varios dientes.",
    crown: "Corona",
    pontic: "Póntico",
    pilier: "Pilar",
    veneer: "Carilla",
    inlay: "Inlay/Onlay",
    post_core: "Perno muñón",
    coping: "Cofia",
    reduced_pontic: "Póntico reducido",
    implant_planning: "Planificación de implantes",
    surgical: "Guía quirúrgica",
    modeles: "Modelos",
    wax_up: "Wax-up",
    smile_design: "Smile Design",
    barre: "Barra (simple/homotética/toronto)",
    dragDropHint: "Arrastre y suelte los archivos aquí, o haga clic para buscar",
    supportedFormat: "Formatos soportados: STL, DICOM",
    maxFileSize: "Tamaño máximo: 50MB",
    caseSummary: "Resumen del caso",
    teeth: "Dientes",
    items: "Elementos",
    item: "Elemento",
    noProsthesisSelected: "Ninguna prótesis seleccionada",
    noTeethSelectedYet: "Ningún diente seleccionado aún",
    totalCost: "Coste total",
    unitsDeductionHint: "Las units se deducirán tras la entrega exitosa del diseño.",
    validationError: "Error de validación",
    ponticRuleError: "Los pónticos deben estar adyacentes a una corona, pilar, cofia o inlay/onlay.",
    footerCopyright: "© 2026 Dental3Design. Todos los derechos reservados.",
    placeholderInstructions: "Proporcione detalles para el diseño (ej: Corona en 26, Cofia en 11, Tono A2, Ajustar oclusión).",
    caseSubmitted: "¡Caso enviado con éxito!",
    helpTitle: "¿Necesita ayuda?",
    helpDescription: "Describa su problema y le responderemos lo antes posible.",
    sendMessage: "Enviar mensaje",
    messagePlaceholder: "Escriba su mensaje aquí...",
    messageSent: "Su mensaje ha sido enviado y será procesado lo antes posible.",
    subjectLabel: "Asunto",
    subjectPlaceholder: "",
    insufficientUnitsTitle: "Units insuficientes",
    insufficientUnitsMessage: "No tiene suficientes units para enviar este caso. Por favor, compre más.",
    ok: "OK",
    caseSentTitle: "¡Caso enviado!",
    caseSentMessage: "Su caso ha sido enviado con éxito y está siendo procesado por nuestros diseñadores.",
    backToDashboard: "Volver al tablero",
    caseDetailsTitle: "Detalles del caso",
    caseNumber: "Número del caso",
    date: "Fecha",
    type: "Tipo",
    downloadFiles: "Descargar archivos",
    deleteCase: "Eliminar caso",
    deleteCaseConfirm: "¿Está seguro de que desea eliminar este caso?",
    helpWithCase: "Ayuda con el caso",
    noCasesFound: "No se encontraron casos que coincidan con su búsqueda.",
    manageAccount: "Gestionar mi cuenta",
    logout: "Cerrar sesión",
    perTooth: "por diente",
    perPilier: "por pilar",
    perImplant: "por implante",
    statusInProgress: "En curso",
    statusCompleted: "Completado",
    statusPending: "Pendiente",
    caseInProgressTitle: "Diseño en curso",
    casePendingTitle: "Pendiente de procesamiento",
    caseInProgressMessage: "Nuestros diseñadores están trabajando actualmente en su caso. Recibirá una notificación tan pronto como esté listo.",
    casePendingMessage: "Su caso ha sido recibido y pronto será atendido por uno de nuestros diseñadores.",
    close: "Cerrar",
    statInProgress: "Casos en curso",
    statCompleted: "Completados (30d)",
    statPending: "Pendientes",
    statTotal: "Total Diseños",
    myCasesTitle: "Mis casos",
    welcomeMessage: "Bienvenido a su espacio de diseño Dental3Design.",
    quickActionsTitle: "Acciones rápidas",
    pricingLabel: "Tarifas",
    libraryLabel: "Biblioteca",
    all: "Todos",
    tableHeaderId: "ID Caso",
    tableHeaderPatient: "Paciente",
    tableHeaderDate: "Fecha",
    tableHeaderStatus: "Estado",
    buyUnitsTitle: "Comprar Units",
    unitPrice: "es decir {price}€ / unit",
    totalPrice: "Total: {price}€",
    cartTitle: "Mi Carrito",
    emptyCart: "Tu carrito está vacío",
    checkout: "Proceder al pago",
    orderSummary: "Resumen del pedido",
    landingTitle: "Diseño Dental Digital",
    landingDescription: "¿Su clínica está equipada con CAD/CAM? ¿O su laboratorio carece de tiempo?\n\n¡Dental3Design se encarga de sus diseños digitales! Regístrese y suba sus archivos desde su escáner intraoral o desde nuestra plataforma clara, sencilla e intuitiva.\n\nSu caso estará listo para ser procesado en plazos y costes controlados para la optimización y rentabilidad de su clínica o laboratorio, ofreciéndole un servicio de calidad.\n\nSu tiempo es valioso. Con Dental3Design, concéntrese en lo esencial: sus pacientes y la producción.",
    getStarted: "Comience Aquí",
    login: "Conexión",
    contactUs: "Contáctenos",
    email: "Email",
    cancel: "Cancelar",
    confirm: "Confirmar",
    buyNow: "Pedir ahora",
    error3DTitle: "Error de carga 3D",
    error3DMessage: "El archivo STL no se pudo cargar o está dañado.",
    loading3D: "Cargando...",
    no3DFile: "No hay archivo 3D disponible",
    viewDetails: "Ver detalles"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    let text = translations[language][key];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
