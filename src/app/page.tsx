"use client";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Link from 'next/link'; // Ensure Link is imported if needed, or remove unused imports
import Hero from "@/components/Home/Hero";
import TravelSearch from "@/components/Home/TravelSearch";
// import CategoryGrid from "@/components/Catalog/CategoryGrid"; // Replaced
import DynamicSection from "@/components/Catalog/DynamicSection";
import PromotionsSection from "@/components/Catalog/PromotionsSection";
import UnforgettableMoments from "@/components/Home/UnforgettableMoments";
import TravelPlanner from "@/components/Planner/TravelPlanner";

export default function Home() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                {/* Adjusted spacing/layout */}
                <div style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
                    {/* TravelSearch is actually inside Hero in previous design, keeping consistency */}
                </div>

                <PromotionsSection />

                {/* Dynamic Sections */}
                <DynamicSection
                    title="Destinos Populares"
                    subtitle="Explora los lugares más increíbles de Venezuela."
                    endpoint="/api/catalog/destinations"
                    type="destination"
                />

                <DynamicSection
                    title="Hoteles Exclusivos"
                    subtitle="Descansa en los mejores alojamientos."
                    endpoint="/api/catalog/hotels"
                    type="hotel"
                />

                <DynamicSection
                    title="Tours & Aventuras"
                    subtitle="Vive experiencias inolvidables."
                    endpoint="/api/catalog/tours"
                    type="tour"
                />

                <DynamicSection
                    title="Traslados y Movilidad"
                    subtitle="Viaja cómodo y seguro a tu destino."
                    endpoint="/api/catalog/transfers"
                    type="vehicle" // We might need to update DynamicSection to handle 'vehicle' or just map it
                />

                <UnforgettableMoments />

                <TravelPlanner />

            </main>
            <Footer />
        </>
    );
}
