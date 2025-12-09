import React from 'react';

export interface ServiceItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
}

export interface NavItem {
  label: string;
  href: string;
  id?: string; // Added for internal routing
  subItems?: { label: string; href: string; id?: string }[];
}

export enum SectionId {
  HOME = 'home',
  ABOUT = 'about',
  SERVICES = 'services',
  FRANCHISE = 'franchise',
  CONTACT = 'contact'
}

export interface Testimonial {
  author: string;
  description: string;
  company: string;
  image: string;
  link?: string;
}

export interface ComparisonItem {
  title: string;
  items: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MaterialItem {
  title: string;
  description: string;
  image: string;
}
