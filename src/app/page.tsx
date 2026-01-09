"use client";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Hero from "@/components/Home/Hero";
import TravelSearch from "@/components/Home/TravelSearch";
import CategoryGrid from "@/components/Catalog/CategoryGrid";
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

                <CategoryGrid />

                <UnforgettableMoments />

                <TravelPlanner />

            </main>
            <Footer />
        </>
    );
}
