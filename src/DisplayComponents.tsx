import { useMediaQuery } from "react-responsive";
// import React from "react";


export const Desktop = ({ children }) => {
  const isDesktop = useMediaQuery({ minWidth: 701 });
  console.log('desktop')
  return isDesktop ? children : null;
};
export const Tablet = ({ children }) => {
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 });
  return isTablet ? children : null;
};
export const Mobile = ({ children }) => {
    console.log('mobile')
  const isMobile = useMediaQuery({ maxWidth: 700 });
  return isMobile ? children : null;
};
export const Default = ({ children }) => {
  const isNotMobile = useMediaQuery({ minWidth: 768 });
  return isNotMobile ? children : null;
};
