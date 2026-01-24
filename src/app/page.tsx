"use client";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Link from 'next/link'; // Ensure Link is imported if needed, or remove unused imports
import Hero from "@/components/Home/Hero";
import TravelSearch from "@/components/Home/TravelSearch";
// import CategoryGrid from "@/components/Catalog/CategoryGrid"; // Replaced
import DynamicSection from "@/components/Catalog/DynamicSection";
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
