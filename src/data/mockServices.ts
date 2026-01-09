export interface Service {
    id: string;
    title: string;
    category: 'Tour' | 'Hotel' | 'Vehicle' | 'Circuit';
    price: number;
    image: string;
    location: string;
    rating: number;
    description?: string;
    destination?: 'Los Roques' | 'Canaima' | 'Isla de Margarita' | 'Mérida';
}

export const mockServices: Service[] = [
    {
        id: '1',
        title: 'Expedición a Los Roques',
        category: 'Tour',
        price: 450,
        image: '/images/los-roques-01.jpg',
        location: 'Los Roques',
        rating: 5,
        destination: 'Los Roques',
        description: 'Disfruta de una experiencia inolvidable en el archipiélago de Los Roques. Incluye traslados aéreos, alojamiento en posada VIP, todas las comidas y excursiones diarias a los cayos más exclusivos como Cayo de Agua y Francisquí. Perfecto para parejas y amantes del mar.'
    },
    {
        id: '2',
        title: 'Canaima: Salto Ángel',
        category: 'Tour',
        price: 500,
        image: '/images/canaima.jpg',
        location: 'Canaima',
        rating: 3,
        destination: 'Canaima',
        description: 'Aventúrate en el corazón de la selva para conocer la caída de agua más alta del mundo. Este paquete incluye vuelo sobre el Salto Ángel, excursión a la Laguna de Canaima, caminata al Sapo y alojamiento en campamento con vista a los tepuyes.'
    },
    {
        id: '3',
        title: 'Hotel Boutique Maloka',
        category: 'Hotel',
        price: 200,
        image: '/images/maloka.jpg',
        location: 'Margarita',
        rating: 4.8,
        destination: 'Isla de Margarita',
        description: 'Lujo y confort en la Isla de Margarita. El Hotel Boutique Maloka ofrece piscinas tipo espejo de agua, habitaciones elegantes y una gastronomía exquisita. Ideal para el relax absoluto.'
    },
    {
        id: '4',
        title: 'Toyota Fortuner 4x4',
        category: 'Vehicle',
        price: 120,
        image: '/images/fortuner.jpg',
        location: 'Caracas',
        rating: 4.9,
        destination: 'Isla de Margarita',
        description: 'Alquiler de camioneta 4x4 blindada con chofer. Ideal para traslados ejecutivos o viajes por carretera con la máxima seguridad y confort. Capacidad para 5 pasajeros y equipaje.'
    },
    {
        id: '5',
        title: 'Full Day Morrocoy',
        category: 'Tour',
        price: 80,
        image: '/images/morrocoy.jpg',
        location: 'Falcón',
        rating: 4.7,
        destination: 'Mérida',
        description: 'Escápate por un día a las cristalinas aguas del Parque Nacional Morrocoy. Incluye traslado en lancha privada, visita a Cayo Sombrero y Los Juanes, almuerzo playero y bebidas.'
    },
    {
        id: '6',
        title: 'Roraima Trekking',
        category: 'Circuit',
        price: 600,
        image: '/images/roraima.jpg',
        location: 'Gran Sabana',
        rating: 5,
        destination: 'Canaima',
        description: 'El desafío definitivo para los amantes del trekking. 6 días de caminata para conquistar la cima del Monte Roraima. Incluye guías pemones, portadores, carpas y comidas en la montaña.'
    }
];
