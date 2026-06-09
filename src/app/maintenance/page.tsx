"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Settings, Mail, Phone } from 'lucide-react';
import styles from './Maintenance.module.css';

export default function MaintenancePage() {
  return (
    <div className={styles.maintenanceContainer}>
      <motion.div 
        className={styles.glassCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className={styles.logoContainer}>
          <Image 
            src="/LogoCarey01.png" 
            alt="Carey Tour & Travel" 
            width={180} 
            height={60} 
            className={styles.logo}
            priority
          />
        </div>

        <motion.div 
          className={styles.iconWrapper}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Settings size={40} />
        </motion.div>

        <h1 className={styles.title}>Sitio en Mantenimiento</h1>
        
        <div className={styles.divider}></div>

        <p className={styles.subtitle}>
          Estamos trabajando en mejorar nuestra plataforma para ofrecerte una experiencia de lujo aún mejor. 
          Estaremos de vuelta en poco tiempo.
        </p>

        <div className={styles.contactInfo}>
          <h3 className={styles.contactTitle}>¿Necesitas asistencia inmediata?</h3>
          <div className={styles.contactMethods}>
            <a href="https://wa.me/584240000000" className={styles.contactMethod} target="_blank" rel="noopener noreferrer">
              <Phone size={20} className={styles.socialIcon} />
              <span>Contáctanos por WhatsApp</span>
            </a>
            <a href="mailto:info@viajes-carey.com" className={styles.contactMethod}>
              <Mail size={20} className={styles.socialIcon} />
              <span>info@viajes-carey.com</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
