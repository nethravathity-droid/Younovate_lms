import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './public-website/layouts/PublicLayout';

import Home from './public-website/pages/Home';
import Programs from './public-website/pages/Programs';
import Workshops from './public-website/pages/Workshops';
import WorkshopDetails from './public-website/pages/WorkshopDetails';
import WorkshopRegister from './public-website/pages/WorkshopRegister';
import About from './public-website/pages/About';
import Contact from './public-website/pages/Contact';
import Signup from './public-website/pages/Signup';

export default function PublicLayoutShim() {
  return (
    <PublicLayout>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/workshops" element={<Workshops />} />
        <Route path="/workshops/:id" element={<WorkshopDetails />} />
        <Route path="/workshop/register" element={<WorkshopRegister />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PublicLayout>
  );
}

