import { Suit } from '@/types/game';

export const SUITS: Record<string, Suit> = {
  HEARTS: { 
    symbol: '♥', 
    type: 'introspection', // Mantiene tipo original para compatibilidad
    color: 'suit-heart', 
    label: 'SUMINISTROS' // Actualizado según nuevas mecánicas
  },
  DIAMONDS: { 
    symbol: '♦', 
    type: 'base', 
    color: 'suit-diamond', 
    label: 'INFRAESTRUCTURA' // Actualizado según nuevas mecánicas
  },
  CLUBS: { 
    symbol: '♣', 
    type: 'threat', 
    color: 'suit-club', 
    label: 'ANOMALÍAS' // Actualizado según nuevas mecánicas
  },
  SPADES: { 
    symbol: '♠', 
    type: 'work', // Mantiene tipo original para compatibilidad
    color: 'suit-spade', 
    label: 'OPERACIONES' // Actualizado según nuevas mecánicas
  }
};

export const CARD_TEMPLATES = {
  HEARTS: [
    "Encuentro una foto arrugada bajo el teclado. Son ellos. Casi había olvidado sus caras.",
    "El zumbido de los servidores se detiene por un segundo. Silencio absoluto. Paz.",
    "Me miro en el reflejo negro del monitor. Aún soy yo. Creo que aún soy yo.",
    "Recuerdo mi primer día en la academia. Todo parecía tan ordenado entonces.",
    "Cierro los ojos. Imagino el calor del sol en la playa de Viedma.",
    "Un momento de lucidez entre la estática. Sé por qué estoy aquí.",
    "Sueño despierto con una taza de café caliente. Casi puedo olerlo.",
    "Escribo una carta mental a mi familia. No la enviaré, pero ayuda.",
    "Releo mis notas antiguas. Mi caligrafía era más firme hace una semana.",
    "La luz parpadea rítmicamente. Es casi hipnótico, calmante.",
    "Encuentro un viejo MP3 en un cajón. Funciona. Una canción de rock nacional suena.",
    "Me doy cuenta de que he sobrevivido hasta ahora. Soy más fuerte de lo que pensaba.",
    "Limpio mi estación de trabajo. El orden físico trae orden mental."
  ],
  DIAMONDS: [
    "La calefacción emite un chirrido metálico. La temperatura baja 2 grados.",
    "Encuentro una ración de emergencia olvidada en la despensa. Sabe a cartón, pero nutre.",
    "Una tubería estalla en el pasillo B. Agua helada por todas partes.",
    "El generador auxiliar tose. Las luces se atenúan peligrosamente.",
    "Descubro una botella de whisky medio llena en el despacho del Comandante.",
    "Ventisca exterior. El viento golpea las paredes como un gigante furioso.",
    "Fallo en los filtros de aire. El ambiente se siente viciado y pesado.",
    "Encuentro un kit médico básico. Vendas y aspirinas.",
    "La cafetera vuelve a funcionar milagrosamente. Néctar negro.",
    "Una ventana del sector 4 se agrieta. Debo sellarla con cinta aislante.",
    "Cortocircuito en el panel de control. Chispas y olor a ozono.",
    "Logro redirigir energía de los laboratorios vacíos a los calefactores.",
    "El traje térmico tiene un rasgadura. El frío se cuela como agujas."
  ],
  CLUBS: [
    "La pantalla muestra mi nombre repetido mil veces. Yo no lo escribí.",
    "Oigo golpes dentro de los conductos de ventilación. Algo grande se arrastra.",
    "Sangrado nasal repentino. La sangre cae sobre las teclas formando patrones.",
    "Las sombras en la esquina de la habitación tienen la geometría incorrecta.",
    "Una voz susurra desde los altavoces apagados: 'Abre la puerta'.",
    "Veo a un compañero caminando por el pasillo. Estoy solo en la base.",
    "El código en la pantalla se reorganiza formando una cara que grita.",
    "Siento que algo respira en mi nuca. No me atrevo a voltear.",
    "Todos los relojes de la base se detienen a la vez.",
    "Mis manos no me obedecen por un minuto. Escriben solas: NO ERES TÚ.",
    "Alucinación auditiva: el sonido de olas rompiendo, pero son olas de estática.",
    "La temperatura no baja, pero siento un frío que quema los huesos. Es la Señal.",
    "Pesadilla despierto: la habitación se estira infinitamente."
  ],
  SPADES: [
    "Logro desencriptar el log del día 45. Los datos fluyen.",
    "Restablezco la conexión con el satélite durante 30 segundos. Señal enviada.",
    "El algoritmo de compresión funciona. Bloque de datos asegurado.",
    "Limpio un sector corrupto del disco duro. El Firewall se fortalece.",
    "Analizo las muestras de audio. Hay un patrón inteligente en el ruido.",
    "Hackeo el terminal del supervisor. Acceso a subrutinas de seguridad.",
    "Compilación exitosa. El sistema responde más rápido.",
    "Reinicio los protocolos de comunicación de emergencia.",
    "Aíslo el virus que causó el colapso inicial.",
    "Descifro las coordenadas de origen de la Señal. No viene de la Tierra.",
    "Optimizo el consumo de energía del transmisor.",
    "Recupero la bitácora de video final del equipo anterior.",
    "Ejecuto el protocolo 'Caja Negra'. Los datos están listos para envío."
  ]
};

export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const STORAGE_KEY = 'glacial-echo-save';

