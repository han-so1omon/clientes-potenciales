import type { Messages } from "./en";

/** Spanish copy (neutral Latin American). Must mirror en.ts. */
export const es: Messages = {
  languageName: "Español",
  switchLanguage: "English",
  draftBanner:
    "BORRADOR — el texto de consentimiento está en revisión legal. No enviar tráfico real.",
  home: {
    metaTitle: "Opciones de seguro para personas de 50 años o más",
    headline: "Seguros que le ayudan mientras vive",
    subhead:
      "Elija un tema abajo. Un agente de seguros con licencia puede explicarle sus opciones. Hablar con un agente no tiene costo.",
    learnMore: "Ver opciones",
    none: "No hay opciones de cobertura disponibles en este momento. Vuelva pronto.",
  },
  landing: {
    formTitle: "Vea sus opciones",
    submit: "Ver mis opciones",
    submitting: "Enviando…",
    freeToTalk: "Hablar con un agente con licencia no tiene costo",
    ageRange: "Opciones para personas de {min} a {max} años",
    bilingual: "Atención en español o en inglés",
    otherOptions: "Otras opciones de cobertura",
  },
  lines: {
    long_term_care: {
      title: "Seguro de cuidado a largo plazo",
      headline: "Planifique el cuidado que podría necesitar con la edad",
      subhead:
        "El seguro de cuidado a largo plazo puede ayudar a pagar el cuidado en casa, en una residencia asistida o en un asilo de ancianos. Cuéntenos un poco sobre usted y un agente con licencia puede explicarle sus opciones.",
      points: [
        "Puede ayudar a proteger sus ahorros de los costos del cuidado",
        "Puede ayudar a pagar el cuidado en casa",
      ],
      question: "¿Qué le trae aquí hoy?",
      options: {
        planning_ahead: "Planificar con tiempo",
        comparing_options: "Comparar opciones",
        for_me_and_spouse: "Cobertura para mí y mi pareja",
      },
    },
    home_health_care: {
      title: "Seguro de cuidado de salud en el hogar",
      headline: "Ayuda para pagar el cuidado en casa",
      subhead:
        "El seguro de cuidado de salud en el hogar puede ayudar a pagar el cuidado en su casa, como visitas de enfermería, terapia o ayuda con las actividades diarias. Un agente con licencia puede explicarle sus opciones.",
      points: [
        "Quédese en casa mientras recibe cuidado",
        "Puede ayudar con costos que Medicare tal vez no cubre",
      ],
      question: "¿Qué le trae aquí hoy?",
      options: {
        planning_ahead: "Planificar con tiempo",
        comparing_options: "Comparar opciones",
        for_me_and_spouse: "Cobertura para mí y mi pareja",
      },
    },
    critical_illness: {
      title: "Seguro de enfermedades graves",
      headline: "Dinero en efectivo si se presenta una enfermedad grave",
      subhead:
        "El seguro de enfermedades graves puede pagarle una suma de dinero si le diagnostican una enfermedad cubierta, como un ataque al corazón, un derrame cerebral o cáncer. Usted decide cómo usar el dinero.",
      points: [
        "El dinero se le paga a usted, no al hospital",
        "Úselo para cuentas, viajes o gastos diarios",
      ],
      question: "¿Cuánta cobertura, más o menos?",
      options: { "10000": "$10,000", "25000": "$25,000", "50000": "$50,000", "100000": "$100,000" },
    },
    hospital_indemnity: {
      title: "Seguro de indemnización hospitalaria",
      headline: "Dinero en efectivo por estadías en el hospital",
      subhead:
        "El seguro de indemnización hospitalaria puede pagarle dinero por estadías cubiertas en el hospital. Puede ayudar con deducibles, copagos y otros costos que su plan de salud no paga.",
      points: [
        "Los beneficios se le pagan a usted",
        "Puede funcionar junto con Medicare u otra cobertura",
      ],
      question: "¿Qué es lo más importante para usted?",
      options: {
        high_out_of_pocket_costs: "Bajar mis gastos de bolsillo",
        planning_ahead: "Planificar con tiempo",
        not_sure: "Todavía no estoy seguro",
      },
    },
    life_living_benefits: {
      title: "Seguro de vida con beneficios en vida",
      headline: "Seguro de vida que podría usar mientras vive",
      subhead:
        "Algunas pólizas de seguro de vida le permiten usar parte del beneficio antes si se enferma gravemente. Un agente con licencia puede explicarle cómo funcionan los beneficios en vida.",
      points: [
        "Protección para su familia",
        "Posible acceso a dinero durante una enfermedad grave",
      ],
      question: "¿Cuánta cobertura, más o menos?",
      options: {
        "25000": "$25,000",
        "50000": "$50,000",
        "100000": "$100,000",
        "250000": "$250,000",
      },
    },
    dental_vision_hearing: {
      title: "Seguro dental, de visión y de audición",
      headline: "Cobertura para sus dientes, ojos y oídos",
      subhead:
        "Medicare Original por lo general no cubre el cuidado dental de rutina, los anteojos ni los audífonos. El seguro dental, de visión y de audición puede ayudar con estos costos.",
      points: ["Ayuda con limpiezas, empastes y dentaduras", "Ayuda con anteojos y audífonos"],
      question: "¿Qué cobertura desea?",
      options: {
        dental: "Dental",
        vision: "Visión",
        hearing: "Audición",
        all_three: "Las tres",
      },
    },
    medicare_supplement: {
      title: "Seguro suplementario de Medicare",
      headline: "Ayuda con costos que Medicare Original no paga",
      subhead:
        "El seguro suplementario de Medicare (Medigap) puede ayudar a pagar deducibles, copagos y coseguros. Un agente con licencia puede comparar planes con usted.",
      points: ["Funciona con Medicare Original", "Compare planes de diferentes compañías"],
      question: "¿Cuál es su situación?",
      options: {
        turning_65: "Voy a cumplir 65 años pronto",
        already_on_medicare: "Ya tengo Medicare",
      },
    },
    final_expense: {
      title: "Seguro de gastos finales",
      headline: "Ayude a proteger a su familia de los gastos finales",
      subhead:
        "El seguro de gastos finales puede ayudar a pagar el funeral y las últimas cuentas. Un agente con licencia puede explicarle sus opciones.",
      points: ["Pólizas pequeñas para los gastos finales", "Solicitud sencilla"],
      question: "¿Cuánta cobertura, más o menos?",
      options: {
        "5000": "$5,000",
        "10000": "$10,000",
        "15000": "$15,000",
        "25000": "$25,000",
        "50000": "$50,000+",
      },
    },
  },
  fields: {
    firstName: "Nombre",
    lastName: "Apellido",
    phone: "Número de teléfono",
    phoneHint: "Ejemplo: (305) 555-1234",
    email: "Correo electrónico (opcional)",
    birthDate: "Fecha de nacimiento",
    birthMonth: "Mes",
    birthDay: "Día",
    birthYear: "Año",
    zip: "Código postal (ZIP)",
    bestTimeToCall: "Mejor hora para llamarle",
    consent: "He leído y acepto la declaración de abajo.",
  },
  months: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  callTimes: { morning: "Mañana", afternoon: "Tarde", evening: "Noche", any: "Cualquier hora" },
  errors: {
    required: "Por favor complete este campo.",
    invalid: "Por favor revise este campo.",
    invalid_phone: "Escriba un número de teléfono de EE. UU. de 10 dígitos.",
    invalid_date: "Por favor revise la fecha.",
    age_out_of_range: "Esta cobertura es para personas de {min} a {max} años.",
    out_of_area: "Lo sentimos, todavía no atendemos este código postal.",
    consent_required: "Marque la casilla para continuar.",
    form: "Algo salió mal. Por favor intente de nuevo.",
    summary: "Por favor corrija los campos marcados abajo.",
  },
  thankYou: {
    metaTitle: "Gracias",
    headline: "¡Gracias!",
    body: "Recibimos su solicitud. Un agente de seguros con licencia podría llamarle pronto para explicarle sus opciones.",
    note: "Puede pedir que dejen de contactarle en cualquier momento.",
    optOutLink: "Dejar de recibir contacto",
  },
  optOut: {
    metaTitle: "Dejar de recibir contacto",
    headline: "Dejar de recibir llamadas, textos y correos",
    body: "Escriba su número de teléfono o su correo electrónico. Dejaremos de vender su información y pediremos a nuestros socios que dejen de contactarle.",
    phone: "Número de teléfono",
    email: "Correo electrónico",
    submit: "Dejen de contactarme",
    needOne: "Escriba un número de teléfono o un correo electrónico.",
    done: "Listo. Recibimos su solicitud. Puede tardar hasta 10 días hábiles para que todo contacto se detenga.",
  },
  legalPending: {
    privacyTitle: "Política de Privacidad",
    termsTitle: "Términos de Uso",
    partnersTitle: "Nuestros socios",
    body: "Esta página está en preparación.",
  },
  footer: {
    privacy: "Política de Privacidad",
    terms: "Términos de Uso",
    partners: "Socios",
    optOut: "Dejar de recibir contacto",
    disclaimer:
      "Este sitio web no está conectado ni respaldado por el gobierno de EE. UU., el programa federal de Medicare ni ninguna agencia del gobierno. No somos una compañía de seguros. Agentes con licencia pueden explicarle las opciones de cobertura.",
  },
};
