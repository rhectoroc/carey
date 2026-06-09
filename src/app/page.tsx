"use client";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import Link from 'next/link'; // Ensure Link is imported if needed, or remove unused imports
import HeroSlider from "@/components/Home/HeroSlider";
import TravelSearch from "@/components/Home/TravelSearch";
// import CategoryGrid from "@/components/Catalog/CategoryGrid"; // Replaced
import DynamicSection from "@/components/Catalog/DynamicSection";
import PromotionsSection from "@/components/Catalog/PromotionsSection";
import UnforgettableMoments from "@/components/Home/UnforgettableMoments";
import TravelPlanner from "@/components/Planner/TravelPlanner";
import { useLanguage } from '@/context/LanguageContext';

import styles from './page.module.css';

export default function Home() {
    const { t } = useLanguage();

    return (
        <>
            <Navbar />
            <main>
                <HeroSlider />
                {/* Spacing managed within components for better responsiveness */}

                <PromotionsSection />

                {/* Dynamic Sections */}
                <DynamicSection
                    title={t('sections.popular')}
                    subtitle={t('sections.popularSub')}
                    endpoint="/api/catalog/destinations"
                    type="destination"
                    className={styles.popularDestinations}
                    subtitleVariant="rolling"
                    cardVariant="popIn"
                />

                <DynamicSection
                    title={t('sections.hotels')}
                    subtitle={t('sections.hotelsSub')}
                    endpoint="/api/catalog/hotels"
                    type="hotel"
                    className={styles.exclusiveHotels}
                    cardVariant="sideSlide"
                />

                <DynamicSection
                    title={t('sections.tours')}
                    subtitle={t('sections.toursSub')}
                    endpoint="/api/catalog/tours"
                    type="tour"
                    className={styles.toursAdventures}
                    cardVariant="flip"
                />

                <DynamicSection
                    title={t('sections.transfers')}
                    subtitle={t('sections.transfersSub')}
                    endpoint="/api/catalog/transfers"
                    type="vehicle"
                    cardVariant="slideUp"
                />

                <UnforgettableMoments />

                <TravelPlanner />

            </main>
            <Footer />
        </>
    );
}
