import React from 'react';

export interface ProsthesisBase {
  id: string;
  icon: React.ReactNode;
  cost: number;
}

const CustomIcons = {
  Crown: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8C6 6 8 5 12 5C16 5 18 6 18 8C18 12 17 18 12 18C7 18 6 12 6 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 6.5C11 6 13 6 14 6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  Pontic: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left Crown */}
      <path d="M2 12C2 10.5 3.5 10 6 10C8.5 10 10 10.5 10 12C10 15 9.5 18 6 18C2.5 18 2 15 2 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Middle Crown */}
      <path d="M8 12C8 10.5 9.5 10 12 10C14.5 10 16 10.5 16 12C16 15 15.5 18 12 18C8.5 18 8 15 8 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="white"/>
      {/* Right Crown */}
      <path d="M14 12C14 10.5 15.5 10 18 10C20.5 10 22 10.5 22 12C22 15 21.5 18 18 18C14.5 18 14 15 14 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Bridge connections */}
      <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Abutment: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8C8 6 9 5 12 5C15 5 16 6 16 8C16 10 15 11 12 11C9 11 8 10 8 8Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1"/>
      <path d="M10 11V18C10 19 11 20 12 20C13 20 14 19 14 18V11" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 13H14M10 15H14M10 17H14" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  Veneer: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 8C7 6 8 5 11 5C14 5 15 6 15 8C15 12 14 18 11 18C8 18 7 12 7 8Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05"/>
      <path d="M11 8C11 6 12 5 15 5C18 5 19 6 19 8C19 12 18 18 15 18C12 18 11 12 11 8Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1"/>
    </svg>
  ),
  Inlay: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8C6 6 8 5 12 5C16 5 18 6 18 8C18 12 17 18 12 18C7 18 6 12 6 8Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 9C9 8 10 8 12 8C14 8 15 8 15 9V11C15 12 14 13 12 13C10 13 9 12 9 11V9Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  PostCore: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8C6 6 8 5 12 5C16 5 18 6 18 8C18 12 17 18 12 18C7 18 6 12 6 8Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 9H14L13 13H11L10 9Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1"/>
      <path d="M12 13V17" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Coping: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 14C8 13 9 12 10 12H14C15 12 16 13 16 14V16H8V14Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 12C7 10 8 8 12 8C16 8 17 10 17 12" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="12" cy="16" rx="6" ry="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  ReducedPontic: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left Crown */}
      <path d="M2 12C2 10.5 3.5 10 6 10C8.5 10 10 10.5 10 12C10 15 9.5 18 6 18C2.5 18 2 15 2 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Middle Crown (Dashed) */}
      <path d="M8 12C8 10.5 9.5 10 12 10C14.5 10 16 10.5 16 12C16 15 15.5 18 12 18C8.5 18 8 15 8 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeDasharray="2 2"/>
      {/* Right Crown */}
      <path d="M14 12C14 10.5 15.5 10 18 10C20.5 10 22 10.5 22 12C22 15 21.5 18 18 18C14.5 18 14 15 14 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Bridge connections */}
      <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  ImplantPlanning: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 16L9 19H15L14 16" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 8V14M10 10H14" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
    </svg>
  ),
  Surgical: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 7C6 7 5 10 5 13C5 16 7 18 12 18C17 18 19 16 19 13C19 10 18 7 18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="9" r="1.5" fill="currentColor" fillOpacity="0.5"/>
      <circle cx="12" cy="15" r="1.5" fill="currentColor" fillOpacity="0.5"/>
      <circle cx="16" cy="9" r="1.5" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  ),
  Smile: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12C4 12 7 16 12 16C17 16 20 12 20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12C4 12 7 10 12 10C17 10 20 12 20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 12.5C8 13.5 10 14 12 14C14 14 16 13.5 17 12.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  Barre: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-7, 0)">
        <path d="M12 7C12 6 12.5 5.5 14 5.5C15.5 5.5 16 6 16 7C16 8 15.5 8.5 14 8.5C12.5 8.5 12 8 12 7Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
        <path d="M13 8.5V14C13 14.5 13.5 15 14 15C14.5 15 15 14.5 15 14V8.5" stroke="currentColor" strokeWidth="1"/>
      </g>
      <g transform="translate(-2, 0)">
        <path d="M12 7C12 6 12.5 5.5 14 5.5C15.5 5.5 16 6 16 7C16 8 15.5 8.5 14 8.5C12.5 8.5 12 8 12 7Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
        <path d="M13 8.5V14C13 14.5 13.5 15 14 15C14.5 15 15 14.5 15 14V8.5" stroke="currentColor" strokeWidth="1"/>
      </g>
      <g transform="translate(3, 0)">
        <path d="M12 7C12 6 12.5 5.5 14 5.5C15.5 5.5 16 6 16 7C16 8 15.5 8.5 14 8.5C12.5 8.5 12 8 12 7Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
        <path d="M13 8.5V14C13 14.5 13.5 15 14 15C14.5 15 15 14.5 15 14V8.5" stroke="currentColor" strokeWidth="1"/>
      </g>
      <path d="M5 9H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export const PROSTHESIS_BASE_DATA: ProsthesisBase[] = [
  { id: 'crown', icon: <CustomIcons.Crown />, cost: 1 },
  { id: 'pontic', icon: <CustomIcons.Pontic />, cost: 1 },
  { id: 'pilier', icon: <CustomIcons.Abutment />, cost: 1.5 },
  { id: 'veneer', icon: <CustomIcons.Veneer />, cost: 1 },
  { id: 'inlay', icon: <CustomIcons.Inlay />, cost: 1 },
  { id: 'post_core', icon: <CustomIcons.PostCore />, cost: 1 },
  { id: 'coping', icon: <CustomIcons.Coping />, cost: 1 },
  { id: 'reduced_pontic', icon: <CustomIcons.ReducedPontic />, cost: 1 },
  { id: 'implant_planning', icon: <CustomIcons.ImplantPlanning />, cost: 9 },
  { id: 'surgical', icon: <CustomIcons.Surgical />, cost: 6 },
  { id: 'modeles', icon: <CustomIcons.Smile />, cost: 0.5 },
  { id: 'wax_up', icon: <CustomIcons.Smile />, cost: 0.5 },
  { id: 'smile_design', icon: <CustomIcons.Smile />, cost: 1 },
  { id: 'barre', icon: <CustomIcons.Barre />, cost: 1.5 },
];
